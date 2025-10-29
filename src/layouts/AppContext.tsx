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
import type { AppContextObj, AppData, AppSettings } from "~/types/app-context";
import { fnReplacer, preserveDefaults } from "~/utils";
import {
	defaultAppSettings,
	defaultAppStore,
	storageKey,
	syncFnPrefix,
	syncUpdateKey,
} from "~/utils/constants";

const AppContext = createContext<AppContextObj>();

export default function AppContextProvider(props: ParentProps) {
	const [appStore, setStore] = createStore<AppData>(defaultAppStore);
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
	onMount(() => {
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
					"displayData",
				],
			);
			setStore(reconcile(state));
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
			{props.children}
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
