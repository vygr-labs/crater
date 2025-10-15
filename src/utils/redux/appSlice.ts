import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DisplayProps } from "@/app/controls/page";
import {
	FocusPanel,
	Theme,
	DisplayInfo,
	ThemeType,
	DisplayType,
	HighlightedVerse,
	MediaItem,
	DisplayItem,
} from "../types";
import { GroupCategory, GroupType } from "@/components/app/songs/SongSelection";
import { SongData, SongLyric } from "@/context";
import { DEFAULT_SCRIPTURE_COLLECTION_ID } from "../constants";

const APP_FAVORITES: DisplayPropsCollection[] = [
	{
		id: 0,
		name: "Favorites",
		type: "song",
		items: [],
	},
	{
		id: 1,
		name: "Favorites",
		type: "scripture",
		items: [],
	},
	{
		id: 2,
		name: "Favorites",
		type: "media",
		items: [],
	},
];

const DEFAULT_COLLECTIONS: DisplayPropsCollection[] = [
	{
		id: DEFAULT_SCRIPTURE_COLLECTION_ID,
		name: "Default Scripture Collection",
		type: "scripture",
		items: [],
	},
];

type AppLoading = {
	reason: string;
	isLoading: boolean;
};

export interface UserData {
	id: string;
	name: string;
}

export interface CreateCollection {
	name: string;
	type: GroupType;
	items: number[];
}

export interface DisplayPropsCollection extends CreateCollection {
	id: number;
}

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
	group: GroupCategory;
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
	loading: AppLoading;
	previewItem: DisplayProps | undefined;
	liveItem: DisplayProps | undefined;
	scheduleItems: DisplayProps[];
	favorites: DisplayPropsCollection[];
	collections: DisplayPropsCollection[];
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
}

// adding arrays to app state takes a few reloads to show in redux/persist and are undefined till then
const initialState: AppData = {
	user: null,
	panelFocus: "scripture",
	scriptureTheme: null,
	songTheme: null,
	presentationTheme: null,
	displayData: null,
	hideLive: false,
	showLogo: false,
	logoBg: "",
	songsUpdateCounter: 0,
	loading: {
		reason: "Nothing is loading",
		isLoading: false,
	},
	previewItem: undefined,
	liveItem: undefined,
	scheduleItems: [],
	collections: DEFAULT_COLLECTIONS,
	favorites: APP_FAVORITES,
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
};

