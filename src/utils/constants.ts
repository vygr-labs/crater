import type { OpenEditData } from "~/types";
import type {
	AppSettings,
	AppData,
	GroupCollectionObj,
} from "~/types/app-context";

export const DEFAULT_SCRIPTURE_COLLECTION_ID = 1;
export const defaultPalette = "purple";
export const defaultSupportingPalette = "orange";
export const PREVIEW_INDEX_WIDTH = 7;
export const ALL_SCRIPTURE_DYNAMICSUB_KEY = "versions";
export const defaultThemeKeys = [
	"songTheme",
	"scriptureTheme",
	"presentationTheme",
] as const;

const DEFAULT_GROUPS: GroupCollectionObj = {
	song: {
		all: {
			title: "All Songs",
			subGroups: null,
		},
		favorite: {
			title: "My Favorites",
			subGroups: [],
		},
		collection: {
			title: "My Collections",
			subGroups: [],
		},
	},
	scripture: {
		all: {
			title: "All Versions",
			dynamic: {
				id: ALL_SCRIPTURE_DYNAMICSUB_KEY,
			},
			subGroups: null,
		},
		favorite: {
			title: "My Favorites",
			subGroups: [],
		},
		collection: {
			title: "My Collections",
			subGroups: [],
		},
	},
	media: {
		image: {
			title: "Images",
			type: "image",
			subGroups: null,
		},
		video: {
			title: "Videos",
			type: "video",
			subGroups: null,
		},
		favorite: {
			title: "My Favorites",
			subGroups: [],
		},
		collection: {
			title: "My Collections",
			subGroups: [],
		},
	},
	theme: {
		song: {
			title: "Song Themes",
			type: "song",
			subGroups: null,
		},
		scripture: {
			title: "Scripture Themes",
			type: "scripture",
			subGroups: null,
		},
		presentation: {
			title: "Presentation Themes",
			type: "presentation",
			subGroups: null,
		},
		collection: {
			title: "Theme Collections",
			subGroups: [],
		},
	},
};

// adding arrays to app state takes a few reloads to show in redux/persist and are undefined till then
export const defaultAppStore: AppData = {
	user: undefined,
	panelFocus: "scripture",
	scriptureTheme: undefined,
	songTheme: undefined,
	presentationTheme: undefined,
	displayData: undefined,
	hideLive: false,
	showLogo: false,
	logoBg: "",
	songsUpdateCounter: 0,
	themesUpdateTrigger: 0,
	mediaUpdateTrigger: 0,
	loading: {
		reason: "Nothing is loading",
		isLoading: false,
	},
	previewItem: undefined,
	liveItem: undefined,
	scheduleItems: [],
	displayGroups: DEFAULT_GROUPS,
	// favorites: APP_FAVORITES,
	themeEditor: {
		type: "song",
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
		type: "song",
		group: "collection",
		open: false,
	},
	isLive: false,
	openSettings: false,
};

export const defaultAppSettings: AppSettings = {
	theme: "light",
	language: "en",
	projectionBounds: {
		height: 0,
		width: 0,
		x: 0,
		y: 0,
	},
	projectionDisplayId: 0,
};

export const storageKey = "crater-store";
export const syncUpdateKey = "crater-sync";
export const syncFnPrefix = "DYNAMIC-ASSIGNMENT-FN()";
export const CLOSE_SONG_EDIT: OpenEditData = { open: false, song: null };

export const SONGS_TAB_FOCUS_NAME = "SONGS";
export const SCRIPTURE_TAB_FOCUS_NAME = "SCRIPTURE";
export const MEDIA_TAB_FOCUS_NAME = "MEDIA";
export const THEMES_TAB_FOCUS_NAME = "THEMES";
export const PRESENTATIONS_TAB_FOCUS_NAME = "PRESENTATIONS";
export const PREVIEW_PANEL_FOCUS_NAME = "PREVIEW";
export const LIVE_PANEL_FOCUS_NAME = "LIVE";
export const SCHEDULE_PANEL_FOCUS_NAME = "SCHEDULES";
export const SONG_EDITOR_FOCUS_NAME = "SONG_EDITOR";
export const THEME_EDITOR_FOCUS_NAME = "THEME_EDITOR";

export const DEFAULT_PANEL = THEMES_TAB_FOCUS_NAME;
