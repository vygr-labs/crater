import { createContext, createEffect, createMemo, on, useContext, type Accessor, type JSX, type ParentProps, type Setter } from "solid-js";
import { createStore, type SetStoreFunction } from "solid-js/store";
import type { EditorNode, RegisterNodeFn, RegisterNodeFnWithId } from "./editor-types";
import { useDraggable } from "solidjs-use";
import { createSpring, animated } from "solid-spring";
import { useEditor } from "./Editor";
import { css } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";
import { createDraggable, useDragDropContext, type Draggable } from "@thisbeyond/solid-dnd";
import { Box } from "styled-system/jsx";
import { token } from "styled-system/tokens";
import { useDrag } from "solid-gesture";
import type { DragState } from "@use-gesture/core/types";
import { calculateParentOffset } from "~/utils";

export interface NodeActions {
	setStyle: SetStoreFunction<JSX.CSSProperties>;
}

export interface NodeContextValue {
	node: EditorNode;
	// setNode: Setter<EditorNode>;
	register: RegisterNodeFn;
	styles: JSX.CSSProperties;
	actions: NodeActions;
	bindDrag: Accessor<Record<string, any>>;
	// dragStyles: Accessor<JSX.CSSProperties>;
}

export type DragCoord = { x: number; y: number };
export type ResizeHandlePosition = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

export const NodeContext = createContext<NodeContextValue>();

interface NodeProviderProps extends ParentProps {
	node: EditorNode;
	register: RegisterNodeFnWithId;
}

interface NodeProviderStore {
	node: EditorNode;
	coords: DragCoord;
	position: number[];
	dragDisabled: boolean;
	resizeCoords: Record<ResizeHandlePosition, DragCoord>;
	resizePositions: Record<ResizeHandlePosition, number[]>;
}

// const defaultStyles = css({
//     width: "fit-content",
//     borderWidth: demarcationBorderWidth,
//     borderStyle: "dashed",
//     borderColor: "red.400",
//     // position: "relative"
//     position: "absolute"
// })

const defaultCoords = { x: 0, y: 0 };
const defaultPositions = [0, 0];

export default function NodeProvider(props: NodeProviderProps) {
	const {
		editor,
		getters: { getRootRef },
	} = useEditor();
	const [nodeStore, setNodeStore] = createStore<NodeProviderStore>({
		node: props.node,
		coords: { ...defaultCoords }, // destructure when assigning to stores so you don't set a reference that another property will make use of (which will make updates to one property to affect the other)
		position: [0, 0],
		dragDisabled: false,
		resizeCoords: {
			topLeft: defaultCoords,
			topRight: defaultCoords,
			bottomLeft: defaultCoords,
			bottomRight: defaultCoords,
		},
		resizePositions: {
			topLeft: defaultPositions,
			topRight: defaultPositions,
			bottomLeft: defaultPositions,
			bottomRight: defaultPositions,
		},
	});
	const [nodeStyle, setNodeStyle] = createStore(nodeStore.node.style);

    createEffect(() => {
        console.log("Updating Node Width: ", nodeStyle.width)
    })

	// const dragStyles = createMemo(() => ({ transform: `scale3d(${nodeStore.node.data.resize.x}, ${props.node.data.resize.y}, ${props.node.data.resize.z}) translate3d(${nodeStore.coords.x}px, ${nodeStore.coords.y}px, 0)`, top: nodeStore.position[1] + "%", left: nodeStore.position[0] + "%", width: nodeStore.node.data.resize.width, height: nodeStore.node.data.resize.height }));
	createEffect(() => {
        console.log("Setting styles: ", props.node.style, nodeStore.node.style)
		setNodeStyle({
			transform: `scale3d(${nodeStore.node.data.resize.x}, ${props.node.data.resize.y}, ${props.node.data.resize.z}) translate3d(${nodeStore.coords.x}px, ${nodeStore.coords.y}px, 0)`,
			top: nodeStore.position[1] + "%",
			left: nodeStore.position[0] + "%",
		});
	});

	const bindDrag = useDrag(
		(dragState: DragState) => {
			const {
                active,
				movement: [mx, my],
				offset: [left, top],
				overflow,
				target,
			} = dragState;
			// console.log("Debug: ", nodeStore.node.id, [mx, my], nodeStore.node.el)
			if (!active) {
				console.log("Setting position values for: ", nodeStore.node.id, nodeStore.node);
				const rootEditorRect = getRootRef()?.getBoundingClientRect();
				if (!rootEditorRect) return;
				const boundingPosition = (target as HTMLElement).getBoundingClientRect();

				const [relativeLeftPercent, relativeTopPercent] = calculateParentOffset(boundingPosition, rootEditorRect, true);
				// console.log(boundingPosition, relativeTop, relativeLeft, relativeTopPercent, relativeLeftPercent);
				setNodeStore("position", [relativeLeftPercent, relativeTopPercent]);
			}
			setNodeStore("coords", { x: active ? mx : 0, y: active ? my : 0 });
			editor.handlers.dragNode.forEach((cb) => cb(dragState));
		},
		{
			bounds: getRootRef(),
			// enabled: !nodeStore.dragDisabled
		},
	);

	const nodeActions = {
		setStyle: setNodeStyle,
	};

	return (
		<NodeContext.Provider value={{ node: nodeStore.node, register: (ref: HTMLElement) => props.register({ id: nodeStore.node.id, ref }), styles: nodeStyle, actions: nodeActions, bindDrag }}>
			{/* ref={ref => props.register({id: nodeStore.node.id, ref})} */}
			{/* <Box class={defaultStyles}> */}
			{props.children}

			{/* </Box> */}
		</NodeContext.Provider>
	);
}

export const useNode = () => {
	const value = useContext(NodeContext);

	if (!value) {
		throw new Error("There has to be a Node up in the component tree");
	}

	return value;
};
