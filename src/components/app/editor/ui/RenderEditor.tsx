// Resize functionality adapted from Hung Nguyen's implementation

import { Box } from "styled-system/jsx";
import { useEditor } from "../Editor";
import { Dynamic, For } from "solid-js/web";
import NodeProvider, { NodeContext } from "../Node";
import { cva } from "styled-system/css";
import { useGesture } from "solid-gesture";
import type { FullGestureState } from "@use-gesture/core/types";
import { createStore, unwrap } from "solid-js/store";
import {
	createEffect,
	createMemo,
	createSignal,
	onMount,
	type JSX,
} from "solid-js";
import {
	calculateParentOffset,
	getPositionPercent,
	getSizePercent,
} from "~/utils";
import { useElementSize, usePointer } from "solidjs-use";

const demarcationBorderWidth = 2;

const axes = ["top-left", "top-right", "bottom-left", "bottom-right"] as const;
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
			"top-left": {
				top: 0,
				left: 0,
				transform: "translate3d(-50%, -50%, 0)",
			},
			"top-right": {
				top: 0,
				right: 0,
				transform: "translate3d(50%, -50%, 0)",
			},
			"bottom-left": {
				bottom: 0,
				left: 0,
				transform: "translate3d(-50%, 50%, 0)",
			},
			"bottom-right": {
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
		helpers: { selectNode },
	} = useEditor();
	const [store, setStore] = createStore({
		indicatorPos: [0, 0],
		dragHandlerCoords: {
			topLeft: { x: 0, y: 0 },
		},
		scale: { x: 1, y: 1, z: 1 },
		selectedNodeSize: { width: 0, height: 0 },
	});
	let editorRootRef!: HTMLDivElement;
	let selectedIndicatorRef!: HTMLDivElement;
	const { width: selectedNodeWidth, height: selectedNodeHeight } =
		useElementSize(() => {
			console.log("Getting selected item: ", getSelectedNode());
			return getSelectedNode()?.el;
		});
	const selectedIndicatorPosition = createMemo(() => ({
		width: getSelectedNode()?.style.width,
		height: getSelectedNode()?.style.height,
		transform: `scale3d(${store.scale.x}, ${store.scale.y}, ${store.scale.z}) translate3d(${store.indicatorPos[0]}px, ${store.indicatorPos[1]}px, 0)`,
		left: getSelectedNode()?.style.left,
		top: getSelectedNode()?.style.top,
		opacity: getSelectedNode() ? 1 : 0,
		visibility: getSelectedNode()
			? "visible"
			: ("hidden" as JSX.CSSProperties["visibility"]),
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
		console.log("Node is being dragged: ");
		const newPos = calculateParentOffset(
			(target as HTMLElement).getBoundingClientRect(),
			editorRootRef.getBoundingClientRect(),
		);
		console.log(offset, newPos);
		setStore(
			"indicatorPos",
			newPos.map((v) => v - demarcationBorderWidth),
		);
	});

	const updateSize = ([left, top]: number[]) => {
		const elRect = store.selectedNodeSize; // getSelectedNode()?.el.getBoundingClientRect();
		const rootRefRect = editorRootRef.getBoundingClientRect();
		if (rootRefRect && elRect && editor.selectedId) {
			// console.log("scaling debug: ", initialLeft, left, initialTop, top);
			const newWidth = ((elRect.width + left) / rootRefRect.width) * 100;
			const newHeight = ((elRect.height + top) / rootRefRect.height) * 100;
			console.log(
				elRect.width,
				elRect.height,
				elRect.width + left,
				elRect.height + top,
			);
			console.log(newWidth, newHeight);
			setNodeStyle(editor.selectedId, { width: newWidth + "%" });
			setNodeStyle(editor.selectedId, { height: newHeight + "%" });
		}
	};

	onMount(() => {
		editorRootRef.addEventListener("click", (e) => {
			console.log(e.target, e.currentTarget);
			if (e.target === editorRootRef) {
				console.log("deselecting current selection");
				selectNode(null);
			}
		});
	});

	const axesGestureMap: Record<string, any> = {};
	axes.map((axis) => {
		axesGestureMap[axis] = useGesture(
			{
				onDragStart: () => {
					console.log(
						"Preserved Size: ",
						selectedNodeWidth(),
						selectedNodeHeight(),
					);
					setStore("selectedNodeSize", {
						width: selectedNodeWidth(),
						height: selectedNodeHeight(),
					});
					// setNodeStyle(editor.selectedId, {"transform-origin": axis.replace("-", " ")})
				},
				onDrag: ({
					xy,
					active,
					movement,
					initial,
					offset,
					delta,
					lastOffset,
					distance,
					target,
				}: FullGestureState<"drag">) => {
					// const boundaryStart = editorRootRef.getBoundingClientRect();
					// const initialX = initial[0] - boundaryStart.x;
					// const initialY = initial[1] - boundaryStart.y;
					console.log(
						"scaling debug: ",
						initial,
						movement,
						delta,
						offset,
						lastOffset,
						xy,
						distance,
					);
					updateSize(movement);
				},
			},
			{
				drag: {
					bounds: editorRootRef,
					preventDefault: true,
				},
			},
		);
	});

	// const element = getSelectedNode().el;
	// const resizers = document.querySelectorAll(div + " .resizer");
	const minimum_size = 20;
	let original_width = 0;
	let original_height = 0;
	let original_x = 0;
	let original_y = 0;
	let original_mouse_x = 0;
	let original_mouse_y = 0;
	let currentResizer = "bottom-right";
	let parentRect: DOMRect;

	function resize(e: MouseEvent) {
		const element = getSelectedNode()?.el;
		if (!element) return;

		if (currentResizer === "bottom-right") {
			const width = original_width + (e.pageX - original_mouse_x);
			const height = original_height + (e.pageY - original_mouse_y);
			const [widthPercent, heightPercent] = getSizePercent(
				[width, height],
				parentRect,
			);

			if (width > minimum_size) {
				setNodeStyle(editor.selectedId, { width: widthPercent + "%" });
			}
			if (height > minimum_size) {
				setNodeStyle(editor.selectedId, { height: heightPercent + "%" });
			}
		} else if (currentResizer === "bottom-left") {
			const height = original_height + (e.pageY - original_mouse_y);
			const width = original_width - (e.pageX - original_mouse_x);
			const [widthPercent, heightPercent] = getSizePercent(
				[width, height],
				parentRect,
			);
			const [leftVal, _] = getPositionPercent(
				{
					x: original_x,
					x_offset: e.pageX - original_mouse_x,
				},
				parentRect,
			);

			if (height > minimum_size) {
				setNodeStyle(editor.selectedId, { height: heightPercent + "%" });
			}
			if (width > minimum_size) {
				setNodeStyle(editor.selectedId, {
					width: widthPercent + "%",
					left: leftVal + "%",
				});
			}
		} else if (currentResizer === "top-right") {
			const width = original_width + (e.pageX - original_mouse_x);
			const height = original_height - (e.pageY - original_mouse_y);
			const [_, topVal] = getPositionPercent(
				{ y: original_y, y_offset: e.pageY - original_mouse_y },
				parentRect,
			);
			const [widthPercent, heightPercent] = getSizePercent(
				[width, height],
				parentRect,
			);

			// const topVal = original_y + (e.pageY - original_mouse_y);
			if (width > minimum_size) {
				setNodeStyle(editor.selectedId, { width: widthPercent + "%" });
			}
			if (height > minimum_size) {
				setNodeStyle(editor.selectedId, {
					height: heightPercent + "%",
					top: topVal + "%",
				});
			}
		} else {
			const width = original_width - (e.pageX - original_mouse_x);
			const height = original_height - (e.pageY - original_mouse_y);
			const [widthPercent, heightPercent] = getSizePercent(
				[width, height],
				parentRect,
			);
			const [leftPercent, topPercent] = getPositionPercent(
				{
					x: original_x,
					y: original_y,
					x_offset: e.pageX - original_mouse_x,
					y_offset: e.pageY - original_mouse_y,
				},
				parentRect,
			);

			// console.log("CHANGE PERCENT: ", leftVal, topVal, leftPercent, topPercent);

			if (width > minimum_size) {
				setNodeStyle(editor.selectedId, {
					width: widthPercent + "%",
					left: leftPercent + "%",
				});
			}
			if (height > minimum_size) {
				setNodeStyle(editor.selectedId, {
					height: heightPercent + "%",
					top: topPercent + "%",
				});
			}
		}
	}

	const updateSizes = (e: MouseEvent) => {
		e.preventDefault();

		const element = getSelectedNode()?.el;
		if (!element) return;

		original_width = parseFloat(
			getComputedStyle(element, null)
				.getPropertyValue("width")
				.replace("%", ""),
		);
		original_height = parseFloat(
			getComputedStyle(element, null)
				.getPropertyValue("height")
				.replace("%", ""),
		);
		original_x = element.getBoundingClientRect().x - parentRect.x;
		original_y = element.getBoundingClientRect().y - parentRect.y;
		original_mouse_x = e.pageX;
		original_mouse_y = e.pageY;
	};

	function stopResize() {
		window.removeEventListener("mousemove", resize);
	}

	const handleResizeMap: Record<string, any> = {};
	axes.map((axis) => {
		handleResizeMap[axis] = (e: MouseEvent) => {
			currentResizer = axis;
			parentRect = editorRootRef.getBoundingClientRect();
			updateSizes(e);
			window.addEventListener("mousemove", resize);
			window.addEventListener("mouseup", stopResize);
		};
	});

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
			<For each={Object.values(editor.nodes)}>
				{(node) => (
					<NodeProvider node={node} register={register}>
						<Dynamic
							component={getNodeRenderComp(node)}
							{...getNodeRenderComp(node).config.defaultData}
						/>
					</NodeProvider>
				)}
			</For>
			<Box
				ref={selectedIndicatorRef}
				pointerEvents="none"
				width="fit-content"
				borderWidth={demarcationBorderWidth}
				borderStyle="dashed"
				borderColor="red.400"
				position="absolute"
				boxSizing="content-box"
				style={selectedIndicatorPosition()}
				transformOrigin="top left"
				touchAction="none"
				zIndex={999}
			>
				<For each={axes}>
					{(axis) => (
						<Box
							pointerEvents="auto"
							class={resizeHandlerRecipe({ position: axis })}
							// {...axesGestureMap[axis]()}
							onmousedown={handleResizeMap[axis]}
						/>
					)}
				</For>
			</Box>
		</Box>
	);
}
