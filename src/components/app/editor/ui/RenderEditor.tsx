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
const SNAP_THRESHOLD = 1; // Percentage threshold for snapping to 100% bounds

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

	// Calculate overflow regions for selected node
	const overflowRegions = createMemo(() => {
		const node = getSelectedNode();
		if (!node) return null;

		const left = parseFloat(String(node.style.left).replace("%", "")) || 0;
		const top = parseFloat(String(node.style.top).replace("%", "")) || 0;
		const width = parseFloat(String(node.style.width).replace("%", "")) || 10;
		const height = parseFloat(String(node.style.height).replace("%", "")) || 10;

		const right = left + width;
		const bottom = top + height;

		const regions: {
			left?: { x: number; y: number; w: number; h: number };
			right?: { x: number; y: number; w: number; h: number };
			top?: { x: number; y: number; w: number; h: number };
			bottom?: { x: number; y: number; w: number; h: number };
		} = {};

		// Left overflow (node extends beyond left edge)
		if (left < 0) {
			regions.left = {
				x: left,
				y: top,
				w: Math.abs(left),
				h: height,
			};
		}

		// Right overflow (node extends beyond right edge)
		if (right > 100) {
			regions.right = {
				x: 100,
				y: top,
				w: right - 100,
				h: height,
			};
		}

		// Top overflow (node extends beyond top edge)
		if (top < 0) {
			regions.top = {
				x: Math.max(0, left),
				y: top,
				w: Math.min(width, right) - Math.max(0, left),
				h: Math.abs(top),
			};
		}

		// Bottom overflow (node extends beyond bottom edge)
		if (bottom > 100) {
			regions.bottom = {
				x: Math.max(0, left),
				y: 100,
				w: Math.min(width, right) - Math.max(0, left),
				h: bottom - 100,
			};
		}

		return Object.keys(regions).length > 0 ? regions : null;
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

			// Snap to canvas bounds when close to 0 or 100% edges
			// Left edge snap
			if (newLeft > -SNAP_THRESHOLD && newLeft < SNAP_THRESHOLD) {
				newLeft = 0;
			}
			// Top edge snap
			if (newTop > -SNAP_THRESHOLD && newTop < SNAP_THRESHOLD) {
				newTop = 0;
			}
			// Right edge snap (when right side of node aligns with canvas right)
			const rightEdge = newLeft + dragState.startWidth;
			if (
				rightEdge > 100 - SNAP_THRESHOLD &&
				rightEdge < 100 + SNAP_THRESHOLD
			) {
				newLeft = 100 - dragState.startWidth;
			}
			// Bottom edge snap (when bottom of node aligns with canvas bottom)
			const bottomEdge = newTop + dragState.startHeight;
			if (
				bottomEdge > 100 - SNAP_THRESHOLD &&
				bottomEdge < 100 + SNAP_THRESHOLD
			) {
				newTop = 100 - dragState.startHeight;
			}

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
					newLeft = dragState.startLeft + deltaX;
					newWidth = potentialWidth;
					// Snap to left edge
					if (newLeft > -SNAP_THRESHOLD && newLeft < SNAP_THRESHOLD) {
						newWidth = newWidth + newLeft;
						newLeft = 0;
					}
				} else {
					newWidth = minWidthPct;
					newLeft = dragState.startLeft + dragState.startWidth - minWidthPct;
				}
			} else if (handle.includes("right")) {
				newWidth = Math.max(minWidthPct, dragState.startWidth + deltaX);
				// Snap to right edge when close to 100%
				const rightEdge = newLeft + newWidth;
				if (
					rightEdge > 100 - SNAP_THRESHOLD &&
					rightEdge < 100 + SNAP_THRESHOLD
				) {
					newWidth = 100 - newLeft;
				}
			}

			// Handle vertical resizing
			if (handle.includes("top")) {
				const potentialHeight = dragState.startHeight - deltaY;
				if (potentialHeight >= minHeightPct) {
					newTop = dragState.startTop + deltaY;
					newHeight = potentialHeight;
					// Snap to top edge
					if (newTop > -SNAP_THRESHOLD && newTop < SNAP_THRESHOLD) {
						newHeight = newHeight + newTop;
						newTop = 0;
					}
				} else {
					newHeight = minHeightPct;
					newTop = dragState.startTop + dragState.startHeight - minHeightPct;
				}
			} else if (handle.includes("bottom")) {
				newHeight = Math.max(minHeightPct, dragState.startHeight + deltaY);
				// Snap to bottom edge when close to 100%
				const bottomEdge = newTop + newHeight;
				if (
					bottomEdge > 100 - SNAP_THRESHOLD &&
					bottomEdge < 100 + SNAP_THRESHOLD
				) {
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
		<Box pos="relative" w="full" aspectRatio={16 / 9}>
			{/* Main canvas - clips node content */}
			<Box
				pos="absolute"
				inset="0"
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
			</Box>

			{/* Selection indicator with resize handles - outside overflow:hidden */}
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

			{/* Overflow indicators for selected node */}
			<Show when={overflowRegions()}>
				{(regions) => (
					<>
						<Show when={regions().left}>
							{(r) => (
								<Box
									position="absolute"
									pointerEvents="none"
									zIndex={998}
									style={{
										left: `${r().x}%`,
										top: `${r().y}%`,
										width: `${r().w}%`,
										height: `${r().h}%`,
									}}
									class={css({
										background:
											"repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(239, 68, 68, 0.3) 4px, rgba(239, 68, 68, 0.3) 8px)",
										borderRight: "2px dashed",
										borderRightColor: "red.600",
									})}
								/>
							)}
						</Show>
						<Show when={regions().right}>
							{(r) => (
								<Box
									position="absolute"
									pointerEvents="none"
									zIndex={998}
									style={{
										left: `${r().x}%`,
										top: `${r().y}%`,
										width: `${r().w}%`,
										height: `${r().h}%`,
									}}
									class={css({
										background:
											"repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(239, 68, 68, 0.3) 4px, rgba(239, 68, 68, 0.3) 8px)",
										borderLeft: "2px dashed",
										borderLeftColor: "red.600",
									})}
								/>
							)}
						</Show>
						<Show when={regions().top}>
							{(r) => (
								<Box
									position="absolute"
									pointerEvents="none"
									zIndex={998}
									style={{
										left: `${r().x}%`,
										top: `${r().y}%`,
										width: `${r().w}%`,
										height: `${r().h}%`,
									}}
									class={css({
										background:
											"repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(239, 68, 68, 0.3) 4px, rgba(239, 68, 68, 0.3) 8px)",
										borderBottom: "2px dashed",
										borderBottomColor: "red.600",
									})}
								/>
							)}
						</Show>
						<Show when={regions().bottom}>
							{(r) => (
								<Box
									position="absolute"
									pointerEvents="none"
									zIndex={998}
									style={{
										left: `${r().x}%`,
										top: `${r().y}%`,
										width: `${r().w}%`,
										height: `${r().h}%`,
									}}
									class={css({
										background:
											"repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(239, 68, 68, 0.3) 4px, rgba(239, 68, 68, 0.3) 8px)",
										borderTop: "2px dashed",
										borderTopColor: "red.600",
									})}
								/>
							)}
						</Show>
					</>
				)}
			</Show>
		</Box>
	);
}
