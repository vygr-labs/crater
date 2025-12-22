/**
 * Types for Remote Control Server
 */

// Messages from Main Process to Remote Server
export type MainToRemoteMessage =
	| { type: "start"; port: number }
	| { type: "stop" }
	| { type: "state-update"; state: RemoteAppState }
	| { type: "songs-list"; songs: RemoteSong[] }
	| { type: "song-lyrics"; songId: number; lyrics: RemoteSongLyric[] }
	| { type: "scripture-chapter"; data: RemoteScriptureChapter }
	| { type: "themes-list"; themes: RemoteTheme[] }
	| { type: "schedule-list"; items: RemoteScheduleItem[] }
	| { type: "translations-list"; translations: RemoteTranslation[] };

// Messages from Remote Server to Main Process
export type RemoteToMainMessage =
	| { type: "started"; port: number; addresses: string[] }
	| { type: "stopped" }
	| { type: "error"; error: string }
	| { type: "client-connected"; clientId: string; clientInfo: ClientInfo }
	| { type: "client-disconnected"; clientId: string }
	| { type: "request-songs" }
	| { type: "request-song-lyrics"; songId: number }
	| { type: "request-scripture"; book: string; chapter: number; version: string }
	| { type: "request-themes" }
	| { type: "request-schedule" }
	| { type: "request-translations" }
	| { type: "go-live"; item: RemoteDisplayItem }
	| { type: "go-blank" }
	| { type: "navigate"; direction: "next" | "prev" }
	| { type: "search-songs"; query: string }
	| { type: "search-scripture"; query: string; version?: string }
	| { type: "add-to-schedule"; item: RemoteAddScheduleItem };

export interface RemoteTranslation {
	id: number;
	version: string;
	description: string;
}

// Simplified types for remote transmission
export interface RemoteSong {
	id: number;
	title: string;
	author: string;
	themeId: number | null;
}

export interface RemoteSongLyric {
	label: string;
	text: string[];
}

export interface RemoteSongWithLyrics extends RemoteSong {
	lyrics: RemoteSongLyric[];
}

export interface RemoteScriptureVerse {
	verse: string;
	text: string;
}

export interface RemoteScriptureChapter {
	book: string;
	chapter: number;
	version: string;
	verses: RemoteScriptureVerse[];
}

export interface RemoteTheme {
	id: number;
	title: string;
	type: "song" | "scripture" | "presentation";
}

export interface RemoteScheduleItem {
	id: string;
	type: "scripture" | "song" | "image" | "video" | "message" | "presentation";
	title: string;
	metadata?: Record<string, unknown>;
}

export interface RemoteDisplayItem {
	type: "scripture" | "song";
	title?: string;
	// For scripture
	book?: string;
	chapter?: number;
	verse?: string;
	version?: string;
	// For song
	songId?: number;
	slideIndex?: number;
}

export interface RemoteAddScheduleItem {
	type: "scripture" | "song";
	title: string;
	// For scripture
	book?: string;
	chapter?: number;
	verses?: string[];
	version?: string;
	// For song
	songId?: number;
}

export interface RemoteAppState {
	isLive: boolean;
	currentItem: {
		type: "scripture" | "song" | "image" | "video" | "none";
		title: string;
		slideIndex: number;
		totalSlides: number;
	} | null;
	hideLive: boolean;
	showLogo: boolean;
}

export interface ClientInfo {
	id: string;
	ip: string;
	userAgent: string;
	connectedAt: number;
}

// WebSocket message types (server to client)
export type WSServerMessage =
	| { type: "state"; state: RemoteAppState }
	| { type: "songs"; songs: RemoteSong[] }
	| { type: "song-lyrics"; songId: number; lyrics: RemoteSongLyric[] }
	| { type: "scripture"; data: RemoteScriptureChapter }
	| { type: "themes"; themes: RemoteTheme[] }
	| { type: "schedule"; items: RemoteScheduleItem[] }
	| { type: "translations"; translations: RemoteTranslation[] }
	| { type: "search-results"; resultType: "songs" | "scripture"; results: unknown[] }
	| { type: "error"; message: string }
	| { type: "connected"; clientId: string };

// WebSocket message types (client to server)
export type WSClientMessage =
	| { type: "get-songs" }
	| { type: "get-song-lyrics"; songId: number }
	| { type: "get-scripture"; book: string; chapter: number; version: string }
	| { type: "get-themes" }
	| { type: "get-schedule" }
	| { type: "get-translations" }
	| { type: "go-live"; item: RemoteDisplayItem }
	| { type: "go-blank" }
	| { type: "navigate"; direction: "next" | "prev" }
	| { type: "search-songs"; query: string }
	| { type: "search-scripture"; query: string; version?: string }
	| { type: "add-to-schedule"; item: RemoteAddScheduleItem }
	| { type: "ping" };

export interface ServerConfig {
	port: number;
	enableAuth?: boolean;
	pin?: string;
}
