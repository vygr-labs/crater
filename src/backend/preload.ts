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

	// Songs Functions
	fetchAllSongs: () => ipcRenderer.invoke("fetch-songs"),
	fetchSongLyrics: (songId: number) =>
		ipcRenderer.invoke("fetch-lyrics", songId),
	createSong: (newSong: unknown) => ipcRenderer.invoke("create-song", newSong),
	updateSong: (newInfo: unknown) => ipcRenderer.invoke("update-song", newInfo),
	filterSongsByPhrase: (phrase: unknown) =>
		ipcRenderer.invoke("filter-songs", phrase),
	deleteSong: (songId: number) => ipcRenderer.invoke("delete-song", songId),

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
});
