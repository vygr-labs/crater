import { DEFAULT_SCRIPTURE_COLLECTION_ID } from "~/utils/constants";
import type { SongData, SongLyric } from "./context";
import type {
	DisplayBounds,
	DisplayInfo,
	DisplayProps,
	FocusPanel,
	GroupCategory,
	GroupType,
	HighlightedVerse,
	Theme,
} from "./index";
import type { SetStoreFunction } from "solid-js/store";

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
	type?: ThemeType;
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

export interface AppData {
	user: UserData | undefined;
	panelFocus: FocusPanel;
	scriptureTheme: Theme | undefined;
	songTheme: Theme | undefined;
	presentationTheme: Theme | undefined;
	displayData: DisplayInfo | undefined;
	hideLive: boolean;
	showLogo: boolean;
	logoBg: string;
	songsUpdateCounter: number;
	themesUpdateTrigger: number;
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
}

export interface AppSettings {
	theme: string;
	language: string;
	projectionBounds: DisplayBounds;
	projectionDisplayId: number;
}

export interface AppContextObj {
	appStore: AppData;
	setAppStore: SetStoreFunction<AppData>;
	settings: AppSettings;
	updateSettings: SetStoreFunction<AppSettings>;
}