export const appSlice = createSlice({
	name: "app",
	initialState,
	reducers: {
		updateUser: (state, action: PayloadAction<UserData>) => {
			state.user = { ...state.user, ...action.payload };
		},
		changeFocusPanel: (state, action: PayloadAction<FocusPanel>) => {
			state.panelFocus = action.payload;
		},
		changeScriptureTheme: (state, action: PayloadAction<Theme | null>) => {
			if (action.payload && typeof action.payload.theme_data !== "string") {
				action.payload.theme_data = JSON.stringify(action.payload.theme_data);
			}
			state.scriptureTheme = action.payload;
		},
		changeSongTheme: (state, action: PayloadAction<Theme | null>) => {
			console.log(
				"Changing song theme: ",
				action.payload,
				action.payload.theme_data,
			);
			if (action.payload && typeof action.payload.theme_data !== "string") {
				action.payload.theme_data = JSON.stringify(action.payload.theme_data);
			}
			state.songTheme = action.payload;
		},
		toggleClearDisplay: (state) => {
			state.hideLive = !state.hideLive;
		},
		toggleLogo: (state) => {
			state.showLogo = !state.showLogo;
		},
		updateDisplayData: (state, action: PayloadAction<DisplayInfo>) => {
			state.displayData = action.payload;
		},
		changeLogoBackground: (state, action: PayloadAction<string>) => {
			// Invalidate cache when a logo background is set
			state.logoBg = action.payload + "?t=" + Date.now();
		},
		updateAppLoading: (state, action: PayloadAction<AppLoading>) => {
			state.loading = action.payload;
		},
		triggerSongsUpdate: (state) => {
			state.songsUpdateCounter++;
		},
		setPreviewItem: (
			state,
			action: PayloadAction<DisplayProps | undefined>,
		) => {
			state.previewItem = action.payload;
		},
		setLiveItem: (state, action: PayloadAction<DisplayProps | undefined>) => {
			state.liveItem = action.payload;
		},
		addToSchedule: (state, action: PayloadAction<DisplayProps[]>) => {
			state.scheduleItems = state.scheduleItems.concat(action.payload);
		},
		createCollection: (state, action: PayloadAction<CreateCollection>) => {
			state.collections = state.collections.concat([
				{ id: state.collections.length, ...action.payload },
			]);
		},
		createFavorite: (state, action: PayloadAction<CreateCollection>) => {
			// For favorites, we just use the existing favorites structure
			// This is mainly for consistency, but favorites are typically predefined
			console.log("Create favorite called, but favorites are predefined");
		},
		updateCollection: (
			state,
			action: PayloadAction<DisplayPropsCollection>,
		) => {
			state.collections = state.collections.map((collection) =>
				collection.id === action.payload.id ? action.payload : collection,
			);
		},
		addToFavorites: (
			state,
			action: PayloadAction<{ type: GroupType; items: number[] }>,
		) => {
			const typeFavorites = state.favorites.find(
				(favorite) => favorite.type === action.payload.type,
			);
			if (typeFavorites) {
				typeFavorites.items.push(...action.payload.items);
				console.log("Updated collection:", { ...typeFavorites });
			} else {
				console.warn("Collection not found for type:", action.payload.type);
			}
		},
		addToCollection: (
			state,
			action: PayloadAction<{ id: number; items: number[] }>,
		) => {
			const collection = state.collections.find(
				(collection) => collection.id === action.payload.id,
			);
			if (collection) {
				collection.items.push(...action.payload.items);
				console.log("Updated collection:", { ...collection });
			} else {
				console.warn("Collection not found for ID:", action.payload.id);
			}
		},
		updateFavorite: (state, action: PayloadAction<DisplayPropsCollection>) => {
			state.favorites = state.favorites.map((favorite) =>
				favorite.id === action.payload.id ? action.payload : favorite,
			);
		},
		removeFromSchedule: (state, action: PayloadAction<number>) => {
			state.scheduleItems.splice(action.payload, 1);
		},
		clearSchedule: (state) => {
			state.scheduleItems = [];
		},
		updateScheduleItems: (state, action: PayloadAction<DisplayProps[]>) => {
			state.scheduleItems = action.payload;
		},
		updateThemeEditor: (
			state,
			action: PayloadAction<{
				type?: ThemeType;
				open?: boolean;
				initial?: Theme | null;
			}>,
		) => {
			state.themeEditor = { ...state.themeEditor, ...action.payload };
		},
		addLyricScope: (
			state,
			action: PayloadAction<{ id: string; item: SongLyric }>,
		) => {
			state.lyricScopes = {
				...state.lyricScopes,
				[action.payload.id]: action.payload.item,
			};
			console.log("Updated lyric scope: ", state.lyricScopes);
		},
		addScriptureScope: (
			state,
			action: PayloadAction<{ id: string; item: HighlightedVerse }>,
		) => {
			state.scriptureScopes = {
				...state.scriptureScopes,
				[action.payload.id]: action.payload.item,
			};
			console.log("Updated scripture scope: ", state.scriptureScopes);
		},
		bustMediaCache: (state, action: PayloadAction<string[] | "all">) => {
			state.cacheBuster = {
				paths: action.payload,
				version: ++state.cacheBuster.version,
			};
			console.log("Cache Busted: ", state.cacheBuster, action.payload);
		},
		updateSongEdit: (state, action: PayloadAction<SongEditData>) => {
			state.songEdit = action.payload;
		},
		triggerNamingModal: (state, action: PayloadAction<NamingModalData>) => {
			state.namingModal = action.payload;
		},
		toggleLive: (state, action: PayloadAction<boolean>) => {
			state.isLive = action.payload;
		},
	},
});

export const {
	updateUser,
	changeFocusPanel,
	changeScriptureTheme,
	changeSongTheme,
	toggleClearDisplay,
	toggleLogo,
	updateDisplayData,
	changeLogoBackground,
	triggerSongsUpdate,
	updateAppLoading,
	// Export new actions
	setPreviewItem,
	setLiveItem,
	addToSchedule,
	removeFromSchedule,
	clearSchedule,
	updateScheduleItems,
	createCollection,
	createFavorite,
	updateFavorite,
	updateCollection,
	updateThemeEditor,
	addLyricScope,
	addScriptureScope,
	bustMediaCache,
	updateSongEdit,
	triggerNamingModal,
	toggleLive,
	addToCollection,
	addToFavorites,
} = appSlice.actions;

export default appSlice.reducer;
