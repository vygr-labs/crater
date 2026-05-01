import { completedSetup, electronIsDev, __dirname } from "./setup.js";
import path from "node:path";
import { platform } from "node:os";
import {
	app,
	BrowserWindow,
	dialog,
	ipcMain,
	nativeTheme,
	net,
	protocol,
	session,
	shell,
} from "electron";
import log from "electron-log";
import electronUpdater from "electron-updater";
import fs from "node:fs";
import logger from "./logger.js";
import {
	fetchScripture,
	fetchChapter,
	fetchChapterCounts,
	fetchAllScripture,
	fetchTranslations,
} from "./database/bible-operations.js";
import {
	fetchStrongsDefinition,
	fetchMultipleStrongsDefinitions,
	searchStrongsDefinitions,
	fetchStrongsBibleVerse,
	fetchStrongsBibleChapter,
	fetchVerseWithDefinitions,
	hasStrongsBibleData,
	hasStrongsDictData,
	getAllStrongsEntries,
	type FetchStrongsBibleParams,
} from "./database/strongs-operations.js";
import {
	fetchAllSongs,
	fetchSongLyrics,
	updateSong,
	filterSongsByPhrase,
	searchSongs,
	deleteSongById,
	createSong,
	rebuildAllSongsFtsIndex,
	initializeSongsFtsIndexIfEmpty,
} from "./database/song-operations.js";
import {
	searchScriptures,
	rebuildScriptureFtsIndex,
	initializeScriptureFtsIndexIfEmpty,
} from "./database/bible-operations.js";
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
	getShippedDefaultThemes,
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
import { ndiSender, type NDISenderConfig } from "./ndi/index.js";
import url from "url";
import {
	registerRemoteIpcHandlers,
	setAppWindow as setRemoteAppWindow,
} from "./remote/index.js";
// import processSongs from './scripts/songs-importer/index.js'

// Global error handlers to catch uncaught exceptions in production
process.on("uncaughtException", (error) => {
	logger.error("Uncaught Exception:", error.message, error.stack);
	dialog.showErrorBox(
		"Unexpected Error",
		`An unexpected error occurred:\n\n${error.message}\n\nCheck logs at: ${logger.getLogDir()}`,
	);
});

