import {
	createContext,
	useContext,
	type JSX,
	type ParentProps,
} from "solid-js";
import type { SetStoreFunction } from "solid-js/store";
import type {
	EditorNode,
	RegisterNodeFn,
	RegisterNodeFnWithId,
} from "./editor-types";
import { useEditor } from "./Editor";

// Node context for editor elements

export interface NodeActions {
	setStyle: (styles: JSX.CSSProperties) => void;
}

export interface NodeContextValue {
	node: EditorNode;
	register: RegisterNodeFn;
	styles: () => JSX.CSSProperties;
	actions: NodeActions;
}

export type DragCoord = { x: number; y: number };
export type ResizeHandlePosition =
	| "topLeft"
	| "topRight"
	| "bottomLeft"
	| "bottomRight";

export const NodeContext = createContext<NodeContextValue>();

interface NodeProviderProps extends ParentProps {
	node: EditorNode;
	register: RegisterNodeFnWithId;
}

export default function NodeProvider(props: NodeProviderProps) {
	const {
		editor,
		setters: { setNodeStyle: editorSetNodeStyle },
	} = useEditor();

	// Get styles directly from props.node which is already reactive from the store
	const styles = () => props.node.style;

	const nodeActions: NodeActions = {
		setStyle: (newStyles: JSX.CSSProperties) => {
			editorSetNodeStyle(props.node.id, newStyles);
		},
	};

	return (
		<NodeContext.Provider
			value={{
				node: props.node,
				register: (ref: HTMLElement) =>
					props.register({ id: props.node.id, ref }),
				styles,
				actions: nodeActions,
			}}
		>
			{props.children}
		</NodeContext.Provider>
	);
}

export const useNode = () => {
	const value = useContext(NodeContext);

	if (!value) {
		throw new Error("There has to be a Node higher up in the component tree");
	}

	return value;
};
