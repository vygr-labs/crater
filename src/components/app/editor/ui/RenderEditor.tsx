import { Box } from "styled-system/jsx";
import { useEditor } from "../Editor";
import { Dynamic, For } from "solid-js/web";
import NodeProvider from "../Node";
import { css } from "styled-system/css";
import { createStore } from "solid-js/store";
import {
	createEffect,
	createMemo,
	createSignal,
	onCleanup,
	onMount,
	Show,
	type JSX,
} from "solid-js";

// Constants
const BORDER_WIDTH = 2;
const MIN_SIZE = 20;
const HANDLE_SIZE = 10;

type ResizeHandle =
	| "top-left"
	| "top"
	| "top-right"
	| "right"
	| "bottom-right"
	| "bottom"
	| "bottom-left"
	| "left";

const resizeHandles: ResizeHandle[] = [
	"top-left",
	"top",
	"top-right",
	"right",
	"bottom-right",
	"bottom",
	"bottom-left",
	"left",
];

// Cursor mapping for resize handles
const cursorMap: Record<ResizeHandle, string> = {
	"top-left": "nwse-resize",
	top: "ns-resize",
	"top-right": "nesw-resize",
	right: "ew-resize",
	"bottom-right": "nwse-resize",
	bottom: "ns-resize",
	"bottom-left": "nesw-resize",
	left: "ew-resize",
};

// Handle position styles
const getHandleStyle = (handle: ResizeHandle): JSX.CSSProperties => {
	const base: JSX.CSSProperties = {
		position: "absolute",
		width: `${HANDLE_SIZE}px`,
		height: `${HANDLE_SIZE}px`,
		"background-color": "var(--colors-purple-500)",
		"border-radius": "50%",
		cursor: cursorMap[handle],
	};

	switch (handle) {
		case "top-left":
			return { ...base, top: "-5px", left: "-5px" };
		case "top":
			return {
				...base,
				top: "-5px",
				left: "50%",
				transform: "translateX(-50%)",
			};
		case "top-right":
			return { ...base, top: "-5px", right: "-5px" };
		case "right":
			return {
				...base,
				top: "50%",
				right: "-5px",
				transform: "translateY(-50%)",
			};
		case "bottom-right":
			return { ...base, bottom: "-5px", right: "-5px" };
		case "bottom":
			return {
				...base,
				bottom: "-5px",
				left: "50%",
				transform: "translateX(-50%)",
			};
		case "bottom-left":
			return { ...base, bottom: "-5px", left: "-5px" };
		case "left":
			return {
				...base,
				top: "50%",
				left: "-5px",
				transform: "translateY(-50%)",
			};
	}
};

interface DragState {
	isDragging: boolean;
	isResizing: boolean;
	resizeHandle: ResizeHandle | null;
	startX: number;
	startY: number;
	startLeft: number;
	startTop: number;
	startWidth: number;
	startHeight: number;
}

const initialDragState: DragState = {
	isDragging: false,
	isResizing: false,
	resizeHandle: null,
	startX: 0,
	startY: 0,
	startLeft: 0,
	startTop: 0,
	startWidth: 0,
	startHeight: 0,
};

