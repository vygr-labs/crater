import type { OpenEditData } from "~/types";
import type { AppSettings, AppData, DisplayPropsCollection } from "~/types/app-context";

export const DEFAULT_SCRIPTURE_COLLECTION_ID = 1
export const defaultPalette = "purple"
export const defaultSupportingPalette = "orange";

const APP_FAVORITES: DisplayPropsCollection[] = [
    {
        id: 0,
        name: 'Favorites',
        type: 'song',
        items: [],
    },
    {
        id: 1,
        name: 'Favorites',
        type: 'scripture',
        items: [],
    },
    {
        id: 2,
        name: 'Favorites',
        type: 'media',
        items: [],
    },
]

const DEFAULT_COLLECTIONS: DisplayPropsCollection[] = [
    {
        id: DEFAULT_SCRIPTURE_COLLECTION_ID,
        name: 'Default Scripture Collection',
        type: 'scripture',
        items: [],
    },
]

// adding arrays to app state takes a few reloads to show in redux/persist and are undefined till then
export const defaultAppStore: AppData = {
	user: undefined,
	panelFocus: 'scripture',
	scriptureTheme: undefined,
	songTheme: undefined,
	presentationTheme: undefined,
	displayData: undefined,
	hideLive: false,
	showLogo: false,
	logoBg: '',
	songsUpdateCounter: 0,
	loading: {
		reason: 'Nothing is loading',
		isLoading: false,
	},
	previewItem: undefined,
	liveItem: undefined,
	scheduleItems: [],
	collections: DEFAULT_COLLECTIONS,
	favorites: APP_FAVORITES,
	themeEditor: {
		type: 'song',
		open: false,
		initial: null,
	},
	lyricScopes: {},
	scriptureScopes: {},
	cacheBuster: {
		paths: [],
		version: 1,
	},
	songEdit: {
		open: false,
		song: null,
	},
	namingModal: {
		type: 'song',
		group: 'collection',
		open: false,
	},
	isLive: false,
    openSettings: false
}

export const defaultAppSettings: AppSettings = {
    theme: 'light',
    language: 'en',
    projectionBounds: {
        height: 0,
        width: 0,
        x: 0,
        y: 0,
    },
    projectionDisplayId: 0,
};

export const CLOSE_SONG_EDIT: OpenEditData = { open: false, song: null }