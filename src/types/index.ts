import type { Setter } from "solid-js"
import type { SongData, SongLyric } from "./context"
import type { SetStoreFunction } from "solid-js/store"

export type AvailableTranslation = "NKJV" | "NIV" | "NLT";

export interface ScriptureTranslation {
	id: number
	version: string
	description: string
}

export interface VerseData {
	verse: string
	text: string
}

export interface ScriptureVerse {
	version: string
	bible_id: number
	book_id: number
	book_name: string
	scripture_id: number
	chapter: number
	verse: number
	text: string
}

export interface ChapterCountObj {
	[chapter: string]: number
}

export interface ChapterData {
	[chapter: string]: VerseData
}

export interface BibleData {
	[book: string]: ChapterData
}

export interface BookInfo {
	order?: number
	id?: string
	name?: string
	testament?: string
	start?: string
	abbr?: string[]
	chapters?: number
	versesPerChapter?: number[]
}

export interface CV {
	book: BookInfo
	success: boolean
	reason: string
	chapter?: number | null
	from?: number | null
	to?: number | null
}

export interface ItemSizeMap {
	[index: number]: number
}

export interface ChakraValueChangeDetails {
	value: string
}

export type ThemeType = 'song' | 'scripture' | 'presentation'

export type ThemeMetadata = {
	id: number
	title: string
	author: string
	preview_path: string
	created_at: string
	updated_at: string
	type: ThemeType
}

export interface Theme extends ThemeMetadata {
	theme_data: string
}

export type ThemeInput = {
	title: string
	author: string
	type?: ThemeType
	preview: ArrayBuffer
	theme_data: string
}

export type FocusPanel =
	| 'scripture'
	| 'songs'
	| 'media'
	| 'presentations'
	| 'themes'
	| 'schedule'
	| 'preview'
	| 'live'
	| 'song-edit'
	| 'presentation-edit'

export interface HighlightedVerse {
	book: string
	chapter: string
	verse: string
	version: string
	text: string
}

export type DisplayType =
	| 'scripture'
	| 'song'
	| 'image'
	| 'video'
	| 'message'
	| 'presentation'

export interface MediaItem {
	title: string
	path: string
}

export type DisplayItem = DisplayType | HighlightedVerse | SongLyric | MediaItem

export interface DisplayInfo {
	type: DisplayType
	scripture?: HighlightedVerse
	song?: SongLyric
	image?: MediaItem
}

export interface ExtraRenderProps {
	scope: string
}

export type TextAlign =
	| 'left'
	| 'right'
	| 'center'
	| 'justify'
	| 'start'
	| 'end'
	| 'inherit'

export const TEXT_ALIGN_OPTIONS: { value: TextAlign; label: string }[] = [
	{ value: 'left', label: 'Left' },
	{ value: 'right', label: 'Right' },
	{ value: 'center', label: 'Center' },
	{ value: 'justify', label: 'Justify' },
	{ value: 'start', label: 'Start' },
	{ value: 'end', label: 'End' },
]

export const TEXT_TRANSFORM_OPTIONS: { value: string; label: string }[] = [
	{ value: 'uppercase', label: 'Uppercase' },
	{ value: 'lowercase', label: 'Lowercase' },
	{ value: 'capitalize', label: 'Capitalize' },
	{ value: 'none', label: 'None' },
]

export interface ImportOptions {
	filters: ('images' | 'videos')[]
	multiSelect: boolean
}

export const MEDIA_BACKGROUND_OPTIONS: { value: string; label: string }[] = [
	{ value: 'image', label: 'Image' },
	{ value: 'video', label: 'Video' },
]

export type GroupType = 'song' | 'scripture' | 'media' | 'theme'
export type GroupCategory = 'favorite' | 'collection'

export interface DisplayMetadata {
	title: string
	id: string | number
	[data: string]: any
}

export interface DisplayProps {
	metadata?: DisplayMetadata
	type: DisplayType
	data: any[]
	index: number
}

export type DisplayBounds = {
	x: number
	y: number
	width: number
	height: number
}

export interface OpenEditData {
	open: boolean
	song: SongData | null
}