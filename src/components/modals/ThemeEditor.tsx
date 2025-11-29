import {
	createEffect,
	createMemo,
	createSignal,
	on,
	onCleanup,
	onMount,
} from "solid-js";
import { useAppContext } from "~/layouts/AppContext";
import type { GroupCategory, GroupType, ThemeInput } from "~/types";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import type { DialogOpenChangeDetails } from "@ark-ui/solid";
import { Box, Flex, HStack } from "styled-system/jsx";
import Editor, { useEditor } from "../app/editor/Editor";
import RenderEditor from "../app/editor/ui/RenderEditor";
import { useFps } from "solidjs-use";
import { getToastType, parseThemeData, toaster } from "~/utils";
import { useFocusContext } from "~/layouts/FocusContext";
import { defaultThemeKeys, THEME_EDITOR_FOCUS_NAME } from "~/utils/constants";
import {
	createEditorHistory,
	type HistoryState,
} from "../app/editor/EditorHistory";
import EnhancedToolbar from "../app/editor/ui/EnhancedToolbar";
import LayersPanel from "../app/editor/ui/LayersPanel";
import SettingsPanel from "../app/editor/ui/SettingsPanel";
import EditorContextMenu from "../app/editor/ui/EditorContextMenu";
import { useConfirm } from "./ConfirmDialog";
import { Text } from "../ui/text";
import { IconButton } from "../ui/icon-button";
import { TbMaximize, TbMinimize, TbAlertCircle } from "solid-icons/tb";
import type { NodeId } from "../app/editor/editor-types";
import { Portal } from "solid-js/web";

interface Props {
	open: boolean;
	setOpen: (open: boolean) => void;
	type: GroupType;
	group: GroupCategory;
	onAddGroup: (type: GroupType, group: GroupCategory, name: string) => void;
}

