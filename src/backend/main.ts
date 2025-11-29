import { completedSetup, electronIsDev, __dirname } from "./setup.js";
import path from "node:path";
import {
	app,
	BrowserWindow,
	dialog,
	ipcMain,
	nativeTheme,
	net,
	protocol,
	session,
} from "electron";
import log from "electron-log";
import electronUpdater from "electron-updater";
import fs from "node:fs";
import {
	fetchScripture,
	fetchChapter,
	fetchChapterCounts,
	fetchAllScripture,
	fetchTranslations,
} from "./database/bible-operations.js";
import {
	fetchAllSongs,
	fetchSongLyrics,
	updateSong,
	filterSongsByPhrase,
	deleteSongById,
	createSong,
} from "./database/song-operations.js";
import {
	appBackground,
	DB_IMPORT_TEMP_DIR,
	DB_PATH,
	SONGS_DB_PATH,
	MEDIA_IMAGES,
	MEDIA_VIDEOS,
	RESOURCES_PATH,
	userData,
	SCHEDULE_ITEMS_PATH,
	getAssetPath,
} from "./constants.js";
import { screen } from "electron/main";
import {
	addTheme,
	deleteTheme,
	fetchAllThemes,
	fetchThemeById,
	updateTheme,
	filterThemes,
} from "./database/theme-operations.js";
import {
	getMediaDestination,
	getMimeType,
	handleErr,
	moveFiles,
} from "./utils.js";
import { SavedSchedule, ScheduleSaveItem, SONG_DB_PATHS } from "./types.js";
import { pathToFileURL } from "node:url";
import handleCustomProtocols from "./helpers/protocols.js";
import { getFonts2 } from "font-list";
import { Worker } from "node:worker_threads";
import {
	getSavedSchedules,
	saveScheduleToDB,
} from "./database/app-operations.js";
// import processSongs from './scripts/songs-importer/index.js'
// import grandiose from 'grandiose'
// const { GrandioseFinder } = grandiose

// const finder = new GrandioseFinder()
// setTimeout(() => {
// 	// Log the discovered sources after 1000ms wait
// 	console.log('NDI Sources: ', finder.getCurrentSources())
// }, 1000)

// processSongs()
// const electronIsDev = false;

const { autoUpdater } = electronUpdater;
let appWindow: BrowserWindow | null = null;
let projectionWindow: BrowserWindow | null = null;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let appReady = false;

const checkAndQuit = () => {
	console.log("Quitting?: ", process.platform, appWindow, projectionWindow);
	if (process.platform !== "darwin" && !appWindow && !projectionWindow) {
		app.quit();
	}
};

class AppUpdater {
	constructor() {
		log.transports.file.level = "info";
		autoUpdater.logger = log;
		autoUpdater.checkForUpdatesAndNotify();
	}
}

const installExtensions = async () => {
	/**
	 * NOTE:
	 * As of writing this comment, Electron does not support the `scripting` API,
	 * which causes errors in the REACT_DEVELOPER_TOOLS extension.
	 * A possible workaround could be to downgrade the extension but you're on your own with that.
	 */
	/*
	const {
		default: electronDevtoolsInstaller,
		//REACT_DEVELOPER_TOOLS,
		REDUX_DEVTOOLS,
	} = await import('electron-devtools-installer')
	// @ts-expect-error Weird behaviour
	electronDevtoolsInstaller.default([REDUX_DEVTOOLS]).catch(console.log)
	*/
};
const PRELOAD_PATH = path.join(__dirname, "preload.js");

protocol.registerSchemesAsPrivileged([
	{
		scheme: "image",
		privileges: {
			supportFetchAPI: true,
			standard: true,
		},
	},
	{
		scheme: "video",
		privileges: {
			supportFetchAPI: true,
			stream: true,
			standard: true,
		},
	},
]);

