import type { SetStoreFunction } from "solid-js/store";
import type { DisplayBounds } from "~/types";
import type { AppData, AppSettings, SongEditData } from "~/types/app-context";

export type AppStoreUpdateFn<ExtraData = void> = (setStore: SetStoreFunction<AppData>, extra: ExtraData) => void
export type AppSettingsUpdateFn<ExtraData = void> = (setStore: SetStoreFunction<AppSettings>, extras: ExtraData) => void


// APP STORE HELPERS

export const toggleLogo: AppStoreUpdateFn = (setStore) => {
    setStore("showLogo", former => !former);
}

export const toggleClearDisplay: AppStoreUpdateFn = (setStore) => {
    setStore("hideLive", former => !former);
}

export const toggleLive: AppStoreUpdateFn = (setStore) => {
    setStore("isLive", former => !former);
}

export const updateSongEdit: AppStoreUpdateFn<SongEditData> = (setStore, newSongEdit) => {
    setStore("songEdit", newSongEdit);
}


// SETTINGS HELPERS

export const updateDisplayBounds: AppSettingsUpdateFn<DisplayBounds> = (setStore, newVal) => {
    setStore("projectionBounds", newVal);
}

export const updateProjectionDisplayId: AppSettingsUpdateFn<number> = (setStore, newVal) => {
    setStore("projectionDisplayId", newVal);
}

export const toggleTheme: AppSettingsUpdateFn = (setStore) => {
    setStore("theme", former => former === "light" ? "dark" : "left");
}