process.on("unhandledRejection", (reason, promise) => {
	logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// processSongs()
// const electronIsDev = false;

const { autoUpdater } = electronUpdater;
let appWindow: BrowserWindow | null = null;
let projectionWindow: BrowserWindow | null = null;
let authoritativeOverlay = true;

// Get platform-specific app icon (Windows requires .ico)
const getAppIcon = () => {
	if (platform() === "win32") {
		return getAssetPath("favicon.ico");
	}
	return getAssetPath("logo.png");
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let appReady = false;

const checkAndQuit = () => {
	logger.debug("Checking quit conditions", {
		platform: process.platform,
		appWindow: !!appWindow,
		projectionWindow: !!projectionWindow,
	});
	if (process.platform !== "darwin" && !appWindow && !projectionWindow) {
		logger.debug("Quitting Now");
		// app.quit();
		app.exit(0);
	}
};

// Quit when all windows are closed (except on macOS)
app.on("window-all-closed", () => {
	logger.debug("All windows closed");
	if (process.platform !== "darwin") {
		// app.quit();
		app.exit(0);
	}
});

// Release the NDI runtime cleanly so subsequent launches don't see a stale
// sender lingering on the network.
app.on("before-quit", () => {
	ndiSender.shutdown();
});

ipcMain.on("update-app-settings", (event, settings) => {
	if (settings.authoritativeOverlay !== undefined) {
		authoritativeOverlay = settings.authoritativeOverlay;
	}
});

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
		icon: getAppIcon(),
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
			icon: getAppIcon(),
			title: electronIsDev
				? "Controls Window - Development"
				: "Crater Bible Project",
			show: false,
			autoHideMenuBar: true,
			backgroundColor: appBackground,
			webPreferences: {
				backgroundThrottling: false,
				preload: PRELOAD_PATH,
				// devTools: true, // Always enable for debugging
			},
		});

		const controlsUrl = electronIsDev
			? "http://localhost:7241/controls"
			: url.format({
					slashes: true,
					protocol: "file:",
					pathname: path.resolve(app.getAppPath(), "dist/controls.html"),
				});
		appWindow.loadURL(controlsUrl);

		appWindow.setMenu(null);
		
		// Set up remote control
		setRemoteAppWindow(appWindow);
		
		// ipcMain.on("controls-window-loaded", () => {
			logger.info("Controls window DOM ready");
			appWindow?.maximize();
			appWindow?.show();
			loadingWindow.hide();
			loadingWindow.close();
		// });
		// Always open DevTools for debugging (temporarily)
		if (electronIsDev) {
			appWindow.webContents.openDevTools({ mode: "right" });
		}

		// Add keyboard shortcut to open devtools in production (Ctrl+Shift+I)
		appWindow.webContents.on("before-input-event", (event, input) => {
			if (input.control && input.shift && input.key.toLowerCase() === "i") {
				appWindow?.webContents.toggleDevTools();
				event.preventDefault();
			}
		});

		// Bring projection window to top when main window is focused (only if on different screens)
		appWindow.on("focus", () => {
			if (
				authoritativeOverlay &&
				projectionWindow &&
				!projectionWindow.isDestroyed() &&
				appWindow
			) {
				// Get the display for each window
				const appBounds = appWindow.getBounds();
				const projBounds = projectionWindow.getBounds();
				const appDisplay = screen.getDisplayNearestPoint({
					x: appBounds.x + appBounds.width / 2,
					y: appBounds.y + appBounds.height / 2,
				});
				const projDisplay = screen.getDisplayNearestPoint({
					x: projBounds.x + projBounds.width / 2,
					y: projBounds.y + projBounds.height / 2,
				});

				// Only bring projection to top if on different displays
				if (appDisplay.id !== projDisplay.id) {
					projectionWindow.moveTop();
				}
			}
		});

		// Track if close is confirmed (to prevent re-asking)
		let closeConfirmed = false;

		// Handle confirmed close from renderer - must be set up before close event
		ipcMain.removeAllListeners("confirm-close");
		ipcMain.on("confirm-close", () => {
			logger.debug("Received confirm-close from renderer");
			closeConfirmed = true;
			appWindow?.close();
		});

		// Intercept close to check for unsaved changes
		appWindow.on("close", (event) => {
			logger.debug("Close event triggered, closeConfirmed:", closeConfirmed);
			if (!closeConfirmed && appWindow) {
				event.preventDefault();
				// Ask renderer if there are unsaved changes
				logger.debug("Sending check-before-close to renderer");
				appWindow.webContents.send("check-before-close");
			}
		});

		appWindow.on("closed", () => {
			appWindow = null;
			if (projectionWindow && !projectionWindow.isDestroyed()) {
				projectionWindow.close();
			}
			checkAndQuit();
		});
	});

	const loaderUrl = electronIsDev
		? "http://localhost:7241/loader"
		: url.format({
				slashes: true,
				protocol: "file:",
				pathname: path.resolve(app.getAppPath(), "dist/loader.html"),
			});
	loadingWindow.loadURL(loaderUrl);

	loadingWindow.webContents.once("dom-ready", () => {
		loadingWindow.show();
	});
};

