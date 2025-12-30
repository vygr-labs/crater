import type { SetStoreFunction } from "solid-js/store";
import type { SavedSchedule } from "~/backend/types";
import type {
	DisplayBounds,
	DisplayProps,
	Theme,
	ThemeMetadata,
} from "~/types";
import type {
	AppData,
	AppDisplayData,
	AppSettings,
	SongEditData,
} from "~/types/app-context";

export type AppStoreUpdateFn<ExtraData = void> = (
	setStore: SetStoreFunction<AppData>,
	extra: ExtraData,
) => void;
export type DisplayStoreUpdateFn<ExtraData = void> = (
	setStore: SetStoreFunction<AppDisplayData>,
	extra: ExtraData,
) => void;
export type AppSettingsUpdateFn<ExtraData = void> = (
	setStore: SetStoreFunction<AppSettings>,
	extras: ExtraData,
) => void;

// APP STORE HELPERS

export const toggleLogo: AppStoreUpdateFn = (setStore) => {
	setStore("showLogo", (former) => !former);
};

export const toggleClearDisplay: AppStoreUpdateFn = (setStore) => {
	setStore("hideLive", (former) => !former);
};

export const toggleLive: AppStoreUpdateFn = (setStore) => {
	setStore("isLive", (former) => !former);
};

export const updateSongEdit: AppStoreUpdateFn<SongEditData> = (
	setStore,
	newSongEdit,
) => {
	setStore("songEdit", newSongEdit);
};

export const changeLogoBg: AppStoreUpdateFn<string> = (setStore, path) => {
	setStore("logoBg", path);
};

export const addToSchedule: AppStoreUpdateFn<DisplayProps[]> = (
	setStore,
	items,
) => {
	setStore("scheduleItems", (former) => [...former, ...items]);
};

export const changeDefaultTheme: AppStoreUpdateFn<Theme> = (
	setStore,
	theme,
) => {
	const storeKey =
		theme.type === "song"
			? "songTheme"
			: theme.type === "scripture"
				? "scriptureTheme"
				: "presentationTheme";
	setStore("displayData", storeKey, theme);
};

export const addRecentSchedule: AppStoreUpdateFn<SavedSchedule> = (
	setStore,
	sched,
) => {
	setStore("recentSchedules", (former) => {
		const found = former.findIndex((rc) => rc.path === sched.path);
		if (found > -1) {
			former = former.filter((fs) => fs.path !== sched.path);
		}
		console.log("Attempting schedule save", former, found);
		return [sched, ...former];
	});
};

// SETTINGS HELPERS

export const updateDisplayBounds: AppSettingsUpdateFn<DisplayBounds> = (
	setStore,
	newVal,
) => {
	setStore("projectionBounds", newVal);
};

export const updateProjectionDisplayId: AppSettingsUpdateFn<number> = (
	setStore,
	newVal,
) => {
	setStore("projectionDisplayId", newVal);
};

export const toggleTheme: AppSettingsUpdateFn = (setStore) => {
	setStore("theme", (former) => (former === "light" ? "dark" : "light"));
};

// Appearance settings
export const updateFontSize: AppSettingsUpdateFn<
	"small" | "medium" | "large" | "xlarge"
> = (setStore, newVal) => {
	setStore("fontSize", newVal);
};

// Scripture settings
export const updateDefaultTranslation: AppSettingsUpdateFn<string> = (
	setStore,
	newVal,
) => {
	setStore("defaultTranslation", newVal);
};

export const toggleShowVerseNumbers: AppSettingsUpdateFn = (setStore) => {
	setStore("showVerseNumbers", (former) => !former);
};

export const toggleShowScriptureReference: AppSettingsUpdateFn = (setStore) => {
	setStore("showScriptureReference", (former) => !former);
};

export const toggleShowStrongsTab: AppSettingsUpdateFn = (setStore) => {
	setStore("showStrongsTab", (former) => !former);
};

export const toggleScriptureInputMode: AppSettingsUpdateFn = (setStore) => {
	setStore("scriptureInputMode", (former) =>
		former === "controlled" ? "crater" : "controlled",
	);
};

// Song settings
export const toggleShowSongAuthor: AppSettingsUpdateFn = (setStore) => {
	setStore("showSongAuthor", (former) => !former);
};

export const toggleShowCcliNumber: AppSettingsUpdateFn = (setStore) => {
	setStore("showCcliNumber", (former) => !former);
};

export const toggleAutoAdvanceSlides: AppSettingsUpdateFn = (setStore) => {
	setStore("autoAdvanceSlides", (former) => !former);
};

// General settings
export const toggleAuthoritativeOverlay: AppSettingsUpdateFn = (setStore) => {
	setStore("authoritativeOverlay", (former) => !former);
};
