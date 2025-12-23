/**
 * Remote Control Event Handlers
 * 
 * Handles incoming remote control commands from the remote server
 */

import { addToSchedule } from "./store-helpers";
import type { DisplayProps } from "~/types";
import logger from "./logger";
import type { SetStoreFunction } from "solid-js/store";
import type { AppData } from "~/types/app-context";

interface RemoteScriptureItem {
	type: "scripture";
	book: string;
	chapter: number;
	verse?: string;
	verses?: string[];
	version: string;
	title: string;
}

interface RemoteSongItem {
	type: "song";
	songId: number;
	title: string;
	slideIndex?: number;
}

type RemoteItem = RemoteScriptureItem | RemoteSongItem;

/**
 * Handle remote go-live command
 */
async function handleRemoteGoLive(setAppStore: SetStoreFunction<AppData>, item: unknown) {
	logger.info("Remote go-live command received:", item);
	
	try {
		const remoteItem = item as RemoteItem;
		
		if (remoteItem.type === "scripture") {
			await handleScriptureGoLive(setAppStore, remoteItem);
		} else if (remoteItem.type === "song") {
			await handleSongGoLive(setAppStore, remoteItem);
		}
	} catch (error) {
		logger.error("Error handling remote go-live:", error);
	}
}

/**
 * Handle scripture go-live
 */
async function handleScriptureGoLive(setAppStore: SetStoreFunction<AppData>, item: RemoteScriptureItem) {
	const { book, chapter, verse, verses, version } = item;
	
	try {
		// Fetch scripture verses from database
		const versesToFetch = verses || (verse ? [verse] : []);
		
		if (versesToFetch.length === 0) {
			logger.warn("No verses specified for scripture go-live");
			return;
		}
		
		// Fetch the full chapter
		const chapterData = await window.electronAPI.fetchChapter({
			book,
			chapter: chapter,
			version,
		});
		
		// Filter to only the requested verses
		const requestedVerses = chapterData.filter((v: { verse: string }) =>
			versesToFetch.includes(v.verse)
		);
		
		if (requestedVerses.length === 0) {
			logger.warn("No verses found for scripture go-live");
			return;
		}
		
		// Prepare metadata
		const title = `${book} ${chapter}:${versesToFetch.join(", ")}`;
		const id = `${book.toLowerCase()}-${chapter}-${versesToFetch.join("-")}`;
		
		// Push to live - use first verse as liveItem
		setAppStore("liveItem", {
			metadata: { title, id },
			type: "scripture" as const,
			data: requestedVerses,
			index: 0,
		});
		
		logger.info("Scripture pushed to live:", requestedVerses.length, "verses");
	} catch (error) {
		logger.error("Error handling scripture go-live:", error);
	}
}

/**
 * Handle song go-live
 */
async function handleSongGoLive(setAppStore: SetStoreFunction<AppData>, item: RemoteSongItem) {
	const { songId, slideIndex = 0, title } = item;
	
	try {
		// Fetch song lyrics
		const lyrics = await window.electronAPI.fetchSongLyrics(songId);
		
		if (!lyrics || lyrics.length === 0) {
			logger.warn("Song lyrics not found for go-live");
			return;
		}
		
		// Fetch all songs to get full song data (we need author)
		const allSongs = await window.electronAPI.fetchAllSongs();
		const song = allSongs.find((s: { id: number }) => s.id === songId);
		
		if (!song) {
			logger.warn("Song not found for go-live");
			return;
		}
		
		// Prepare metadata
		const metadata = {
			title: song.title,
			id: songId,
			author: song.author,
		};
		
		// Push to live at specified slide
		const targetSlide = Math.min(slideIndex, lyrics.length - 1);
		setAppStore("liveItem", {
			metadata,
			type: "song" as const,
			data: lyrics,
			index: targetSlide,
		});
		
		logger.info("Song pushed to live:", song.title, "at slide", targetSlide);
	} catch (error) {
		logger.error("Error handling song go-live:", error);
	}
}

/**
 * Handle remote add-to-schedule command
 */
async function handleRemoteAddToSchedule(setAppStore: SetStoreFunction<AppData>, item: unknown) {
	logger.info("[Renderer] handleRemoteAddToSchedule called with:", item);
	
	try {
		const remoteItem = item as RemoteItem;
		logger.info("[Renderer] Item type:", remoteItem.type);
		
		if (remoteItem.type === "scripture") {
			logger.info("[Renderer] Calling handleScriptureAddToSchedule");
			await handleScriptureAddToSchedule(setAppStore, remoteItem);
			logger.info("[Renderer] handleScriptureAddToSchedule completed");
		} else if (remoteItem.type === "song") {
			logger.info("[Renderer] Calling handleSongAddToSchedule");
			await handleSongAddToSchedule(setAppStore, remoteItem);
			logger.info("[Renderer] handleSongAddToSchedule completed");
		}
	} catch (error) {
		logger.error("[Renderer] Error handling remote add-to-schedule:", error);
	}
}