function spawnProjectionWindow({
	x,
	y,
	width,
	height,
	useCustomBounds,
	hidden = false,
}: {
	x: number;
	y: number;
	width: number;
	height: number;
	useCustomBounds: boolean;
	hidden?: boolean;
}) {
	// For visible windows we let the OS handle sizing via fullscreen=true when
	// useCustomBounds is false. For hidden windows there's no display to go
	// fullscreen on, so the constructor's width/height are exactly what NDI
	// receivers will see — we must use the real projection-display bounds even
	// when the user hasn't explicitly opted into custom bounds. Defaulting to
	// 800x600 (as the visible path does) would leave NDI streaming at SD and
	// every receiver would have to upscale.
	const targetWidth = hidden ? width : useCustomBounds ? width : 800;
	const targetHeight = hidden ? height : useCustomBounds ? height : 600;

	projectionWindow = new BrowserWindow({
		width: targetWidth,
		height: targetHeight,
		title: electronIsDev
			? "Projection Window - Development"
			: "Crater Projection Window",
		icon: getAppIcon(),
		show: false,
		fullscreen: !hidden && !useCustomBounds,
		frame: false,
		transparent: true, // Allow transparency
		// Skip task-bar entry when the window is only used as an NDI source so
		// users don't see a phantom "Crater Projection Window" they didn't open.
		skipTaskbar: hidden,
		// Critical for NDI-without-Live: ensures the renderer paints (and our
		// beginFrameSubscription callback fires) even when the window has
		// never been shown. Without this, hidden windows skip painting until
		// first show.
		paintWhenInitiallyHidden: true,
		webPreferences: {
			backgroundThrottling: false,
			preload: PRELOAD_PATH,
			// webSecurity: electronIsDev ? false : true,
		},
		x,
		y,
	});

	const projectionUrl = electronIsDev
		? "http://localhost:7241"
		: url.format({
				slashes: true,
				protocol: "file:",
				pathname: path.resolve(app.getAppPath(), "dist/index.html"),
			});
	projectionWindow.loadURL(projectionUrl);
	if (!hidden) {
		projectionWindow.show();
		appWindow?.focus();
	}

	// projectionWindow.setIgnoreMouseEvents(true)
	// if (electronIsDev)
	// 	projectionWindow.webContents.openDevTools({ mode: 'right' })

	// Auto-start the NDI source as soon as the projection window has a real
	// surface to capture. did-finish-load is the earliest point where
	// beginFrameSubscription will yield non-empty frames.
	projectionWindow.webContents.once("did-finish-load", () => {
		if (!projectionWindow) return;
		ndiSender
			.start(projectionWindow)
			.then((ok) => {
				if (!ok) {
					logger.warn(
						"NDI auto-start failed; sender will remain offline until restarted via IPC",
					);
				}
			})
			.catch((err) => {
				logger.error(
					"NDI auto-start threw",
					err instanceof Error ? err.message : err,
				);
			});
	});

	projectionWindow.on("closed", () => {
		ndiSender.stop();
		projectionWindow = null;
		checkAndQuit();
	});
}