export default function ThemeEditor() {
	const [name, setName] = createSignal("");
	const [zoom, setZoom] = createSignal(1);
	const [isFullscreen, setIsFullscreen] = createSignal(false);
	const [contextMenu, setContextMenu] = createSignal({
		isOpen: false,
		x: 0,
		y: 0,
	});

	const { appStore, setAppStore } = useAppContext();
	const type = createMemo(() => appStore.themeEditor.type);
	const open = createMemo(() => appStore.themeEditor.open);
	const { confirm } = useConfirm();

	const {
		editor,
		connectors,
		getters: { getRootRef, getSelectedNode, getRenderMap },
		setters: { setNodeStyle, setNodeData },
		helpers: {
			exportTheme,
			loadTheme,
			selectNode,
			deleteNode: editorDeleteNode,
			duplicateNode: editorDuplicateNode,
		},
	} = useEditor();

	// History management
	const history = createEditorHistory(50);

	const saveToHistory = () => {
		const state: HistoryState = {
			nodes: exportTheme().nodes,
			selectedId: editor.selectedId,
		};
		history.saveState(state);
	};

	const applyHistoryState = (state: HistoryState | null) => {
		if (!state) return;
		loadTheme({ nodes: state.nodes });
		if (state.selectedId) {
			selectNode(state.selectedId);
		}
	};

	const handleUndo = () => {
		const state = history.undo();
		applyHistoryState(state);
	};

	const handleRedo = () => {
		const state = history.redo();
		applyHistoryState(state);
	};

	// Node operations
	const deleteNode = (id: NodeId) => {
		if (!id) return;
		saveToHistory();
		editorDeleteNode(id);
		selectNode(null);
	};

	const duplicateNode = (id: NodeId) => {
		if (!id) return;
		saveToHistory();
		const newId = editorDuplicateNode(id);
		if (newId) {
			selectNode(newId);
		}
	};

	const moveNodeUp = (id: NodeId) => {
		if (!id) return;
		saveToHistory();
		const currentZ = parseInt(String(editor.nodes[id]?.style["z-index"] ?? 10));
		setNodeStyle(id, { "z-index": currentZ + 1 });
	};

	const moveNodeDown = (id: NodeId) => {
		if (!id) return;
		saveToHistory();
		const currentZ = parseInt(String(editor.nodes[id]?.style["z-index"] ?? 10));
		setNodeStyle(id, { "z-index": Math.max(0, currentZ - 1) });
	};

	const toggleVisibility = (id: NodeId) => {
		if (!id) return;
		const isHidden = editor.nodes[id]?.data.isHidden ?? false;
		setNodeData(id, { isHidden: !isHidden });
	};

	const toggleLock = (id: NodeId) => {
		if (!id) return;
		const isLocked = editor.nodes[id]?.data.isLocked ?? false;
		setNodeData(id, { isLocked: !isLocked });
	};

	// Alignment functions
	const alignLeft = () => {
		const node = getSelectedNode();
		if (!node) return;
		saveToHistory();
		setNodeStyle(node.id, { left: "0%" });
	};

	const alignCenterH = () => {
		const node = getSelectedNode();
		if (!node) return;
		saveToHistory();
		const width = parseFloat(String(node.style.width).replace("%", "")) || 0;
		setNodeStyle(node.id, { left: `${(100 - width) / 2}%` });
	};

	const alignRight = () => {
		const node = getSelectedNode();
		if (!node) return;
		saveToHistory();
		const width = parseFloat(String(node.style.width).replace("%", "")) || 0;
		setNodeStyle(node.id, { left: `${100 - width}%` });
	};

	const alignTop = () => {
		const node = getSelectedNode();
		if (!node) return;
		saveToHistory();
		setNodeStyle(node.id, { top: "0%" });
	};

	const alignCenterV = () => {
		const node = getSelectedNode();
		if (!node) return;
		saveToHistory();
		const height = parseFloat(String(node.style.height).replace("%", "")) || 0;
		setNodeStyle(node.id, { top: `${(100 - height) / 2}%` });
	};

	const alignBottom = () => {
		const node = getSelectedNode();
		if (!node) return;
		saveToHistory();
		const height = parseFloat(String(node.style.height).replace("%", "")) || 0;
		setNodeStyle(node.id, { top: `${100 - height}%` });
	};

	const bringToFront = () => {
		const node = getSelectedNode();
		if (!node) return;
		saveToHistory();
		const maxZ = Math.max(
			...Object.values(editor.nodes).map((n) =>
				parseInt(String(n.style["z-index"] ?? 0)),
			),
		);
		setNodeStyle(node.id, { "z-index": maxZ + 1 });
	};

	const sendToBack = () => {
		const node = getSelectedNode();
		if (!node) return;
		saveToHistory();
		const minZ = Math.min(
			...Object.values(editor.nodes).map((n) =>
				parseInt(String(n.style["z-index"] ?? 0)),
			),
		);
		setNodeStyle(node.id, { "z-index": Math.max(0, minZ - 1) });
	};

	// Zoom
	const zoomIn = () => setZoom((z) => Math.min(z + 0.1, 2));
	const zoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.5));
	const zoomReset = () => setZoom(1);

	// Context menu
	const handleContextMenu = (e: MouseEvent) => {
		if (!getSelectedNode()) return;
		e.preventDefault();
		setContextMenu({
			isOpen: true,
			x: e.clientX,
			y: e.clientY,
		});
	};

	const closeContextMenu = () => {
		setContextMenu((prev) => ({ ...prev, isOpen: false }));
	};

	// Keyboard shortcuts
	const handleKeyDown = (e: KeyboardEvent) => {
		if (!open()) return;

		const selectedNode = getSelectedNode();

		// Undo/Redo
		if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
			e.preventDefault();
			handleUndo();
			return;
		}
		if (
			(e.ctrlKey || e.metaKey) &&
			(e.key === "y" || (e.key === "z" && e.shiftKey))
		) {
			e.preventDefault();
			handleRedo();
			return;
		}

		// Save
		if ((e.ctrlKey || e.metaKey) && e.key === "s") {
			e.preventDefault();
			saveTheme();
			return;
		}

		// Duplicate
		if ((e.ctrlKey || e.metaKey) && e.key === "d") {
			e.preventDefault();
			if (selectedNode) duplicateNode(selectedNode.id);
			return;
		}

		// Delete
		if (e.key === "Delete") {
			// Don't delete if user is typing in an input
			if ((e.target as HTMLElement).tagName === "INPUT") return;
			e.preventDefault();
			if (selectedNode) deleteNode(selectedNode.id);
			return;
		}

		// Arrow key nudge
		if (
			selectedNode &&
			["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
		) {
			// Don't nudge if user is in an input or textarea
			const tagName = (e.target as HTMLElement).tagName;
			if (tagName === "INPUT" || tagName === "TEXTAREA") return;

			e.preventDefault();
			const nudgeAmount = e.shiftKey ? 5 : 1;
			const currentLeft =
				parseFloat(String(selectedNode.style.left).replace("%", "")) || 0;
			const currentTop =
				parseFloat(String(selectedNode.style.top).replace("%", "")) || 0;

			saveToHistory();

			switch (e.key) {
				case "ArrowLeft":
					setNodeStyle(selectedNode.id, {
						left: `${currentLeft - nudgeAmount}%`,
					});
					break;
				case "ArrowRight":
					setNodeStyle(selectedNode.id, {
						left: `${currentLeft + nudgeAmount}%`,
					});
					break;
				case "ArrowUp":
					setNodeStyle(selectedNode.id, {
						top: `${currentTop - nudgeAmount}%`,
					});
					break;
				case "ArrowDown":
					setNodeStyle(selectedNode.id, {
						top: `${currentTop + nudgeAmount}%`,
					});
					break;
			}
		}

		// Escape to deselect
		if (e.key === "Escape") {
			selectNode(null);
		}
	};

	const { subscribeEvent, changeFocusPanel, currentPanel, previousPanel } =
		useFocusContext();

	createEffect(
		on(
			() => appStore.themeEditor.open,
			(isOpen) => {
				if (isOpen) {
					changeFocusPanel(THEME_EDITOR_FOCUS_NAME);
					const initial = appStore.themeEditor.initial;
					loadTheme(initial ? parseThemeData(initial?.theme_data) : undefined);
					setName(initial?.title ?? "");
					// Initialize history with current state
					history.clearHistory();
					setTimeout(() => {
						saveToHistory();
						history.markSaved();
					}, 100);
				}
			},
		),
	);

	createEffect(() => {
		if (typeof document === "undefined") return;
		if (open()) {
			document.addEventListener("keydown", handleKeyDown);
		} else {
			document.removeEventListener("keydown", handleKeyDown);
		}
	});

	onCleanup(() => {
		if (typeof document === "undefined") return;
		document.removeEventListener("keydown", handleKeyDown);
	});

	const closeModal = () => {
		if (history.hasChanges()) {
			confirm({
				title: "Unsaved Changes",
				message: "You have unsaved changes. Are you sure you want to close?",
				confirmText: "Discard",
				cancelText: "Keep Editing",
				confirmColorPalette: "red",
				onConfirm: () => {
					setAppStore("themeEditor", { open: false });
					changeFocusPanel(previousPanel());
				},
			});
			return;
		}
		setAppStore("themeEditor", { open: false });
		changeFocusPanel(previousPanel());
	};

	const saveTheme = async () => {
		const themeName = name();
		const rootRef = getRootRef();
		if (!rootRef || !themeName) {
			toaster.create({
				type: "error",
				title: "Please enter a theme name",
			});
			return;
		}

		selectNode(null);
		const themeData = exportTheme();
		const formerTheme = appStore.themeEditor.initial;
		const theme: ThemeInput = {
			title: themeName,
			author: "Eyetu Kingsley",
			type: type(),
			theme_data: JSON.stringify(themeData),
		};

		if (formerTheme === null) {
			const { success, message } = await window.electronAPI.addTheme(theme);
			toaster.create({
				type: getToastType(success),
				title: message,
			});
		} else {
			const { success, message, updatedTheme } =
				await window.electronAPI.updateTheme(formerTheme.id, theme);

			defaultThemeKeys.forEach((themeKey) => {
				if (appStore["displayData"][themeKey]?.id === formerTheme.id) {
					setAppStore("displayData", themeKey, updatedTheme);
				}
			});

			toaster.create({
				type: getToastType(success),
				title: message,
			});
		}

		history.markSaved();
		setAppStore("themesUpdateTrigger", (former) => former + 1);
		setAppStore("themeEditor", { open: false });
		changeFocusPanel(previousPanel());
	};

	const onDialogOpen = (e: DialogOpenChangeDetails) => {
		if (!e.open) {
			closeModal();
		}
	};

	const fps = useFps();
	const hasSelection = createMemo(() => !!getSelectedNode());

	return (
		<Dialog.Root
			placement="center"
			motionPreset="slide-in-top"
			open={open()}
			onOpenChange={onDialogOpen}
			size="full"
			trapFocus={false}
		>
			<Portal>
				<Dialog.Backdrop bg="blackAlpha.800" />
				<Dialog.Positioner>
					<Dialog.Content
						h={isFullscreen() ? "100vh" : "80vh"}
						w={isFullscreen() ? "100vw" : "95vw"}
						maxW={isFullscreen() ? "100vw" : "1400px"}
						m={isFullscreen() ? 0 : "auto"}
						bg="transparent"
						minH="unset"
						rounded={isFullscreen() ? 0 : "lg"}
					>
						{/* Header */}
						<Flex
							px={4}
							py={2}
							borderBottom="1px solid"
							borderBottomColor="gray.800"
							alignItems="center"
							justifyContent="space-between"
							bg="gray.900"
							roundedTop={isFullscreen() ? 0 : "lg"}
						>
							<HStack gap={3}>
								<Dialog.Title
									fontSize="md"
									fontWeight="semibold"
									textTransform="capitalize"
								>
									{type()} Theme Editor
								</Dialog.Title>
								<Text fontSize="xs" color="gray.500">
									{fps()} FPS
								</Text>
								{history.hasChanges() && (
									<HStack gap={1} color="yellow.500" fontSize="xs">
										<TbAlertCircle size={12} />
										<Text>Unsaved</Text>
									</HStack>
								)}
							</HStack>
							<HStack gap={2}>
								<IconButton
									size="sm"
									variant="ghost"
									onClick={() => setIsFullscreen(!isFullscreen())}
									title={isFullscreen() ? "Exit Fullscreen" : "Fullscreen"}
								>
									{isFullscreen() ? (
										<TbMinimize size={16} />
									) : (
										<TbMaximize size={16} />
									)}
								</IconButton>
							</HStack>
						</Flex>

						{/* Toolbar */}
						<EnhancedToolbar
							canUndo={history.canUndo()}
							canRedo={history.canRedo()}
							hasSelection={hasSelection()}
							zoom={zoom()}
							onUndo={handleUndo}
							onRedo={handleRedo}
							onDelete={() => deleteNode(getSelectedNode()?.id)}
							onDuplicate={() => duplicateNode(getSelectedNode()?.id)}
							onAlignLeft={alignLeft}
							onAlignCenterH={alignCenterH}
							onAlignRight={alignRight}
							onAlignTop={alignTop}
							onAlignCenterV={alignCenterV}
							onAlignBottom={alignBottom}
							onBringToFront={bringToFront}
							onSendToBack={sendToBack}
							onZoomIn={zoomIn}
							onZoomOut={zoomOut}
							onZoomReset={zoomReset}
						/>

						{/* Main Content */}
						<Flex flex="1" overflow="hidden">
							{/* Layers Panel */}
							<LayersPanel
								onDelete={deleteNode}
								onDuplicate={duplicateNode}
								onMoveUp={moveNodeUp}
								onMoveDown={moveNodeDown}
								onToggleVisibility={toggleVisibility}
								onToggleLock={toggleLock}
							/>

							{/* Editor Canvas */}
							<Box
								flex="1"
								bg="gray.950"
								overflow="auto"
								display="flex"
								alignItems="center"
								justifyContent="center"
								p={4}
								onContextMenu={handleContextMenu}
							>
								<Box
									w="full"
									style={{
										transform: `scale(${zoom()})`,
										"transform-origin": "center center",
									}}
								>
									<RenderEditor />
								</Box>
							</Box>

							{/* Settings Panel */}
							<SettingsPanel />
						</Flex>

						{/* Footer */}
						<Flex
							px={4}
							py={3}
							borderTop="1px solid"
							borderTopColor="gray.800"
							alignItems="center"
							justifyContent="space-between"
							bg="gray.900"
							roundedBottom={isFullscreen() ? 0 : "lg"}
						>
							<HStack flex="1" maxW="sm">
								<Input
									placeholder="Enter theme name..."
									variant="outline"
									size="sm"
									value={name()}
									onInput={(e) => setName(e.currentTarget.value)}
								/>
							</HStack>
							<HStack gap={2}>
								<Button variant="ghost" onClick={closeModal}>
									Cancel
								</Button>
								<Button colorPalette="purple" onClick={saveTheme}>
									Save Theme
								</Button>
							</HStack>
						</Flex>

						{/* Context Menu */}
						<EditorContextMenu
							x={contextMenu().x}
							y={contextMenu().y}
							isOpen={contextMenu().isOpen}
							nodeType={getSelectedNode()?.compName}
							onClose={closeContextMenu}
							onDelete={() => deleteNode(getSelectedNode()?.id)}
							onDuplicate={() => duplicateNode(getSelectedNode()?.id)}
							onBringToFront={bringToFront}
							onSendToBack={sendToBack}
							onAlignLeft={alignLeft}
							onAlignCenterH={alignCenterH}
							onAlignRight={alignRight}
							onAlignTop={alignTop}
							onAlignCenterV={alignCenterV}
							onAlignBottom={alignBottom}
						/>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
}
