"use strict";
/* eslint-disable @typescript-eslint/no-var-requires */
// Electron doesnt support ESM for renderer process. Alternatively, pass this file
// through a bundler but that feels like an overkill
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
	// Scripture functions
	fetchChapterCounts: () => ipcRenderer.invoke("fetch-chapter-counts"),
	fetchTranslations: () => ipcRenderer.invoke("fetch-scripture-translations"),
	fetchChapter: (info) => ipcRenderer.invoke("fetch-chapter", info),
	fetchScripture: (info) => ipcRenderer.invoke("fetch-scripture", info),
	fetchAllScripture: (version) =>
		ipcRenderer.invoke("fetch-all-scripture", version),
	// Songs Functions
	fetchAllSongs: () => ipcRenderer.invoke("fetch-songs"),
	fetchSongLyrics: (songId) => ipcRenderer.invoke("fetch-lyrics", songId),
	createSong: (newSong) => ipcRenderer.invoke("create-song", newSong),
	updateSong: (newInfo) => ipcRenderer.invoke("update-song", newInfo),
	filterSongsByPhrase: (phrase) => ipcRenderer.invoke("filter-songs", phrase),
	deleteSong: (songId) => ipcRenderer.invoke("delete-song", songId),
	// Projection requests
	sendVerseUpdate: (verseData) =>
		ipcRenderer.send("scripture-update", verseData),
	// Toolbar Functions
	openProjectionWindow: (bounds) => ipcRenderer.send("open-projection", bounds),
	closeProjectionWindow: () => ipcRenderer.send("close-projection"),
	getConnectedDisplays: () => ipcRenderer.invoke("get-all-displays"),
	// App UI
	darkModeToggle: () => ipcRenderer.invoke("dark-mode:toggle"),
	darkModeUpdate: (newTheme) => ipcRenderer.send("dark-mode:update", newTheme),
	darkModeSystem: () => ipcRenderer.send("dark-mode:system"),
	// Projection Themes
	addTheme: (data) => ipcRenderer.invoke("add-theme", data),
	fetchAllThemes: () => ipcRenderer.invoke("fetch-themes-meta"),
	fetchTheme: (id) => ipcRenderer.invoke("fetch-theme", id),
	updateTheme: (id, data) => ipcRenderer.invoke("update-theme", id, data),
	deleteTheme: (id) => ipcRenderer.invoke("delete-theme", id),
	filterThemes: (type) => ipcRenderer.invoke("filter-themes", type),
	importEswSongs: () => ipcRenderer.invoke("import-easyworship-songs"),
	getImages: () => ipcRenderer.invoke("get-images"),
	getVideos: () => ipcRenderer.invoke("get-videos"),
	deleteMedia: (path) => ipcRenderer.invoke("delete-media", path),
	openMediaSelector: (params) => ipcRenderer.invoke("import-media", params),
});
