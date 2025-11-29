import {
	createSignal,
	createContext,
	useContext,
	type Accessor,
} from "solid-js";
import type { ExportedTheme } from "./editor-types";
import { appLogger } from "~/utils/logger";

export interface HistoryState {
	nodes: ExportedTheme["nodes"];
	selectedId: string | null | undefined;
}

export interface EditorHistoryContextValue {
	canUndo: Accessor<boolean>;
	canRedo: Accessor<boolean>;
	historyIndex: Accessor<number>;
	historyLength: Accessor<number>;
	saveState: (state: HistoryState) => void;
	undo: () => HistoryState | null;
	redo: () => HistoryState | null;
	clearHistory: () => void;
	hasChanges: Accessor<boolean>;
	markSaved: () => void;
}

// Deep clone using JSON to avoid issues with proxies and non-cloneable objects
function deepClone<T>(obj: T): T {
	try {
		return JSON.parse(JSON.stringify(obj));
	} catch {
		appLogger.warn("Failed to clone editor state, returning empty");
		return { nodes: [], selectedId: null } as T;
	}
}

export function createEditorHistory(maxHistory = 50) {
	const [history, setHistory] = createSignal<HistoryState[]>([]);
	const [historyIndex, setHistoryIndex] = createSignal(-1);
	const [savedIndex, setSavedIndex] = createSignal(-1);

	const canUndo = () => historyIndex() > 0;
	const canRedo = () => historyIndex() < history().length - 1;
	const historyLength = () => history().length;
	const hasChanges = () => historyIndex() !== savedIndex();

	const saveState = (state: HistoryState) => {
		const currentHistory = history().slice(0, historyIndex() + 1);
		const clonedState = deepClone(state);

		// Limit history size
		if (currentHistory.length >= maxHistory) {
			currentHistory.shift();
			// Adjust saved index
			if (savedIndex() >= 0) {
				setSavedIndex(savedIndex() - 1);
			}
		}

		setHistory([...currentHistory, clonedState]);
		setHistoryIndex(currentHistory.length);
	};

	const undo = (): HistoryState | null => {
		if (!canUndo()) return null;
		const newIndex = historyIndex() - 1;
		setHistoryIndex(newIndex);
		return deepClone(history()[newIndex]);
	};

	const redo = (): HistoryState | null => {
		if (!canRedo()) return null;
		const newIndex = historyIndex() + 1;
		setHistoryIndex(newIndex);
		return deepClone(history()[newIndex]);
	};

	const clearHistory = () => {
		setHistory([]);
		setHistoryIndex(-1);
		setSavedIndex(-1);
	};

	const markSaved = () => {
		setSavedIndex(historyIndex());
	};

	return {
		canUndo,
		canRedo,
		historyIndex,
		historyLength,
		saveState,
		undo,
		redo,
		clearHistory,
		hasChanges,
		markSaved,
	};
}

const EditorHistoryContext = createContext<EditorHistoryContextValue>();

export function useEditorHistory() {
	const context = useContext(EditorHistoryContext);
	if (!context) {
		throw new Error(
			"useEditorHistory must be used within EditorHistoryProvider",
		);
	}
	return context;
}

export default EditorHistoryContext;
