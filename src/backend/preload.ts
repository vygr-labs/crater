/* eslint-disable @typescript-eslint/no-var-requires */
// Electron doesnt support ESM for renderer process. Alternatively, pass this file
// through a bundler but that feels like an overkill
const { contextBridge, ipcRenderer, Display } = require("electron");

type ThemeInput = {
	title: string;
	author: string;
	theme_data: string;
};

type ThemeType = "song" | "scripture" | "presentation";

interface ImportOptions {
	filters: ("images" | "videos")[];
	multiSelect: boolean;
}

contextBridge.exposeInMainWorld("electronAPI", {
	// Event Listeners:
	onDisplaysUpdate: (callback: (_: any) => void) =>
		ipcRenderer.on(
			"displays-update",
			(_: any, allDisplays: (typeof Display)[]) => callback(allDisplays),
		),
	// Close confirmation listener
	onCheckBeforeClose: (callback: () => void) =>
		ipcRenderer.on("check-before-close", () => callback()),
	confirmClose: () => ipcRenderer.send("confirm-close"),
	// Miscellaneous
	controlsWindowLoaded: () => ipcRenderer.send("controls-window-loaded"),
	saveSchedule: (data: { schedule: unknown; overwite: boolean }) =>
		ipcRenderer.invoke("save-schedule", data),
	getRecentSchedules: () => ipcRenderer.invoke("get-recent-schedules"),
	getScheduleData: (schedule: unknown) =>
		ipcRenderer.invoke("get-schedule-data", schedule),

	// Scripture functions
	fetchChapterCounts: () => ipcRenderer.invoke("fetch-chapter-counts"),
	fetchTranslations: () => ipcRenderer.invoke("fetch-scripture-translations"),
	fetchChapter: (info: unknown) => ipcRenderer.invoke("fetch-chapter", info),
	fetchScripture: (info: unknown) =>
		ipcRenderer.invoke("fetch-scripture", info),
	fetchAllScripture: (version: string) =>
		ipcRenderer.invoke("fetch-all-scripture", version),

	// Strong's Concordance functions - Dictionary
	fetchStrongs: (reference: string) =>
		ipcRenderer.invoke("fetch-strongs", reference),
	fetchMultipleStrongs: (references: string[]) =>
		ipcRenderer.invoke("fetch-multiple-strongs", references),
	searchStrongs: (keyword: string) =>
		ipcRenderer.invoke("search-strongs", keyword),
	getAllStrongs: (limit?: number, offset?: number) =>
		ipcRenderer.invoke("get-all-strongs", limit, offset),

	// Strong's Concordance functions - Bible with tags
	fetchStrongsBibleVerse: (params: {
		book: number;
		chapter: number;
		verse?: number;
	}) => ipcRenderer.invoke("fetch-strongs-bible-verse", params),
	fetchStrongsBibleChapter: (params: { book: number; chapter: number }) =>
		ipcRenderer.invoke("fetch-strongs-bible-chapter", params),
	fetchVerseWithDefinitions: (params: {
		book: number;
		chapter: number;
		verse: number;
	}) => ipcRenderer.invoke("fetch-verse-with-definitions", params),
	checkStrongsData: () => ipcRenderer.invoke("check-strongs-data"),

	// Songs Functions
	fetchAllSongs: () => ipcRenderer.invoke("fetch-songs"),
	fetchSongLyrics: (songId: number) =>
		ipcRenderer.invoke("fetch-lyrics", songId),
	createSong: (newSong: unknown) => ipcRenderer.invoke("create-song", newSong),
	updateSong: (newInfo: unknown) => ipcRenderer.invoke("update-song", newInfo),
	filterSongsByPhrase: (phrase: unknown) =>
		ipcRenderer.invoke("filter-songs", phrase),
	searchSongs: (query: string) => ipcRenderer.invoke("search-songs", query),
	deleteSong: (songId: number) => ipcRenderer.invoke("delete-song", songId),
	rebuildSongsFtsIndex: () => ipcRenderer.invoke("rebuild-songs-fts"),

	// Scripture Search
	searchScriptures: (query: string, version?: string) =>
		ipcRenderer.invoke("search-scriptures", query, version),
	rebuildScripturesFtsIndex: () => ipcRenderer.invoke("rebuild-scriptures-fts"),

	// Projection requests
	sendVerseUpdate: (verseData: unknown) =>
		ipcRenderer.send("scripture-update", verseData),

	// Toolbar Functions
	openProjectionWindow: (bounds: { x: number; y: number }) =>
		ipcRenderer.send("open-projection", bounds),
	closeProjectionWindow: () => ipcRenderer.send("close-projection"),
	getConnectedDisplays: () => ipcRenderer.invoke("get-all-displays"),

	// App UI
	darkModeToggle: () => ipcRenderer.invoke("dark-mode:toggle"),
	darkModeUpdate: (newTheme: "light" | "dark") =>
		ipcRenderer.send("dark-mode:update", newTheme),
	darkModeSystem: () => ipcRenderer.send("dark-mode:system"),

	// Projection Themes
	getSystemFonts: () => ipcRenderer.invoke("get-system-fonts"),
	addTheme: (data: ThemeInput) => ipcRenderer.invoke("add-theme", data),
	fetchAllThemes: () => ipcRenderer.invoke("fetch-themes-meta"),
	fetchTheme: (id: string) => ipcRenderer.invoke("fetch-theme", id),
	updateTheme: (id: number, data: ThemeInput) =>
		ipcRenderer.invoke("update-theme", id, data),
	deleteTheme: (id: number) => ipcRenderer.invoke("delete-theme", id),
	filterThemes: (type: ThemeType) => ipcRenderer.invoke("filter-themes", type),
	getShippedDefaultThemes: () =>
		ipcRenderer.invoke("get-shipped-default-themes"),

	importEswSongs: () => ipcRenderer.invoke("import-easyworship-songs"),
	getImages: () => ipcRenderer.invoke("get-images"),
	getVideos: () => ipcRenderer.invoke("get-videos"),
	deleteMedia: (path: string) => ipcRenderer.invoke("delete-media", path),
	openMediaSelector: (params: ImportOptions) =>
		ipcRenderer.invoke("import-media", params),

	// Logging API
	log: {
		info: (message: string, ...args: unknown[]) =>
			ipcRenderer.send("log", "info", message, ...args),
		warn: (message: string, ...args: unknown[]) =>
			ipcRenderer.send("log", "warn", message, ...args),
		error: (message: string, ...args: unknown[]) =>
			ipcRenderer.send("log", "error", message, ...args),
		debug: (message: string, ...args: unknown[]) =>
			ipcRenderer.send("log", "debug", message, ...args),
	},
	exportLogs: () => ipcRenderer.invoke("export-logs"),
	openLogFolder: () => ipcRenderer.invoke("open-log-folder"),
	getLogs: () => ipcRenderer.invoke("get-logs"),
	getSystemInfo: () => ipcRenderer.invoke("get-system-info"),
	clearLogs: () => ipcRenderer.invoke("clear-logs"),
	sendLogsEmail: (userMessage: string) =>
		ipcRenderer.invoke("send-logs-email", userMessage),

	// NDI Functions
	ndiGetVersion: () => ipcRenderer.invoke("ndi-get-version"),
	ndiIsSupported: () => ipcRenderer.invoke("ndi-is-supported"),
	ndiGetStatus: () => ipcRenderer.invoke("ndi-get-status"),
	ndiStart: (config?: {
		name?: string;
		frameRate?: number;
		width?: number;
		height?: number;
	}) => ipcRenderer.invoke("ndi-start", config),
	ndiStop: () => ipcRenderer.invoke("ndi-stop"),
	ndiUpdateConfig: (config: {
		name?: string;
		frameRate?: number;
		width?: number;
		height?: number;
	}) => ipcRenderer.invoke("ndi-update-config", config),
});