const spawnAppWindow = async () => {
	if (electronIsDev) await installExtensions();

	const loadingWindow = new BrowserWindow({
		width: 500,
		height: 340,
		center: true,
		icon: getAssetPath("logo.png"),
		title: "Crater Bible Project",
		frame: false,
		show: false,
		backgroundColor: appBackground,
		closable: false,
		movable: false,
		resizable: false,
		transparent: true,
		alwaysOnTop: electronIsDev ? false : true,
	});

	loadingWindow.once("show", () => {
		const { width: awWidth, height: awHeight } =
			screen.getPrimaryDisplay().workAreaSize;

		appWindow = new BrowserWindow({
			width: awWidth,
			height: awHeight,
			icon: getAssetPath("logo.png"),
			title: electronIsDev
				? "Controls Window - Development"
				: "Crater Bible Project",
			show: false,
			autoHideMenuBar: true,
			backgroundColor: appBackground,
			webPreferences: {
				backgroundThrottling: false,
				preload: PRELOAD_PATH,
				devTools: electronIsDev,
			},
		});

		if (electronIsDev) {
			appWindow.loadURL("http://localhost:7241/controls");
		} else {
			appWindow.loadFile("dist/controls.html");
		}

		appWindow.setMenu(null);
		ipcMain.on("controls-window-loaded", () => {
			console.log("DOM IS NOW READY");
			appWindow?.maximize();
			appWindow?.show();
			loadingWindow.hide();
			loadingWindow.close();
		});
		if (electronIsDev) appWindow.webContents.openDevTools({ mode: "right" });

		// Bring projection window to top when main window is focused
		appWindow.on("focus", () => {
			if (projectionWindow && !projectionWindow.isDestroyed()) {
				projectionWindow.moveTop();
				// projectionWindow.setAlwaysOnTop(true);
				// projectionWindow.showInactive();
				// Reset alwaysOnTop after bringing to front to allow other apps to overlay when needed
				// setTimeout(() => {
				// 	if (projectionWindow && !projectionWindow.isDestroyed()) {
				// 		projectionWindow.setAlwaysOnTop(false);
				// 	}
				// }, 100);
			}
		});

		appWindow.on("closed", () => {
			appWindow = null;
			checkAndQuit();
			projectionWindow?.hide();
			projectionWindow?.close();
		});
	});

	if (electronIsDev) {
		loadingWindow.loadURL("http://localhost:7241/loader");
	} else {
		loadingWindow.loadFile("dist/loader.html");
	}

	loadingWindow.webContents.once("dom-ready", () => {
		loadingWindow.show();
	});
};

function spawnProjectionWindow({ x, y }: { x: number; y: number }) {
	projectionWindow = new BrowserWindow({
		width: 800,
		height: 600,
		title: electronIsDev
			? "Projection Window - Development"
			: "Crater Projection Window",
		icon: getAssetPath("logo.png"),
		show: false,
		fullscreen: true,
		frame: false,
		transparent: true, // Allow transparency
		webPreferences: {
			backgroundThrottling: false,
			preload: PRELOAD_PATH,
			// webSecurity: electronIsDev ? false : true,
		},
		x,
		y,
	});

	if (electronIsDev) {
		projectionWindow.loadURL("http://localhost:7241");
	} else {
		projectionWindow.loadFile("dist/index.html");
	}
	projectionWindow.show();
	appWindow?.focus();

	// projectionWindow.setIgnoreMouseEvents(true)
	// if (electronIsDev)
	// 	projectionWindow.webContents.openDevTools({ mode: 'right' })

	projectionWindow.on("closed", () => {
		projectionWindow = null;
		checkAndQuit();
	});
}

