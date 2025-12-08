import { DEFAULT_SCRIPTURE_COLLECTION_ID } from "~/utils/constants";
import type { SongData, SongLyric } from "./context";
import type {
	DisplayBounds,
	DisplayInfo,
	DisplayMetadata,
	DisplayProps,
	DisplayType,
	FocusPanel,
	GroupCategory,
	GroupType,
	HighlightedVerse,
	Theme,
} from "./index";
import type { SetStoreFunction } from "solid-js/store";
import type { SavedSchedule } from "~/backend/types";

type AppLoading = {
	reason: string;
	isLoading: boolean;
};

export interface UserData {
	id: string;
	name: string;
}

export interface DisplayCollection {
	name: string;
	id: number;
	items: number[];
}

export type PanelCollection = {
	title: string;
	type?: DisplayType;
	dynamic?: {
		id: "versions";
	};
	subGroups: DisplayCollection[] | null;
};

export type PanelGroup = {
	[group: string]: PanelCollection;
};

export type GroupCollectionObj = {
	[panel in GroupType]: PanelGroup;
};

export interface LyricScopes {
	[id: string]: SongLyric;
}

export interface ScriptureScopes {
	[id: string]: HighlightedVerse;
}

export interface CacheBustMedia {
	paths: string[] | "all";
	version: number;
}

export interface SongEditData {
	open: boolean;
	song: SongData | null;
}

export interface NamingModalData {
	type: GroupType;
	group: string;
	open: boolean;
}

export interface AppDisplayData {
	scriptureTheme: Theme | undefined;
	songTheme: Theme | undefined;
	presentationTheme: Theme | undefined;
	displayContent: DisplayInfo | undefined;
}

export interface AppData {
	user: UserData | undefined;
	panelFocus: FocusPanel;
	displayData: AppDisplayData;
	hideLive: boolean;
	showLogo: boolean;
	logoBg: string;
	songsUpdateCounter: number;
	themesUpdateTrigger: number;
	mediaUpdateTrigger: number;
	loading: AppLoading;
	previewItem: DisplayProps | undefined;
	liveItem: DisplayProps | undefined;
	scheduleItems: DisplayProps[];
	displayGroups: GroupCollectionObj;
	// favorites: DisplayPropsCollection[]
	// collections: GroupCollectionObj
	themeEditor: {
		type: ThemeType;
		open: boolean;
		initial: Theme | null;
	};
	songEdit: SongEditData;
	lyricScopes: LyricScopes;
	scriptureScopes: ScriptureScopes;
	cacheBuster: CacheBustMedia;
	namingModal: NamingModalData;
	isLive: boolean;
	openSettings: boolean;
	recentSchedules: SavedSchedule[];
	// Sync schedule item selection to scripture/song panels
	syncFromSchedule: {
		type: "scripture" | "song";
		metadata?: DisplayMetadata;
	} | null;
}

export interface AppSettings {
	theme: string;
	language: string;
	projectionBounds: DisplayBounds;
	projectionDisplayId: number;
	// Appearance settings
	fontSize: "small" | "medium" | "large" | "xlarge";
	// Scripture settings
	defaultTranslation: string;
	showVerseNumbers: boolean;
	showScriptureReference: boolean;
	showStrongsTab: boolean;
	// Song settings
	showSongAuthor: boolean;
	showCcliNumber: boolean;
	autoAdvanceSlides: boolean;
}

export interface DisplayContextObj {
	displayStore: AppDisplayData;
	setDisplayStore: SetStoreFunction<AppDisplayData>;
}

export interface AppContextObj {
	appStore: AppData;
	setAppStore: SetStoreFunction<AppData>;
	settings: AppSettings;
	updateSettings: SetStoreFunction<AppSettings>;
}
