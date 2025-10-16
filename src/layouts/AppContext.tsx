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
import {
	defaultAppSettings,
	defaultAppStore,
	storageKey,
	syncUpdateKey,
} from "~/utils/constants";

const AppContext = createContext<AppContextObj>();

export default function AppContextProvider(props: ParentProps) {
	const [appStore, setStore] = createStore<AppData>(defaultAppStore);

	const setAppStore = (...args: any[]) => {
		// console.log("Syncing Args: ", args, JSON.stringify(unwrap(appStore)));
		// sync the args that are being passed to localstorage
		setStore(...args);
		// pass exact argument
		localStorage.setItem(syncUpdateKey, JSON.stringify(args));
		localStorage.setItem(storageKey, JSON.stringify(unwrap(appStore)));
	};

	const syncStore = (ev: StorageEvent) => {
		if (
			ev.key !== syncUpdateKey ||
			!ev.newValue
			// || ev.newValue === JSON.stringify(appStore)
		)
			return;
		console.log("Calling subscriber for event: ", ev);
		// sync the local store using the arguments when retrieved
		setStore(...JSON.parse(ev.newValue));
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
			setStore(reconcile(JSON.parse(savedState)));
		}
		window.addEventListener("storage", syncStore);

		onCleanup(() => {
			window.removeEventListener("storage", syncStore);
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
