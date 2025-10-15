export type ThemeMetadata = {
	id: number;
	title: string;
	author: string;
	preview_path: string;
	created_at: string;
	updated_at: string;
};

export interface Theme extends ThemeMetadata {
	theme_data: string;
}

export type ThemeInput = {
	title: string;
	author: string;
	preview: ArrayBuffer;
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

export interface SONG_DB_PATHS {
	SONG_DB: string;
	SONG_WORDS_DB: string;
}