/**
 * Handle scripture add-to-schedule
 */
async function handleScriptureAddToSchedule(setAppStore: SetStoreFunction<AppData>, item: RemoteScriptureItem) {
	const { book, chapter, verses, version, title } = item;
	logger.info("[Renderer] handleScriptureAddToSchedule - book:", book, "chapter:", chapter, "verses:", verses, "version:", version);
	
	try {
		if (!verses || verses.length === 0) {
			logger.warn("[Renderer] No verses specified for scripture add-to-schedule");
			return;
		}
		
		logger.info("[Renderer] Fetching chapter data...");
		// Fetch the full chapter
		const chapterData = await window.electronAPI.fetchChapter({
			book,
			chapter: chapter,
			version,
		});
		logger.info("[Renderer] Chapter data received:", chapterData.length, "verses");
		
		// Filter to only the requested verses
		const requestedVerses = chapterData.filter((v: { verse: string }) =>
			verses.includes(v.verse)
		);
		logger.info("[Renderer] Filtered to requested verses:", requestedVerses.length);
		
		if (requestedVerses.length === 0) {
			logger.warn("[Renderer] No verses found for scripture add-to-schedule");
			return;
		}
		
		// Prepare metadata
		const scheduleTitle = `${book} ${chapter}:${verses.join(", ")}`;
		const id = `${book.toLowerCase()}-${chapter}-${verses.join("-")}`;
		logger.info("[Renderer] Creating schedule item with title:", scheduleTitle);
		
		// Create display props for schedule
		const scheduleItem: DisplayProps = {
			metadata: { title: scheduleTitle, id },
			type: "scripture" as const,
			data: requestedVerses,
			index: 0,
		};
		
		logger.info("[Renderer] Calling addToSchedule with item:", scheduleItem);
		// Add to schedule
		addToSchedule(setAppStore, [scheduleItem]);
		
		logger.info("[Renderer] Scripture added to schedule successfully:", requestedVerses.length, "verses");
	} catch (error) {
		logger.error("[Renderer] Error handling scripture add-to-schedule:", error);
	}
}

/**
 * Handle song add-to-schedule
 */
async function handleSongAddToSchedule(setAppStore: SetStoreFunction<AppData>, item: RemoteSongItem) {
	const { songId, title } = item;
	
	try {
		// Fetch song lyrics
		const lyrics = await window.electronAPI.fetchSongLyrics(songId);
		
		if (!lyrics || lyrics.length === 0) {
			logger.warn("Song lyrics not found for add-to-schedule");
			return;
		}
		
		// Fetch all songs to get full song data (we need author)
		const allSongs = await window.electronAPI.fetchAllSongs();
		const song = allSongs.find((s: { id: number }) => s.id === songId);
		
		if (!song) {
			logger.warn("Song not found for add-to-schedule");
			return;
		}
		
		// Prepare metadata
		const metadata = {
			title: song.title,
			id: songId,
			author: song.author,
		};
		
		// Create display props for schedule
		const scheduleItem: DisplayProps = {
			metadata,
			type: "song" as const,
			data: lyrics,
			index: 0,
		};
		
		// Add to schedule
		addToSchedule(setAppStore, [scheduleItem]);
		
		logger.info("Song added to schedule:", song.title);
	} catch (error) {
		logger.error("Error handling song add-to-schedule:", error);
	}
}

/**
 * Set up remote control event listeners
 * Returns a cleanup function to remove listeners
 */
export function handleRemoteCommands(setAppStore: SetStoreFunction<AppData>): (() => void) | null {
	logger.info("[Renderer] handleRemoteCommands called");
	if (!window.electronAPI) {
		logger.warn("[Renderer] electronAPI not available, remote commands will not work");
		return null;
	}
	
	// Set up event listeners with setAppStore bound
	logger.info("[Renderer] Setting up onRemoteGoLive listener");
	window.electronAPI.onRemoteGoLive((item: unknown) => {
		logger.info("[Renderer] onRemoteGoLive fired with:", item);
		handleRemoteGoLive(setAppStore, item);
	});
	
	logger.info("[Renderer] Setting up onRemoteAddToSchedule listener");
	window.electronAPI.onRemoteAddToSchedule((item: unknown) => {
		logger.info("[Renderer] onRemoteAddToSchedule event fired with:", item);
		handleRemoteAddToSchedule(setAppStore, item);
	});
	
	logger.info("[Renderer] Remote control event listeners registered successfully");
	
	// Return cleanup function
	return () => {
		logger.info("[Renderer] Remote control event listeners cleaned up");
		// Note: electron IPC doesn't provide removeListener, 
		// but the listeners will be cleaned up when the component unmounts
	};
}