app.on("ready", async () => {
	appReady = true;
	new AppUpdater();
	spawnAppWindow();

	// Register remote control IPC handlers
	registerRemoteIpcHandlers();

	// Initialize FTS indexes if they are empty
	try {
		initializeSongsFtsIndexIfEmpty();
		initializeScriptureFtsIndexIfEmpty();
	} catch (error) {
		log.error("Error initializing FTS indexes:", error);
	}

	protocol.handle("image", (request) => {
		log.info("Image protocol handler called", { url: request.url });
		try {
			const url = new URL(request.url);
			log.info("Parsed URL", { pathname: url.pathname });
			const fileUrl = pathToFileURL(decodeURI(url.pathname));
			let filePath = decodeURI(fileUrl.pathname).slice(1);
			log.info("Serving image", { filePath, fileUrl: fileUrl.toString() });
			if (!fs.existsSync(filePath)) {
				log.error(`Image not found: ${filePath}`);
				return new Response("Image not found", { status: 404 });
			}
			return net.fetch(fileUrl.toString());
		} catch (error) {
			log.error("Error handling image protocol:", error);
			return new Response("Internal Server Error", { status: 500 });
		}
	});
	// handleCustomProtocols();

	protocol.handle("video", async (request) => {
		try {
			const url = new URL(request.url);
			const fileUrl = pathToFileURL(decodeURI(url.pathname));
			let filePath = decodeURI(fileUrl.pathname).slice(1); // .replace("\\", "");
			logger.debug("Serving video file", { filePath });
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
	logger.debug("Fetching chapter data", chapterInfo);
	return fetchChapter(chapterInfo);
});

ipcMain.handle("fetch-scripture", (_, scriptureInfo) => {
	logger.debug("Fetching scripture", scriptureInfo);
	return fetchScripture(scriptureInfo);
});
ipcMain.handle("fetch-all-scripture", (_, version) =>
	fetchAllScripture(version),
);
ipcMain.handle("fetch-scripture-translations", fetchTranslations);

// Strong's Concordance handlers - Dictionary
ipcMain.handle("fetch-strongs", (_, reference: string) => {
	logger.debug("Fetching Strong's definition", { reference });
	return fetchStrongsDefinition(reference);
});
ipcMain.handle("fetch-multiple-strongs", (_, references: string[]) => {
	logger.debug("Fetching multiple Strong's definitions", {
		count: references.length,
	});
	return fetchMultipleStrongsDefinitions(references);
});
ipcMain.handle("search-strongs", (_, keyword: string) => {
	logger.debug("Searching Strong's definitions", { keyword });
	return searchStrongsDefinitions(keyword);
});
ipcMain.handle("get-all-strongs", (_, limit?: number, offset?: number) => {
	logger.debug("Getting all Strong's entries", { limit, offset });
	return getAllStrongsEntries(limit ?? 100, offset ?? 0);
});

// Strong's Concordance handlers - Bible with tags
ipcMain.handle(
	"fetch-strongs-bible-verse",
	(_, params: FetchStrongsBibleParams) => {
		logger.debug("Fetching Strong's Bible verse", params);
		return fetchStrongsBibleVerse(params);
	},
);
ipcMain.handle(
	"fetch-strongs-bible-chapter",
	(_, params: FetchStrongsBibleParams) => {
		logger.debug("Fetching Strong's Bible chapter", params);
		return fetchStrongsBibleChapter(params);
	},
);
ipcMain.handle(
	"fetch-verse-with-definitions",
	(_, params: FetchStrongsBibleParams) => {
		logger.debug("Fetching verse with Strong's definitions", params);
		return fetchVerseWithDefinitions(params);
	},
);
ipcMain.handle("check-strongs-data", () => {
	return {
		hasBible: hasStrongsBibleData(),
		hasDictionary: hasStrongsDictData(),
	};
});

ipcMain.handle("fetch-songs", fetchAllSongs);
ipcMain.handle("fetch-lyrics", (_, songId) => fetchSongLyrics(songId));
ipcMain.handle("create-song", (_, newSong) => createSong(newSong));
ipcMain.handle("update-song", (_, newInfo) => updateSong(newInfo));
ipcMain.handle("filter-songs", (_, phrase) => filterSongsByPhrase(phrase));
ipcMain.handle("search-songs", (_, query) => searchSongs(query));
ipcMain.handle("delete-song", (_, songId) => deleteSongById(songId));
ipcMain.handle("rebuild-songs-fts", () => rebuildAllSongsFtsIndex());
ipcMain.handle("search-scriptures", (_, query, version) =>
	searchScriptures(query, version),
);
ipcMain.handle("rebuild-scriptures-fts", () => rebuildScriptureFtsIndex());
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

ipcMain.on(
	"open-projection",
	(
		_,
		{
			x,
			y,
			width,
			height,
			useCustomBounds,
		}: {
			x: number;
			y: number;
			width: number;
			height: number;
			useCustomBounds: boolean;
		},
	) => {
		const bounds = { x, y, width, height, useCustomBounds };
		logger.info("Opening projection window", bounds);

		// If a hidden projection window already exists (because NDI was started
		// before going Live), promote it to visible instead of spawning a new
		// one — the renderer is already loaded and NDI is already attached.
		//
		// Two subtleties to avoid the well-known "Go Live flash":
		//   1. setBounds before showing, so the window appears in its final
		//      position from the very first painted frame — no jump from
		//      origin to projection display.
		//   2. showInactive() instead of show(): show() activates the window,
		//      which briefly raises it above the controls window before our
		//      appWindow.focus() pushes it back. showInactive() never steals
		//      focus, so there's nothing to push back — the controls stay on
		//      top throughout.
		//
		// We also skip setFullScreen(true) here. The hidden window was created
		// at the projection display's exact bounds with frame:false +
		// transparent:true, so on Windows it's visually indistinguishable from
		// real fullscreen, and it avoids the activate-and-flip transition that
		// fullscreen mode causes.
		if (projectionWindow && !projectionWindow.isDestroyed()) {
			if (!projectionWindow.isVisible()) {
				// Same workArea-vs-bounds correction as the hidden-spawn path:
				// the renderer sent workArea, but for fullscreen intent we want
				// the display's full bounds so the visible window covers the
				// taskbar area like real fullscreen does.
				const targetBounds = resolveProjectionBounds({
					x,
					y,
					width,
					height,
					useCustomBounds,
				});
				projectionWindow.setSkipTaskbar(false);
				projectionWindow.setBounds({
					x: targetBounds.x,
					y: targetBounds.y,
					width: targetBounds.width,
					height: targetBounds.height,
				});
				projectionWindow.showInactive();
				logger.info("Promoted hidden projection window to visible");
			}
			return;
		}

		const display = screen.getDisplayNearestPoint({ x, y });
		if (!display) {
			bounds.x = 0;
			bounds.y = 0;
		}
		logger.debug("Projection window display info", {
			bounds,
			displayCount: screen.getAllDisplays().length,
		});
		spawnProjectionWindow(bounds);
	},
);

ipcMain.on("close-projection", () => {
	if (!projectionWindow || projectionWindow.isDestroyed()) {
		logger.warn("Projection window is already closed or does not exist");
		return;
	}
	// If NDI is still streaming we keep the renderer alive (and hidden) so
	// receivers don't see the source disappear when the operator just wanted
	// to end Live. NDI keeps consuming frames from the hidden window.
	if (ndiSender.getStatus().isStreaming) {
		projectionWindow.setSkipTaskbar(true);
		if (projectionWindow.isFullScreen()) projectionWindow.setFullScreen(false);
		projectionWindow.hide();
		logger.info("Projection window hidden (NDI still streaming)");
		return;
	}
	projectionWindow.close();
	projectionWindow = null;
	logger.info("Projection window closed");
});

ipcMain.handle("get-system-fonts", () => getFonts2({ disableQuoting: true }));

ipcMain.handle("add-theme", (_, data) => addTheme(data));
ipcMain.handle("update-theme", (_, id, data) => updateTheme(id, data));
ipcMain.handle("delete-theme", (_, id) => deleteTheme(id));
ipcMain.handle("fetch-themes-meta", () => fetchAllThemes());
ipcMain.handle("fetch-theme", (_, id) => fetchThemeById(id));
ipcMain.handle("filter-themes", (_, type) => filterThemes(type));
ipcMain.handle("get-shipped-default-themes", () => getShippedDefaultThemes());

/*
 * ======================================================================================
 *                                Logging IPC Handlers
 * ======================================================================================
 */

// Log from renderer process
ipcMain.on("log", (_, level: string, message: string, ...args: unknown[]) => {
	logger.renderer(level, message, ...args);
});

// Export logs to desktop
ipcMain.handle("export-logs", async () => {
	try {
		const exportPath = await logger.exportLogs();
		logger.info(`Logs exported to: ${exportPath}`);
		return { success: true, path: exportPath };
	} catch (error) {
		logger.error("Failed to export logs:", error);
		return { success: false, error: String(error) };
	}
});

// Open log folder
ipcMain.handle("open-log-folder", () => {
	logger.openLogFolder();
	return true;
});

// Get log contents
ipcMain.handle("get-logs", () => {
	return logger.getLogContents();
});

// Get system info
ipcMain.handle("get-system-info", () => {
	return logger.getSystemInfo();
});

// Clear logs
ipcMain.handle("clear-logs", () => {
	logger.clearLogs();
	return true;
});

// Send logs via email
ipcMain.handle("send-logs-email", async (_, userMessage: string) => {
	try {
		// First export logs to desktop
		const exportPath = await logger.exportLogs();
		// Generate mailto link
		const mailtoLink = logger.generateSupportEmail(userMessage);
		// Open default email client
		shell.openExternal(mailtoLink);
		logger.info("Opened email client for log submission");
		return { success: true, logPath: exportPath };
	} catch (error) {
		logger.error("Failed to prepare logs for email:", error);
		return { success: false, error: String(error) };
	}
});

logger.debug("Temporary directory", { path: app.getPath("temp") });

const processSongs = (songsPaths: SONG_DB_PATHS) => {
	const songImportWorkerPath = path.join(
		__dirname,
		"scripts/handle-imports.js",
	);
	logger.debug("Starting song import worker", {
		workerPath: songImportWorkerPath,
	});
	return new Promise((resolve, reject) => {
		const worker = new Worker(songImportWorkerPath, {
			workerData: { paths: songsPaths, songsDbPath: SONGS_DB_PATH },
		});

		worker.on("message", (m) => {
			if (m.type === "progress") {
				if (appWindow) {
					appWindow.webContents.send("import-progress", m);
				}
				return;
			}

			logger.info("Song import completed", m);
			if (m.isComplete) {
				resolve({
					success: true,
					message: `${m.count} Songs Imported Successfully`,
				});
			}
		});
		worker.on("error", (err) => {
			logger.error("Song import worker error", err);
			resolve({
				success: false,
				message: "Failed to import songs",
			});
		});
	});
};

ipcMain.handle("import-easyworship-songs", async () => {
	logger.debug("Opening EasyWorship song import dialog");
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
		if (DB_NAMES.length) {
			logger.warn("Missing required database files", { missing: DB_NAMES });
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

		const importResult = await processSongs(songsPaths);

		// Rebuild FTS index after importing songs
		// if (importResult && (importResult as { success: boolean }).success) {
		// 	logger.info("Rebuilding FTS index after song import...");
		// 	rebuildAllSongsFtsIndex();
		// 	logger.info("FTS index rebuilt successfully");
		// }

		return importResult;
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
			logger.debug("Media import dialog result", {
				fileCount: result.filePaths.length,
			});

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
				logger.debug("Copying media file", { source: filePath, destination });
				if (!destination) continue;

				destinations.push(destination);
				try {
					await fs.promises.copyFile(filePath, destination);
				} catch (err) {
					logger.error("Failed to copy media file", {
						filePath,
						destination,
						error: err,
					});
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
		logger.error("Error reading images directory", err);
		return [];
	}
});

ipcMain.handle("get-videos", async () => {
	try {
		const files = await fs.promises.readdir(MEDIA_VIDEOS);
		logger.debug("Retrieved videos", { count: files.length });
		return files.map((name, index) => ({
			id: index,
			title: name,
			type: "video",
			path: path.join(MEDIA_VIDEOS, name),
		}));
	} catch (err) {
		logger.error("Error reading videos directory", err);
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
	} catch (err) {
		logger.error("Failed to delete media", { path, error: err });
	}
});

ipcMain.handle(
	"save-schedule",
	async (
		_,
		{ schedule, overwrite }: { schedule: ScheduleSaveItem; overwrite: boolean },
	) => {
		logger.debug("Saving schedule", { name: schedule.name, overwrite });
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

/*
 * ======================================================================================
 *                                NDI IPC Handlers
 * ======================================================================================
 */

ipcMain.handle("ndi-get-version", () => {
	return ndiSender.getVersion();
});

ipcMain.handle("ndi-is-supported", () => {
	return ndiSender.isSupportedCPU();
});

ipcMain.handle("ndi-get-status", () => {
	return ndiSender.getStatus();
});

/**
 * When the user has chosen "fullscreen on display" (useCustomBounds=false),
 * the renderer hands us display.workArea (which excludes the taskbar). That's
 * fine for visible windows because real OS fullscreen mode covers the taskbar
 * area on its own — but a hidden window has no fullscreen escape hatch, and
 * the visible promote path skips fullscreen too. In both cases we'd publish
 * NDI at workArea size (e.g. 1920x1020) instead of the display's true 16:9
 * dimensions, leaving black bars in receivers.
 *
 * This helper resolves the bounds to the display's full size whenever fullscreen
 * was the user's intent, so NDI / promoted windows match what an actual
 * fullscreen Live session would produce.
 */
function resolveProjectionBounds(b: {
	x: number;
	y: number;
	width: number;
	height: number;
	useCustomBounds: boolean;
}) {
	if (b.useCustomBounds) return b;
	const display = screen.getDisplayNearestPoint({ x: b.x, y: b.y });
	if (!display) return b;
	return {
		...b,
		x: display.bounds.x,
		y: display.bounds.y,
		width: display.bounds.width,
		height: display.bounds.height,
	};
}

/**
 * Wait for a window's first paint to land. We need this before subscribing to
 * frames — otherwise the very first NDI frames are empty buffers.
 */
async function waitForProjectionLoad(win: BrowserWindow): Promise<void> {
	if (!win.webContents.isLoading()) return;
	await new Promise<void>((resolve) => {
		const done = () => {
			win.webContents.off("did-finish-load", done);
			resolve();
		};
		win.webContents.once("did-finish-load", done);
	});
}

ipcMain.handle(
	"ndi-start",
	async (
		_,
		config?: Partial<NDISenderConfig> & {
			projectionBounds?: {
				x: number;
				y: number;
				width: number;
				height: number;
				useCustomBounds: boolean;
			};
		},
	) => {
		// Without an existing projection window we spawn one off-screen so NDI
		// can stream without the operator having to "Go Live" first. The hidden
		// window paints normally because of paintWhenInitiallyHidden + the
		// disabled background throttling.
		if (!projectionWindow || projectionWindow.isDestroyed()) {
			const requestedBounds = config?.projectionBounds ?? {
				x: 0,
				y: 0,
				width: 1920,
				height: 1080,
				useCustomBounds: true,
			};
			// Use display.bounds (full size, taskbar inclusive) when the user's
			// intent was "fullscreen on display"; otherwise honour the custom
			// bounds verbatim. Without this, NDI ships at workArea height and
			// receivers show black bars.
			const fallbackBounds = resolveProjectionBounds(requestedBounds);
			logger.info("Spawning hidden projection window for NDI", fallbackBounds);
			spawnProjectionWindow({ ...fallbackBounds, hidden: true });
			if (projectionWindow) {
				await waitForProjectionLoad(projectionWindow);
			}
			// The did-finish-load hook in spawnProjectionWindow auto-starts NDI.
			// Wait a beat so its result is reflected in getStatus().
			await new Promise((r) => setTimeout(r, 100));
			return {
				success: ndiSender.getStatus().isStreaming,
				message: ndiSender.getStatus().isStreaming
					? "NDI streaming started (hidden output)"
					: "Failed to start NDI streaming",
				status: ndiSender.getStatus(),
			};
		}

		const { projectionBounds: _ignored, ...senderConfig } = config ?? {};
		const success = await ndiSender.start(projectionWindow, senderConfig);
		return {
			success,
			message: success
				? "NDI streaming started"
				: "Failed to start NDI streaming",
			status: ndiSender.getStatus(),
		};
	},
);

ipcMain.handle("ndi-stop", () => {
	ndiSender.stop();
	// If the projection window only exists because NDI spawned it (hidden,
	// never shown), close it now — there's nothing else keeping it open.
	if (
		projectionWindow &&
		!projectionWindow.isDestroyed() &&
		!projectionWindow.isVisible()
	) {
		projectionWindow.close();
		projectionWindow = null;
		logger.info("Closed hidden projection window after NDI stop");
	}
	return {
		success: true,
		message: "NDI streaming stopped",
		status: ndiSender.getStatus(),
	};
});

ipcMain.handle(
	"ndi-update-config",
	async (_, config: Partial<NDISenderConfig>) => {
		const success = await ndiSender.updateConfig(config);
		return {
			success,
			message: success
				? "NDI configuration updated"
				: "Failed to update NDI configuration",
			status: ndiSender.getStatus(),
		};
	},
);

