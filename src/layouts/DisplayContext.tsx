import { createContext, useContext, type ParentProps } from "solid-js";
import { createStore } from "solid-js/store";
import type { AppDisplayData, DisplayContextObj } from "~/types/app-context";
import { defaultDisplayData } from "~/utils/constants";

export const DisplayContext = createContext<DisplayContextObj>();

interface Props extends ParentProps {}

export const DisplayContextProvider = (props: Props) => {
	const [displayStore, setDisplayStore] = createStore<AppDisplayData>({
		...defaultDisplayData,
	});

	return (
		<DisplayContext.Provider value={{ displayStore, setDisplayStore }}>
			{props.children}
		</DisplayContext.Provider>
	);
};

export const useDisplayStore = () => {
	const value = useContext(DisplayContext);

	if (!value) {
		throw new Error("No parent display context to access");
	}

	return value;
};
