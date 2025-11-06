export type ThemeMetadata = {
	id: number;
	title: string;
	author: string;
	created_at: string;
	updated_at: string;
};

export interface Theme extends ThemeMetadata {
	theme_data: string;
}

export type ThemeInput = {
	title: string;
	author: string;
	theme_data: string;
};

export type FocusPanel =
	| "scripture"
	| "songs"
	| "media"
	| "presentations"
	| "themes"
	| "schedule"
	| "preview"
	| "live";

export type DisplayType =
	| "scripture"
	| "song"
	| "image"
	| "video"
	| "message"
	| "presentation";

export interface SONG_DB_PATHS {
	SONG_DB: string;
	SONG_WORDS_DB: string;
}

export interface DisplayMetadata {
	title: string;
	id: string | number;
	[data: string]: any;
}

export interface DisplayProps {
	metadata?: DisplayMetadata;
	type: DisplayType;
	data: any[];
	index: number;
}

export interface ScheduleSaveItem {
	name: string;
	items: DisplayProps[];
}

export interface SavedSchedule {
	id: number;
	path: string;
	name: string;
	last_used: any;
}
