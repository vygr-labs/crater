import { createContext, useContext, type ParentProps } from "solid-js";
import { createStore } from "solid-js/store";
import type { AppContextObj, AppData, AppSettings } from "~/types/app-context";
import { defaultAppSettings, defaultAppStore } from "~/utils/constants";

const AppContext = createContext<AppContextObj>();

export default function AppContextProvider(props: ParentProps) {
	const [appStore, setAppStore] = createStore<AppData>(defaultAppStore);
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