export default function RenderEditor() {
	const {
		editor,
		getters: { getNodeRenderComp, getSelectedNode },
		connectors: { register },
		setters: { setRootRef, setNodeStyle },
		helpers: { selectNode },
	} = useEditor();

	let editorRootRef!: HTMLDivElement;

	const [dragState, setDragState] = createStore<DragState>({
		...initialDragState,
	});
	const [isDraggingOrResizing, setIsDraggingOrResizing] = createSignal(false);

	// Get current node position/size as percentages
	const getNodeBounds = (nodeId?: string | null) => {
		const node = nodeId ? editor.nodes[nodeId] : getSelectedNode();
		if (!node) return null;

		const left = parseFloat(String(node.style.left).replace("%", "")) || 0;
		const top = parseFloat(String(node.style.top).replace("%", "")) || 0;
		const width = parseFloat(String(node.style.width).replace("%", "")) || 10;
		const height = parseFloat(String(node.style.height).replace("%", "")) || 10;

		return { left, top, width, height };
	};

	// Selection indicator position
	const indicatorStyle = createMemo<JSX.CSSProperties>(() => {
		const node = getSelectedNode();
		if (!node) {
			return { opacity: 0, visibility: "hidden" };
		}

		return {
			left: node.style.left,
			top: node.style.top,
			width: node.style.width,
			height: node.style.height,
			opacity: 1,
			visibility: "visible",
		};
	});

	// Handle mouse down on node for dragging
	const handleNodeMouseDown = (e: MouseEvent, nodeId: string) => {
		// Don't start drag if clicking a resize handle
		if ((e.target as HTMLElement).closest("[data-resize-handle]")) return;

		e.preventDefault();
		e.stopPropagation();

		// Blur any focused input/textarea so keyboard shortcuts work
		if (document.activeElement instanceof HTMLElement) {
			document.activeElement.blur();
		}

		selectNode(nodeId);

		const bounds = getNodeBounds(nodeId);
		if (!bounds) return;

		setDragState({
			isDragging: true,
			isResizing: false,
			resizeHandle: null,
			startX: e.clientX,
			startY: e.clientY,
			startLeft: bounds.left,
			startTop: bounds.top,
			startWidth: bounds.width,
			startHeight: bounds.height,
		});
		setIsDraggingOrResizing(true);
	};

	// Handle mouse down on resize handle
	const handleResizeMouseDown = (e: MouseEvent, handle: ResizeHandle) => {
		e.preventDefault();
		e.stopPropagation();

		const bounds = getNodeBounds();
		if (!bounds) return;

		setDragState({
			isDragging: false,
			isResizing: true,
			resizeHandle: handle,
			startX: e.clientX,
			startY: e.clientY,
			startLeft: bounds.left,
			startTop: bounds.top,
			startWidth: bounds.width,
			startHeight: bounds.height,
		});
		setIsDraggingOrResizing(true);
	};

	// Handle mouse move for drag/resize
	const handleMouseMove = (e: MouseEvent) => {
		if (!dragState.isDragging && !dragState.isResizing) return;

		const rootRect = editorRootRef.getBoundingClientRect();
		const deltaX = ((e.clientX - dragState.startX) / rootRect.width) * 100;
		const deltaY = ((e.clientY - dragState.startY) / rootRect.height) * 100;

		const node = getSelectedNode();
		if (!node) return;

		if (dragState.isDragging) {
			// Dragging - update position
			let newLeft = dragState.startLeft + deltaX;
			let newTop = dragState.startTop + deltaY;

			// Clamp to container bounds
			newLeft = Math.max(0, Math.min(100 - dragState.startWidth, newLeft));
			newTop = Math.max(0, Math.min(100 - dragState.startHeight, newTop));

			setNodeStyle(node.id, {
				left: `${newLeft}%`,
				top: `${newTop}%`,
			});
		} else if (dragState.isResizing && dragState.resizeHandle) {
			// Resizing
			const handle = dragState.resizeHandle;
			let newLeft = dragState.startLeft;
			let newTop = dragState.startTop;
			let newWidth = dragState.startWidth;
			let newHeight = dragState.startHeight;

			const minWidthPct = (MIN_SIZE / rootRect.width) * 100;
			const minHeightPct = (MIN_SIZE / rootRect.height) * 100;

			// Handle horizontal resizing
			if (handle.includes("left")) {
				const potentialWidth = dragState.startWidth - deltaX;
				if (potentialWidth >= minWidthPct) {
					const potentialLeft = dragState.startLeft + deltaX;
					if (potentialLeft >= 0) {
						newLeft = potentialLeft;
						newWidth = potentialWidth;
					} else {
						newLeft = 0;
						newWidth = dragState.startLeft + dragState.startWidth;
					}
				} else {
					newWidth = minWidthPct;
					newLeft = dragState.startLeft + dragState.startWidth - minWidthPct;
				}
			} else if (handle.includes("right")) {
				newWidth = Math.max(minWidthPct, dragState.startWidth + deltaX);
				// Clamp to container right edge
				if (newLeft + newWidth > 100) {
					newWidth = 100 - newLeft;
				}
			}

			// Handle vertical resizing
			if (handle.includes("top")) {
				const potentialHeight = dragState.startHeight - deltaY;
				if (potentialHeight >= minHeightPct) {
					const potentialTop = dragState.startTop + deltaY;
					if (potentialTop >= 0) {
						newTop = potentialTop;
						newHeight = potentialHeight;
					} else {
						newTop = 0;
						newHeight = dragState.startTop + dragState.startHeight;
					}
				} else {
					newHeight = minHeightPct;
					newTop = dragState.startTop + dragState.startHeight - minHeightPct;
				}
			} else if (handle.includes("bottom")) {
				newHeight = Math.max(minHeightPct, dragState.startHeight + deltaY);
				// Clamp to container bottom edge
				if (newTop + newHeight > 100) {
					newHeight = 100 - newTop;
				}
			}

			setNodeStyle(node.id, {
				left: `${newLeft}%`,
				top: `${newTop}%`,
				width: `${newWidth}%`,
				height: `${newHeight}%`,
			});
		}
	};

	// Handle mouse up
	const handleMouseUp = () => {
		if (!dragState.isDragging && !dragState.isResizing) return;

		setDragState({ ...initialDragState });
		setIsDraggingOrResizing(false);
	};

	// Handle click on canvas to deselect
	const handleCanvasClick = (e: MouseEvent) => {
		if (e.target === editorRootRef) {
			selectNode(null);
		}
	};

	// Set up global mouse event listeners
	onMount(() => {
		if (typeof document === "undefined") return;
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
	});

	onCleanup(() => {
		if (typeof document === "undefined") return;
		document.removeEventListener("mousemove", handleMouseMove);
		document.removeEventListener("mouseup", handleMouseUp);
	});

	// Dynamic cursor based on drag state
	const canvasClass = createMemo(() => {
		if (dragState.isDragging) return "cursor-grabbing";
		if (dragState.isResizing && dragState.resizeHandle) {
			return `cursor-${cursorMap[dragState.resizeHandle].replace("-resize", "")}`;
		}
		return "";
	});

	return (
		<Box
			pos="relative"
			w="full"
			aspectRatio={16 / 9}
			bgColor="bg.muted"
			overflow="hidden"
			ref={(ref) => {
				editorRootRef = ref;
				setRootRef(ref);
			}}
			onClick={handleCanvasClick}
			class={css({
				"& .editor-node": {
					cursor: "grab",
				},
				"&.cursor-grabbing, &.cursor-grabbing .editor-node": {
					cursor: "grabbing !important",
				},
			})}
			classList={{ [canvasClass()]: true }}
		>
			{/* Render all nodes */}
			<For each={Object.keys(editor.nodes)}>
				{(nodeId) => {
					const node = () => editor.nodes[nodeId];
					return (
						<Show when={node()}>
							<NodeProvider node={node()!} register={register}>
								<Dynamic
									component={getNodeRenderComp(node()!)}
									{...getNodeRenderComp(node()!).config.defaultData}
									onMouseDown={(e: MouseEvent) =>
										handleNodeMouseDown(e, nodeId)
									}
								/>
							</NodeProvider>
						</Show>
					);
				}}
			</For>

			{/* Selection indicator with resize handles */}
			<Show when={getSelectedNode()}>
				<Box
					position="absolute"
					pointerEvents="none"
					borderWidth={`${BORDER_WIDTH}px`}
					borderStyle="dashed"
					borderColor="purple.500"
					boxSizing="border-box"
					zIndex={999}
					style={indicatorStyle()}
				>
					{/* Resize handles */}
					<For each={resizeHandles}>
						{(handle) => (
							<Box
								data-resize-handle={handle}
								pointerEvents="auto"
								style={getHandleStyle(handle)}
								onMouseDown={(e) => handleResizeMouseDown(e, handle)}
							/>
						)}
					</For>
				</Box>
			</Show>
		</Box>
	);
}
