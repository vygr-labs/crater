import { Box } from "styled-system/jsx";
import { useEditor } from "../Editor";
import { Dynamic, For } from "solid-js/web";
import NodeProvider, { NodeContext } from "../Node";
import { cva } from "styled-system/css";
import { useDrag, useGesture } from "solid-gesture";
import type { DragState } from "@use-gesture/core/types";
import { createStore, unwrap } from "solid-js/store";
import { createEffect, createMemo } from "solid-js";
import { calculateParentOffset } from "~/utils";
import { useElementSize, usePointer } from "solidjs-use";

const demarcationBorderWidth = 2;

const resizeHandlerRecipe = cva({
	base: {
		backgroundColor: "red.400",
		width: "10px",
		height: "10px",
		borderRadius: "100%",
		position: "absolute",
		cursor: "grab",
	},
	variants: {
		position: {
			topLeft: {
				top: 0,
				left: 0,
				transform: "translate3d(-50%, -50%, 0)",
			},
			topRight: {
				top: 0,
				right: 0,
				transform: "translate3d(50%, -50%, 0)",
			},
			bottomLeft: {
				bottom: 0,
				left: 0,
				transform: "translate3d(-50%, 50%, 0)",
			},
			bottomRight: {
				bottom: 0,
				right: 0,
				transform: "translate3d(50%, 50%, 0)",
			},
		},
	},
});

// const getHandleStyle = (y: "top" | "bottom", x: "left" | "right") => {
//     let translatePosition = ""
//     if (y === "top" && x === "left") translatePosition = "translate(-50%, -50%)";
//     if (y === "top" && x === "right") translatePosition = "translate(50%, -50%)";
//     if (y === "bottom" && x === "left") translatePosition = "translate(-50%, 50%)";
//     if (y === "bottom" && x === "right") translatePosition = "translate(50%, 50%)";

//     return {
//         ...resizeHandleBaseStyles,
//         [y]: 0,
//         [x]: 0,
//         transform: translatePosition
// }}

