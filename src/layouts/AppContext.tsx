import {
	createContext,
	createEffect,
	createMemo,
	onCleanup,
	onMount,
	untrack,
	useContext,
	type ParentProps,
} from "solid-js";
import { createStore, reconcile, unwrap } from "solid-js/store";
import type {
	AppContextObj,
	AppData,
	AppDisplayData,
	AppSettings,
} from "~/types/app-context";
import { fnReplacer, preserveDefaults } from "~/utils";
import {
	defaultAppSettings,
	defaultAppStore,
	defaultDisplayData,
	storageKey,
	syncFnPrefix,
	syncUpdateKey,
} from "~/utils/constants";
import { DisplayContext } from "./DisplayContext";

const AppContext = createContext<AppContextObj>();

export default function AppContextProvider(props: ParentProps) {
	const [displayStore, setDisplayStore] = createStore<AppDisplayData>({
		...defaultDisplayData,
	});
	const [appStore, setStore] = createStore<AppData>({ ...defaultAppStore });
	const broadcast = new BroadcastChannel(syncUpdateKey);

	const setAppStore = (...args: any[]) => {
		console.log("Syncing Args: ", args);
		// sync the args that are being passed to localstorage
		setStore(...args);
		// pass exact argument
		// localStorage.setItem(syncUpdateKey, JSON.stringify(args, fnReplacer));
		broadcast.postMessage(JSON.stringify(args, fnReplacer));
		localStorage.setItem(storageKey, JSON.stringify(unwrap(appStore)));
	};

	const syncStore = (ev: MessageEvent) => {
		if (!ev.data) return;
		console.log("Calling subscriber for event: ", ev);
		// sync the local store using the arguments when retrieved
		const jsonValue: any[] = JSON.parse(ev.data);
		const parsedValue = jsonValue.map((v) => {
			if (typeof v === "string" && v.startsWith(syncFnPrefix)) {
				// sensitive! secure this so nobody can run code remotely.
				return eval(v.replace(syncFnPrefix, ""));
			}
			return v;
		});
		console.log("Sync Event Parsed Data: ", parsedValue);
		setStore(...parsedValue);
	};
	onMount(async () => {
		// get saved state on mount
		const savedState = localStorage.getItem(storageKey);
		console.log(
			"Setting state: ",
			savedState ? JSON.parse(savedState) : savedState,
		);
		// restore saved state
		if (savedState) {
			const state = preserveDefaults(
				JSON.parse(savedState) as AppData,
				defaultAppStore,
				[
					"themeEditor",
					"scheduleItems",
					"previewItem",
					"liveItem",
					"isLive",
					"hideLive",
					"loading",
					"openSettings",
					"songEdit",
					{ displayData: ["displayContent"] },
				],
			);
			setStore(reconcile(state));
		}

		// Auto-set default themes if not already set
		const currentSongTheme = appStore.displayData?.songTheme;
		const currentScriptureTheme = appStore.displayData?.scriptureTheme;

		if (!currentSongTheme || !currentScriptureTheme) {
			try {
				const shippedThemes =
					await window.electronAPI.getShippedDefaultThemes();
				console.log("Shipped default themes:", shippedThemes);

				if (!currentSongTheme && shippedThemes.songTheme) {
					setStore("displayData", "songTheme", shippedThemes.songTheme);
				}
				if (!currentScriptureTheme && shippedThemes.scriptureTheme) {
					setStore("displayData", "scriptureTheme", shippedThemes.scriptureTheme);
				}

				// Save to localStorage after setting defaults
				localStorage.setItem(storageKey, JSON.stringify(unwrap(appStore)));
			} catch (error) {
				console.error("Failed to load shipped default themes:", error);
			}
		}

		// If there's a liveItem but no displayContent, compute it
		// This handles the case when the projection window opens and needs to show the current live item
		// We need to read from raw localStorage since liveItem is excluded from restored state
		const rawSavedState = localStorage.getItem(storageKey);
		const parsedRawState = rawSavedState ? JSON.parse(rawSavedState) : null;
		const liveItem = parsedRawState?.liveItem;
		console.log("Checking liveItem for projection:", {
			liveItem,
			displayContent: appStore.displayData?.displayContent,
			hasType: liveItem?.type,
			hasIndex: typeof liveItem?.index === "number",
		});
		if (liveItem && liveItem.type && typeof liveItem.index === "number") {
			const itemData = liveItem.data[liveItem.index];
			console.log("Setting displayContent from liveItem:", { type: liveItem.type, itemData });
			if (itemData) {
				setStore("displayData", "displayContent", {
					type: liveItem.type,
					[liveItem.type]: itemData,
				});
			}
		}

		broadcast.onmessage = syncStore;
		onCleanup(() => {
			broadcast.close();
		});
	});

	const [settings, updateSettings] =
		createStore<AppSettings>(defaultAppSettings);

	return (
		<AppContext.Provider
			value={{ appStore, setAppStore, settings, updateSettings }}
		>
			<DisplayContext.Provider value={{ displayStore, setDisplayStore }}>
				{props.children}
			</DisplayContext.Provider>
		</AppContext.Provider>
	);
}

export const useAppContext = () => {
	const value = useContext(AppContext);

	if (!value) {
		throw new Error("AppContext has not been initialized");
	}

	return value;
};
