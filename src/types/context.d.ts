/* ********************************************************************
 *   Declaration file for the API exposed over the context bridge
 *********************************************************************/

import type { IFontInfo } from "font-list";
import type {
	ChapterData,
	ImportOptions,
	MediaItem,
	ScriptureTranslation,
	ScriptureVerse,
	ThemeInput,
	ThemeMetadata,
	ThemeType,
	Theme,
	ScheduleSaveItem,
	DisplayProps,
} from "./index";
import { Display } from "electron/main";
import type { SavedSchedule } from "~/backend/types";

export interface ChapterCountObj {
	[book: string]: number;
}

export interface SongData {
	id: number;
	title: string;
	author: string | null;
	copyright: string | null;
	created_at: string;
	updated_at: string;
}

export interface SongLyric {
	label: string;
	text: string[]; // Each lyric is represented as an array of lines
}

export interface BridgeResponse {
	// type: 'success' | 'error'
	success: boolean;
	message: string;
}

export interface MediaImportResponse extends BridgeResponse {
	paths: string[];
}

export interface StrongsEntry {
	id: number;
	relativeOrder: number;
	word: string;
	data: string;
}

// A section of a Strong's definition for display in preview/live panels
export interface StrongsSection {
	word: string; // e.g., "H1961"
	sectionIndex: number;
	totalSections: number;
	label: string; // e.g., "Original", "Transliteration", "Definition 1a"
	content: string; // HTML content for this section
}

export interface StrongsBibleVerse {
	id?: number;
	book: number;
	chapter: number;
	verse: number;
	text: string; // Contains <WH####>/<WG####> tags
}

export interface StrongsDataStatus {
	hasBible: boolean;
	hasDictionary: boolean;
}

export interface IElectronAPI {
	// Events
	onDisplaysUpdate: (c: (allDisplays: Display[]) => void) => void;

	// Miscellaneous
	controlsWindowLoaded: () => void;
	saveSchedule: (data: {
		schedule: ScheduleSaveItem;
		overwrite: boolean;
	}) => Promise<BridgeResponse & { path: string }>;
	getRecentSchedules: () => Promise<SavedSchedule[]>;
	getScheduleData: (sched: SavedSchedule) => Promise<string>;

	// Bible operations
	fetchTranslations: () => Promise<ScriptureTranslation[]>;
	fetchChapterCounts: () => Promise<ChapterCountObj>;
	fetchChapter: ({
		book,
		chapter,
		version,
	}: {
		book: string;
		chapter: string;
		version: string;
	}) => Promise<{ verse: string; text: string }[]>;
	fetchScripture: ({
		book,
		chapter,
		verse,
		version,
	}: {
		book: string;
		chapter: string;
		verse: string;
		version: string;
	}) => Promise<{ text: string }>;
	sendVerseUpdate: (verseData: any) => void;
	onScriptureUpdate: (callback: () => void) => void;

	// Strong's Concordance - Dictionary operations
	fetchStrongs: (reference: string) => Promise<StrongsEntry | null>;
	fetchMultipleStrongs: (references: string[]) => Promise<StrongsEntry[]>;
	searchStrongs: (keyword: string) => Promise<StrongsEntry[]>;
	getAllStrongs: (limit?: number, offset?: number) => Promise<StrongsEntry[]>;

	// Strong's Concordance - Bible with tags operations
	fetchStrongsBibleVerse: (params: {
		book: number;
		chapter: number;
		verse?: number;
	}) => Promise<StrongsBibleVerse | null>;
	fetchStrongsBibleChapter: (params: {
		book: number;
		chapter: number;
	}) => Promise<StrongsBibleVerse[]>;
	fetchVerseWithDefinitions: (params: {
		book: number;
		chapter: number;
		verse: number;
	}) => Promise<{
		verse: StrongsBibleVerse | null;
		definitions: StrongsEntry[];
	}>;
	checkStrongsData: () => Promise<StrongsDataStatus>;

	// Song operations
	fetchAllSongs: () => Promise<SongData[]>;
	fetchSongLyrics: (songId: number) => Promise<SongLyric[]>;
	createSong: (newSong: {
		title: string;
		author?: string;
		lyrics: SongLyric[];
	}) => Promise<{ success: boolean; message: string; songId?: number }>;
	updateSong: (newInfo: {
		songId: number;
		newTitle: string;
		newLyrics: SongLyric[];
	}) => Promise<{ success: boolean; message: string }>;
	filterSongsByPhrase: (phrase: string) => Promise<SongData[]>;
	deleteSong: (songId: number) => Promise<BridgeResponse>;
	fetchAllScripture: (version: string) => Promise<ScriptureVerse[]>;
	openProjectionWindow: ({ x: number, y: number }) => void;
	closeProjectionWindow: () => void;
	getConnectedDisplays: () => Promise<Display[]>;
	darkModeToggle: () => Promise<"light" | "dark">;
	darkModeUpdate: (newTheme: "light" | "dark") => void;
	darkModeSystem: () => void;

	// Projection Themes
	getSystemFonts: () => Promise<IFontInfo[]>;
	addTheme: (theme: ThemeInput) => Promise<BridgeResponse>;
	fetchAllThemes: () => Promise<ThemeMetadata[]>;
	fetchTheme: (id: number) => Promise<Theme | null>;
	updateTheme: (
		id: number,
		data: ThemeInput,
	) => Promise<BridgeResponse & { updatedTheme?: Theme }>;
	deleteTheme: (id: number) => Promise<BridgeResponse>;
	filterThemes: (type: ThemeType) => Promise<Theme[]>;

	// Opens dialog to fetch all files
	importEswSongs: () => Promise<BridgeResponse>;
	getImages: () => Promise<MediaItem[]>;
	getVideos: () => Promise<MediaItem[]>;
	deleteMedia: (path: string) => Promise<BridgeResponse>;
	openMediaSelector: (params: ImportOptions) => Promise<MediaImportResponse>;

	// Logging API
	log: {
		info: (message: string, ...args: unknown[]) => void;
		warn: (message: string, ...args: unknown[]) => void;
		error: (message: string, ...args: unknown[]) => void;
		debug: (message: string, ...args: unknown[]) => void;
	};
	exportLogs: () => Promise<{
		success: boolean;
		path?: string;
		error?: string;
	}>;
	openLogFolder: () => Promise<boolean>;
	getLogs: () => Promise<string>;
	getSystemInfo: () => Promise<string>;
	clearLogs: () => Promise<boolean>;
	sendLogsEmail: (userMessage: string) => Promise<{
		success: boolean;
		logPath?: string;
		error?: string;
	}>;
}

declare global {
	interface Window {
		electronAPI: IElectronAPI;
	}
}