export default function RenderEditor() {
	const {
		editor,
		getters: { getNodeRenderComp, getSelectedNode },
		connectors: { register },
		setters: { setRootRef, setNodeStyle },
		hooks: { useSelect, useNodeDrag, useResizeNode },
	} = useEditor();
	const [store, setStore] = createStore({
		indicatorPos: [0, 0],
		dragHandlerCoords: {
			topLeft: { x: 0, y: 0 }
		},
		scale: { x: 1, y: 1, z: 1 },
		selectedNodeSize: { width: 0, height: 0 }
	});
	let editorRootRef!: HTMLDivElement;
	let selectedIndicatorRef!: HTMLDivElement;
	const { width: selectedNodeWidth, height: selectedNodeHeight } = useElementSize(() => getSelectedNode()?.el)
	const selectedIndicatorPosition = createMemo(() => ({
		width: selectedNodeWidth() + "px",
		height: selectedNodeHeight() + "px",
		transform: `scale3d(${store.scale.x}, ${store.scale.y}, ${store.scale.z}) translate3d(${store.indicatorPos[0]}px, ${store.indicatorPos[1]}px, 0)`,
		// top: store.indicatorPos[0] + "%",
		// left: store.indicatorPos[1] + "%",
	}));
	// const { x, y, pressure, pointerType } = usePointer()
	// createEffect(() => {console.log("Pointer: ", x(), y())})
	// const handlePos = createMemo(() => ({
	// 	topLeft: {
	// 		transform: `translate3d(${store.dragHandlerCoords["topLeft"].x}px, ${store.dragHandlerCoords["topLeft"].y}px, 0)`,
	// 	}
	// }))

	// useSelect(({ formerSelected, newSelected }) => {
	// 	console.log("Item Selected: ", formerSelected?.id, newSelected?.id);
	// 	if (newSelected) {
	// 		const pos = calculateParentOffset(newSelected.el.getBoundingClientRect(), editorRootRef.getBoundingClientRect(), true);
	// 		console.log("OFFSETS: ", pos);
	// 		setStore("indicatorPos", pos);
	// 	}
	// });

	useNodeDrag(({ target, offset }) => {
		const newPos = calculateParentOffset((target as HTMLElement).getBoundingClientRect(), editorRootRef.getBoundingClientRect(), true);
		setStore(
			"indicatorPos",
			offset.map((v) => v - demarcationBorderWidth),
		);
	});

	const updateSize = ([left, top]: number[]) => {
		const elRect = store.selectedNodeSize // getSelectedNode()?.el.getBoundingClientRect();
		const rootRefRect = editorRootRef.getBoundingClientRect();
		if (rootRefRect && elRect && editor.selectedId) {
			// console.log("scaling debug: ", initialLeft, left, initialTop, top);
			const newWidth = ((elRect.width + left) / rootRefRect.width) * 100;
			const newHeight = ((elRect.height + top) / rootRefRect.height) * 100;
			console.log(elRect.width, elRect.height, elRect.width + left, elRect.height + top)
			console.log(newWidth, newHeight);
			setNodeStyle(editor.selectedId, {"width": newWidth + "%"});
			setNodeStyle(editor.selectedId, {"height": newHeight + "%"});
		}
	};

	const resizeBind = useGesture({
		onDragStart: () => {
			console.log("Preserved Size: ", selectedNodeWidth(), selectedNodeHeight())
			setStore("selectedNodeSize", { width: selectedNodeWidth(), height: selectedNodeHeight() })
		},
		onDrag: ({ xy, active, movement, initial, offset, delta, lastOffset, distance, target }: DragState) => {
			// const boundaryStart = editorRootRef.getBoundingClientRect();
			// const initialX = initial[0] - boundaryStart.x;
			// const initialY = initial[1] - boundaryStart.y;
			console.log("scaling debug: ", initial, movement, delta, offset, lastOffset, xy, distance);
			// const newX = xy[0] - boundaryStart.x;
			// const newY = xy[1] - boundaryStart.y;
			// const scaleX = newX / initialX;
			// const scaleY = newY / initialY;
			// const newWidth = selectedNodeWidth() + movement[0];
			// const newHeight = selectedNodeHeight() + movement[1];
			// console.log("scaling width value: ", selectedNodeWidth(), selectedNodeHeight(), newWidth, newHeight)

			// // console.log("scale value: ", newX, newY, scaleX, scaleY);
			// // console.log(movement, offset);
			updateSize(movement);
			// if (!down) {
			// }
			// setStore("dragHandlerCoords", "topLeft", { x: down ? movement[0] : 0, y: down ? movement[1] : 0 });
			
			// setStore("scale", {x: scaleX, y: scaleY } )
			// useResizeNode(editor.selectedId, {x: scaleX, y: scaleY, z: 1, width: newWidth + "px", height: newHeight + "px" })
		},
	},
		{
			drag: {
				bounds: editorRootRef,
			}
		},
	);

	return (
		<Box
			pos="relative"
			w="full"
			h={96}
			bgColor="bg.muted"
			ref={(ref) => {
				editorRootRef = ref;
				setRootRef(ref);
			}}
		>
			<For each={Object.keys(editor.nodes)}>
				{(id) => (
					<NodeProvider node={editor.nodes[id]} register={register}>
						<Dynamic component={getNodeRenderComp(editor.nodes[id])} {...getNodeRenderComp(editor.nodes[id]).config.props} />
					</NodeProvider>
				)}
			</For>
			<Box ref={selectedIndicatorRef} pointerEvents="none" width="fit-content" borderWidth={demarcationBorderWidth} borderStyle="dashed" borderColor="red.400" position="absolute" boxSizing="content-box" style={selectedIndicatorPosition()} transformOrigin="top left">
				<Box pointerEvents="auto" class={resizeHandlerRecipe({ position: "topLeft" })} />
				<Box pointerEvents="auto" class={resizeHandlerRecipe({ position: "topRight" })} />
				<Box pointerEvents="auto" class={resizeHandlerRecipe({ position: "bottomLeft" })} />
				<Box pointerEvents="auto" class={resizeHandlerRecipe({ position: "bottomRight" })} {...resizeBind()} />
				{/* style={handlePos()["topLeft"]} */}
			</Box>
		</Box>
	);
}