app.on("ready", async () => {
	appReady = true;
	new AppUpdater();
	spawnAppWindow();

	protocol.handle("image", (request) => {
		const filePath = pathToFileURL(new URL(request.url).pathname).toString();
		console.log(
			"IMAGE Path: ",
			filePath,
			new URL(request.url),
			pathToFileURL(new URL(request.url).pathname).toString(),
		);
		return net.fetch(filePath);
	});
	// handleCustomProtocols();

	protocol.handle("video", async (request) => {
		try {
			const url = new URL(request.url);
			const fileUrl = pathToFileURL(decodeURI(url.pathname));
			let filePath = decodeURI(fileUrl.pathname).slice(1); // .replace("\\", "");
			console.log(filePath);
			log.info("Serving file from video://", filePath);
			if (!fs.existsSync(filePath)) {
				log.error(`File not found: ${filePath}`);
				return new Response("File not found", { status: 404 });
			}
			const fileStat = fs.statSync(filePath);
			const range = request.headers.get("range");
			let start = 0,
				end = fileStat.size - 1;
			if (range) {
				const match = range.match(/bytes=(\d*)-(\d*)/);
				if (match) {
					start = match[1] ? parseInt(match[1], 10) : start;
					end = match[2] ? parseInt(match[2], 10) : end;
				}
			}
			const chunkSize = end - start + 1;
			log.info(`Serving range: ${start}-${end}/${fileStat.size}`);
			const stream = fs.createReadStream(filePath, { start, end });
			const mimeType = getMimeType(filePath);
			// @ts-ignore
			return new Response(stream, {
				status: range ? 206 : 200,
				headers: {
					"Content-Type": mimeType,
					"Content-Range": `bytes ${start}-${end}/${fileStat.size}`,
					"Accept-Ranges": "bytes",
					"Content-Length": chunkSize,
				},
			});
		} catch (error) {
			log.error("Error handling media protocol:", error);
			return new Response("Internal Server Error", { status: 500 });
		}
	});

	const handleDisplaysChange = () => {
		appWindow?.webContents.send("displays-updated", screen.getAllDisplays());
	};
	screen.on("display-added", handleDisplaysChange);
	screen.on("display-removed", handleDisplaysChange);
});

/*
 * ======================================================================================
 *                                IPC Main Events
 * ======================================================================================
 */

ipcMain.handle("sample:ping", () => {
	return "pong";
});

ipcMain.handle("fetch-chapter-counts", () => {
	const counts = fetchChapterCounts();
	// console.log("Here are the Chapter Counts: ", counts);
	return counts;
});

ipcMain.handle("fetch-chapter", (_, chapterInfo) => {
	console.log("Code - Fetching Scripture Chapter Data", chapterInfo);
	// console.log(fetchChapter(chapterInfo));
	return fetchChapter(chapterInfo);
});

ipcMain.handle("fetch-scripture", (_, scriptureInfo) => {
	console.log("Fetch Scripture Arguments: ", scriptureInfo);
	return fetchScripture(scriptureInfo);
});
ipcMain.handle("fetch-all-scripture", (_, version) =>
	fetchAllScripture(version),
);
ipcMain.handle("fetch-scripture-translations", fetchTranslations);

ipcMain.handle("fetch-songs", fetchAllSongs);
ipcMain.handle("fetch-lyrics", (_, songId) => fetchSongLyrics(songId));
ipcMain.handle("create-song", (_, newSong) => createSong(newSong));
ipcMain.handle("update-song", (_, newInfo) => updateSong(newInfo));
ipcMain.handle("filter-songs", (_, phrase) => filterSongsByPhrase(phrase));
ipcMain.handle("delete-song", (_, songId) => deleteSongById(songId));
ipcMain.handle("get-all-displays", () => {
	if (appReady) {
		return screen.getAllDisplays();
	}
});

ipcMain.handle("dark-mode:toggle", () => {
	if (nativeTheme.shouldUseDarkColors) {
		nativeTheme.themeSource = "light";
	} else {
		nativeTheme.themeSource = "dark";
	}
	return nativeTheme.shouldUseDarkColors;
});

ipcMain.on("dark-mode:update", (_, newTheme: "light" | "dark") => {
	nativeTheme.themeSource = newTheme;
	return nativeTheme.shouldUseDarkColors;
});

ipcMain.on("dark-mode:system", () => {
	nativeTheme.themeSource = "system";
});

