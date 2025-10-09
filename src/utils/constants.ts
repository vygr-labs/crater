import type { OpenEditData } from "~/types";
import type { AppSettings, AppData, GroupCollectionObj } from "~/types/app-context";

export const DEFAULT_SCRIPTURE_COLLECTION_ID = 1
export const defaultPalette = "purple"
export const defaultSupportingPalette = "orange";
export const PREVIEW_INDEX_WIDTH = 8

const DEFAULT_GROUPS: GroupCollectionObj = {
	song: {
		all: {
			title: "All Songs",
			subGroups: null
		},
		favorite: {
			title: "My Favorites",
			subGroups: []
		},
		collection: {
			title: "My Collections",
			subGroups: []
		}
	},
	scripture: {
		all: {
			title: "All Songs",
			subGroups: null
		},
		favorite: {
			title: "My Favorites",
			subGroups: []
		},
		collection: {
			title: "My Collections",
			subGroups: []
		}
	},
	media: {
		all: {
			title: "All Songs",
			subGroups: null
		},
		favorite: {
			title: "My Favorites",
			subGroups: []
		},
		collection: {
			title: "My Collections",
			subGroups: []
		}
	},
	theme: {
		all: {
			title: "All Songs",
			subGroups: null
		},
		favorite: {
			title: "My Favorites",
			subGroups: []
		},
		collection: {
			title: "My Collections",
			subGroups: []
		}
	}
}

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
	displayGroups: DEFAULT_GROUPS,
	// favorites: APP_FAVORITES,
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

export const SONGS_TAB_FOCUS_NAME = "SONGS";
export const SCRIPTURE_TAB_FOCUS_NAME = "SCRIPTURE";
export const MEDIA_TAB_FOCUS_NAME = "MEDIA";
export const THEMES_TAB_FOCUS_NAME = "THEMES";
export const PRESENTATIONS_TAB_FOCUS_NAME = "PRESENTATIONS";
export const PREVIEW_PANEL_FOCUS_NAME = "PREVIEW";
export const LIVE_PANEL_FOCUS_NAME = "LIVE";

export const DEFAULT_PANEL = SONGS_TAB_FOCUS_NAME;