import { GroupType } from "@/components/app/songs/SongSelection";
import {
	AppData,
	CacheBustMedia,
	LyricScopes,
	ScriptureScopes,
} from "./appSlice";
import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { DisplayInfo, DisplayType, Theme, ThemeType } from "../types";
import { getReference } from "..";
import { DEFAULT_SCRIPTURE_COLLECTION_ID } from "../constants";

const selectApp = (state: RootState) => state.app;
export const selectAllFavorites = (state: RootState) => state.app.favorites;
export const selectAllCollections = (state: RootState) => state.app.collections;
export const selectType = (state: RootState, type: GroupType) => type;

export const selectCollections = createSelector(
	[selectAllCollections, selectType],
	(collections, type) =>
		collections.filter((collection) => collection.type === type),
);
export const selectFavorites = createSelector(
	[selectAllFavorites, selectType],
	(favorites, type) => favorites.find((favorite) => favorite.type === type),
);
export const selectDefaultScriptureCollection = createSelector(
	selectAllCollections,
	(collections) => {
		console.log("Selecting Default Scripture Collection: ", collections);
		const result = collections.find(
			(collection) =>
				collection.type === "scripture" &&
				collection.id === DEFAULT_SCRIPTURE_COLLECTION_ID,
		);
		if (!result) {
			// collections.push({
			// 	id: DEFAULT_SCRIPTURE_COLLECTION_ID,
			// 	name: 'Default Scripture Collection',
			// 	type: 'scripture',
			// 	items: [],
			// })
			// console.log('Created: ', collections)
		}
		return result;
	},
);

// Selector to get the lyricScopes from the app state
const selectLyricScopes = (state: RootState) => state.app.lyricScopes;
const selectScriptureScopes = (state: RootState) => state.app.scriptureScopes;

// Selector to get the displayData from the app state
const selectDisplayData = (state: RootState) => state.app.displayData;

const selectRenderScope = (state: RootState, scope?: string) => scope;

/**
 * Selector factory that returns a selector for the lyric data based on the provided scope.
 * This replaces the logic in your useEffect hook.
 *
 * @param {string | undefined} scope - The scope identifier for localized data.
 * @returns {function(AppState): string[]} A selector function that takes the Redux state and returns the lyric data.
 */
export const selectLyric = createSelector(
	selectLyricScopes,
	selectDisplayData,
	selectRenderScope,
	(
		lyricScopes: LyricScopes,
		displayData: DisplayInfo | null,
		scope?: string,
	): string[] => {
		// If a scope is provided, return the data from lyricScopes for that scope
		console.log("Selecting Lyric: ", scope, lyricScopes);
		if (scope && lyricScopes && lyricScopes[scope]) {
			return lyricScopes[scope].text;
		}

		// If no scope is provided, check displayData
		if (displayData && displayData.type === "song" && displayData.song?.text) {
			return displayData.song.text;
		}

		// Default fallback if neither condition is met
		return [];
	},
);

export const selectScripture = createSelector(
	selectScriptureScopes,
	selectDisplayData,
	selectRenderScope,
	(
		scriptureScopes: ScriptureScopes,
		displayData: DisplayInfo | null,
		scope?: string,
	): { reference: string; text: string } => {
		// If a scope is provided, return the data from lyricScopes for that scope
		console.log("Selecting Verse: ", scope, scriptureScopes);
		let scripture;

		if (scope && scriptureScopes && scriptureScopes[scope]) {
			scripture = scriptureScopes[scope];
		}

		// If no scope is provided, check displayData
		if (
			displayData &&
			displayData.type === "scripture" &&
			displayData.scripture
		) {
			scripture = displayData.scripture;
		}

		if (scripture) {
			return { reference: getReference(scripture), text: scripture.text };
		}

		return { reference: "", text: "" };
	},
);

const selectDefaultScriptureTheme = (state: RootState) =>
	state.app.scriptureTheme;
const selectDefaultSongTheme = (state: RootState) => state.app.songTheme;
const selectDefaultPresentationTheme = (state: RootState) =>
	state.app.presentationTheme;

export const getDefaultThemeIDs = createSelector(
	selectDefaultScriptureTheme,
	selectDefaultSongTheme,
	selectDefaultPresentationTheme,
	(scriptureTheme?: Theme, songTheme?: Theme, presentationTheme?: Theme) => ({
		scriptureId: scriptureTheme?.id,
		songId: songTheme?.id,
		presentationId: presentationTheme?.id,
	}),
);

const selectCacheBuster = (state) => state.app.cacheBuster;
const selectMediaPath = (state, path: string) => path;

export const getMediaPath = createSelector(
	selectCacheBuster,
	selectMediaPath,
	(cacheBuster: CacheBustMedia, path: string) => {
		console.log("CacheBuster in Selector: ", cacheBuster);
		if (cacheBuster.paths.includes(path) || cacheBuster.paths === "all") {
			return `${path}?v=${cacheBuster.version}`;
		} else {
			return path;
		}
	},
);

const selectThemeType = (state, type: DisplayType) => type;
export const getDefaultTheme = createSelector(
	selectThemeType,
	selectDefaultScriptureTheme,
	selectDefaultSongTheme,
	selectDefaultPresentationTheme,
	(
		type: DisplayType,
		scriptureTheme?: Theme,
		songTheme?: Theme,
		presentationTheme?: Theme,
	) => {
		console.log("WIll return for: ", type, scriptureTheme, songTheme);
		switch (type) {
			case "scripture":
				return scriptureTheme;
			case "song":
				return songTheme;
			case "presentation":
				return presentationTheme;
			default:
				return null;
		}
	},
);