ipcMain.on("open-projection", (_, { x, y }: { x: number; y: number }) => {
	const coords = { x, y };
	console.log("Triggered open Projection Window: ", x, y);
	if (!projectionWindow) {
		const display = screen.getDisplayNearestPoint({ x, y });
		if (!display) {
			coords.x = 0;
			coords.y = 0;
		}
		console.log(coords, display, screen.getAllDisplays());
		spawnProjectionWindow(coords);
	}
});

ipcMain.on("close-projection", () => {
	if (projectionWindow) {
		projectionWindow.close();
		projectionWindow = null;
	} else {
		console.warn("Projection window is already closed or does not exist.");
	}
});

ipcMain.handle("get-system-fonts", () => getFonts2({ disableQuoting: true }));

ipcMain.handle("add-theme", (_, data) => addTheme(data));
ipcMain.handle("update-theme", (_, id, data) => updateTheme(id, data));
ipcMain.handle("delete-theme", (_, id) => deleteTheme(id));
ipcMain.handle("fetch-themes-meta", () => fetchAllThemes());
ipcMain.handle("fetch-theme", (_, id) => fetchThemeById(id));
ipcMain.handle("filter-themes", (_, type) => filterThemes(type));

console.log("TEMPORARY DIRECTORY: ", app.getPath("temp"));

const processSongs = (songsPaths: SONG_DB_PATHS) => {
	const songImportWorkerPath = path.join(
		__dirname,
		"scripts/handle-imports.js",
	);
	console.log(songImportWorkerPath);
	return new Promise((resolve, reject) => {
		const worker = new Worker(songImportWorkerPath, {
			workerData: { paths: songsPaths, songsDbPath: SONGS_DB_PATH },
		});

		worker.on("message", (m) => {
			console.log("DONE: ", m);
			if (m.isComplete) {
				resolve({
					success: true,
					message: `${m.count} Songs Imported Successfully`,
				});
			}
		});
		worker.on("error", (err) => {
			console.log("Worker Error: ", err);
			resolve({
				success: false,
				message: "Failed to import songs",
			});
		});
	});
};

ipcMain.handle("import-easyworship-songs", async () => {
	console.log(app.getPath("temp"));
	if (appWindow) {
		const result = await dialog.showOpenDialog(appWindow, {
			properties: ["openFile", "multiSelections"],
			filters: [
				{
					name: "Easyworship Song Databases",
					extensions: ["db"],
				},
			],
			// defaultPath:
			// 'C:UsersPublicDocumentsSoftouchEasyworship',
		});
		if (result.filePaths.length > 2) {
			return {
				type: "error",
				message: `You selected more than 2 files`,
			};
		}
		const baseNameArr = result.filePaths.map((file) => path.basename(file));
		const DB_NAMES = ["Songs.db", "SongWords.db"].filter(
			(basepath) => !baseNameArr.includes(basepath),
		);
		console.log("Selected does not include: ", DB_NAMES);
		if (DB_NAMES.length) {
			return {
				type: "error",
				message: `You did not select a ${DB_NAMES.join(" and ")} file`,
			};
		}

		// Make sure the import-databases temp folder is empty
		for (const file of await fs.promises.readdir(DB_IMPORT_TEMP_DIR)) {
			await fs.promises.unlink(path.join(DB_IMPORT_TEMP_DIR, file));
		}

		// Copy the db files to the temp dir so they don't get deleted while being transacted with
		const songsPaths: SONG_DB_PATHS = {
			SONG_DB: "",
			SONG_WORDS_DB: "",
		};
		for (const file of result.filePaths) {
			const fileBasename = path.basename(file);
			const destination = path.join(DB_IMPORT_TEMP_DIR, fileBasename);
			await fs.promises.copyFile(file, destination);
			songsPaths[fileBasename === "Songs.db" ? "SONG_DB" : "SONG_WORDS_DB"] =
				destination;
		}

		return await processSongs(songsPaths);
	}
});

