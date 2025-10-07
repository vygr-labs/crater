import { DEFAULT_SCRIPTURE_COLLECTION_ID } from "~/utils/constants";
import type { SongData, SongLyric } from "./context";
import type { DisplayBounds, DisplayInfo, DisplayProps, FocusPanel, GroupCategory, GroupType, HighlightedVerse, Theme } from "./index"
import type { SetStoreFunction } from "solid-js/store";

type AppLoading = {
	reason: string
	isLoading: boolean
}

export interface UserData {
	id: string
	name: string
}

export interface CreateCollection {
	name: string
	type: GroupType
	items: number[]
}

export interface DisplayPropsCollection extends CreateCollection {
	id: number
}

export interface LyricScopes {
	[id: string]: SongLyric
}

export interface ScriptureScopes {
	[id: string]: HighlightedVerse
}

export interface CacheBustMedia {
	paths: string[] | 'all'
	version: number
}

export interface SongEditData {
	open: boolean
	song: SongData | null
}

export interface NamingModalData {
	type: GroupType
	group: GroupCategory
	open: boolean
}

export interface AppData {
	user: UserData | undefined
	panelFocus: FocusPanel
	scriptureTheme: Theme | undefined
	songTheme: Theme | undefined
	presentationTheme: Theme | undefined
	displayData: DisplayInfo | undefined
	hideLive: boolean
	showLogo: boolean
	logoBg: string
	songsUpdateCounter: number
	loading: AppLoading
	previewItem: DisplayProps | undefined
	liveItem: DisplayProps | undefined
	scheduleItems: DisplayProps[]
	favorites: DisplayPropsCollection[]
	collections: DisplayPropsCollection[]
	themeEditor: {
		type: ThemeType
		open: boolean
		initial: Theme | null
	}
	songEdit: SongEditData
	lyricScopes: LyricScopes
	scriptureScopes: ScriptureScopes
	cacheBuster: CacheBustMedia
	namingModal: NamingModalData
	isLive: boolean
	openSettings: boolean
}

export interface AppSettings {
	theme: string
	language: string
	projectionBounds: DisplayBounds
	projectionDisplayId: number,
}

export interface AppContextObj {
	appStore: AppData
    setAppStore: SetStoreFunction<AppData>
	settings: AppSettings
    updateSettings: SetStoreFunction<AppSettings>
}