interface ImportOptions {
	filters: ("images" | "videos")[];
	multiSelect: boolean;
}

const filterObj = {
	images: { name: "Images", extensions: ["jpg", "png", "gif"] },
	videos: { name: "Videos", extensions: ["mkv", "avi", "mp4"] },
};

type FileDialogProperties =
	| "openFile"
	| "openDirectory"
	| "multiSelections"
	| "showHiddenFiles"
	| "createDirectory"
	| "promptToCreate"
	| "noResolveAliases"
	| "treatPackageAsDirectory"
	| "dontAddToRecent";

ipcMain.handle(
	"import-media",
	async (_, { filters, multiSelect }: ImportOptions) => {
		if (appWindow) {
			const properties: FileDialogProperties[] = ["openFile"];
			if (multiSelect) properties.push("multiSelections");
			// const _filters = filters.map((filter) => filterObj[filter]);
			// console.log("FILTERS: ", _filters);

			const result = await dialog.showOpenDialog(appWindow, {
				properties,
				filters:
					filters.length === 2
						? [{ name: "All Files", extensions: ["*"] }]
						: [filterObj[filters[0]]],
				// filters: filters.map((filter) => filterObj[filter]), // electron on linux doesn't allow both filters for some reason
			});
			console.log("Dialog Result: ", result);

			if (!result.filePaths.length) {
				// No files selected, do nothing
				return {
					success: false,
					message: "No files selected",
					paths: [],
				};
			}

			const destinations: string[] = [];
			for (const filePath of result.filePaths) {
				const destination = getMediaDestination(filePath);
				console.log(filePath, destination);
				if (!destination) continue;

				destinations.push(destination);
				try {
					await fs.promises.copyFile(filePath, destination);
				} catch (err) {
					console.error("An error occurred while copying the file:", err);
				}
			}

			const successful = Boolean(destinations.length);
			return {
				success: successful,
				message: successful
					? `${destinations.length} media imported successfully`
					: `Failed to import ${result.filePaths.length - destinations.length} media`,
				paths: destinations,
			};
		}
	},
);

ipcMain.handle("get-images", async () => {
	try {
		const files = await fs.promises.readdir(MEDIA_IMAGES);
		return files.map((name, index) => ({
			id: index,
			title: name,
			type: "image",
			path: path.join(MEDIA_IMAGES, name),
		}));
	} catch (err) {
		console.error("Error reading directory:", err);
		return [];
	}
});

ipcMain.handle("get-videos", async () => {
	try {
		const files = await fs.promises.readdir(MEDIA_VIDEOS);
		console.log("GETTING VIDEOS: ", files);
		return files.map((name, index) => ({
			id: index,
			title: name,
			type: "video",
			path: path.join(MEDIA_VIDEOS, name),
		}));
	} catch (err) {
		console.error("Error reading directory:", err);
		return [];
	}
});

ipcMain.handle("delete-media", async (_, path) => {
	try {
		await fs.promises.rm(path);
		return {
			type: "success",
			message: "Deleted successfully",
		};
	} catch {
		console.error("Failed to delete media");
	}
});

ipcMain.handle(
	"save-schedule",
	async (
		_,
		{ schedule, overwrite }: { schedule: ScheduleSaveItem; overwrite: boolean },
	) => {
		console.log("SENT DATA: ", _, schedule);
		const filePath = path.join(SCHEDULE_ITEMS_PATH, `${schedule.name}.json`);
		if (!overwrite && fs.existsSync(filePath)) {
			return {
				success: false,
				message: "File already exists in schedules directory",
			};
		} else {
			await fs.promises.writeFile(filePath, JSON.stringify(schedule));
			return saveScheduleToDB(filePath, schedule.name);
		}
	},
);

ipcMain.handle("get-recent-schedules", getSavedSchedules);

ipcMain.handle("get-schedule-data", async (_, schedule: SavedSchedule) => {
	return await fs.promises.readFile(schedule.path, { encoding: "utf8" });
});
