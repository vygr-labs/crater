import { Box, HStack, Stack, VStack } from "styled-system/jsx";
import { Text } from "../ui/text";
import { Menu } from "../ui/menu";
import { Portal } from "solid-js/web";
import {
	TbBook2,
	TbChevronDown,
	TbChevronRight,
	TbEdit,
	TbGripVertical,
	TbList,
	TbMusic,
	TbPalette,
	TbPhoto,
	TbPlayerPlay,
	TbPlaylist,
	TbPresentation,
	TbTrash,
	TbVideo,
} from "solid-icons/tb";
import { CgDisplayGrid } from "solid-icons/cg";
import { useAppContext } from "~/layouts/AppContext";
import {
	PREVIEW_INDEX_WIDTH,
	SCHEDULE_PANEL_FOCUS_NAME,
} from "~/utils/constants";
import { useFocusContext } from "~/layouts/FocusContext";
import { createEffect, createMemo, createSignal, For, Match, on, Show, Switch } from "solid-js";
import { createVirtualizer } from "@tanstack/solid-virtual";
import ContextMenu from "./ContextMenu";
import ItemDisplay from "./ItemDisplay";
import ScheduleItem from "./ScheduleItem";
import ScheduleItemEditor from "../modals/ScheduleItemEditor";
import type { Theme, ThemeMetadata } from "~/types";
import { IconButton } from "../ui/icon-button";
import { Tooltip } from "../ui/tooltip";
import { produce } from "solid-js/store";
import { createAsyncMemo } from "solidjs-use";

// Icon map for different item types
const typeIcons: Record<string, typeof TbMusic> = {
	song: TbMusic,
	scripture: TbBook2,
	presentation: TbPresentation,
	video: TbVideo,
	image: TbPhoto,
	message: TbList,
};

export default function SchedulePanel() {
	const { appStore, setAppStore } = useAppContext();
	const scheduleItems = createMemo(() => {
		console.log("Updating schedule items: ", appStore.scheduleItems);
		return appStore.scheduleItems;
	});
	const themeMap = createMemo<Record<string, Theme | null | undefined>>(() => ({
		song: appStore.displayData.songTheme,
		scripture: appStore.displayData.scriptureTheme,
		presentation: appStore.displayData.presentationTheme,
		video: null,
		image: null,
		message: null,
	}));

	// Multi-selection state
	const [selectedIndices, setSelectedIndices] = createSignal<Set<number>>(new Set());
	const [lastClickedIndex, setLastClickedIndex] = createSignal<number | null>(null);

	// Context menu state
	const [contextMenuOpen, setContextMenuOpen] = createSignal(false);
	const [contextMenuIndex, setContextMenuIndex] = createSignal<number | null>(null);

	// Edit modal state
	const [editModalOpen, setEditModalOpen] = createSignal(false);
	const [editItemIndex, setEditItemIndex] = createSignal<number | null>(null);

	// Fetch available themes for the context menu
	const availableThemes = createAsyncMemo(async () => {
		const themes = await window.electronAPI.fetchAllThemes();
		return themes;
	}, []);

	// Get themes filtered by type for the current context menu item
	const themesForCurrentItem = createMemo(() => {
		const idx = contextMenuIndex();
		if (idx === null) return [];
		const item = scheduleItems()[idx];
		if (!item) return [];
		const themes = availableThemes() || [];
		// Filter themes by matching type (song themes for songs, scripture themes for scripture)
		return themes.filter((t) => t.type === item.type);
	});

	// Change theme for a schedule item
	const changeItemTheme = async (itemIndex: number, themeId: number | null) => {
		if (themeId === null) {
			// Remove theme override
			setAppStore("scheduleItems", itemIndex, "themeOverride", undefined);
		} else {
			// Fetch the theme and set it
			const theme = await window.electronAPI.fetchTheme(themeId);
			if (theme) {
				setAppStore("scheduleItems", itemIndex, "themeOverride", theme);
			}
		}
		setContextMenuOpen(false);
	};

	// Drag-and-drop state
	const [dragSourceIndex, setDragSourceIndex] = createSignal<number | null>(null);
	const [dragOverIndex, setDragOverIndex] = createSignal<number | null>(null);

	// Handle drag start
	const handleDragStart = (index: number) => {
		setDragSourceIndex(index);
	};

	// Handle drag over
	const handleDragOver = (index: number) => {
		if (dragSourceIndex() !== null && dragSourceIndex() !== index) {
			setDragOverIndex(index);
		}
	};

	// Handle drag end and reorder
	const handleDragEnd = () => {
		const sourceIndex = dragSourceIndex();
		const targetIndex = dragOverIndex();
		
		if (sourceIndex !== null && targetIndex !== null && sourceIndex !== targetIndex) {
			setAppStore("scheduleItems", produce((items) => {
				const [removed] = items.splice(sourceIndex, 1);
				// When dragging down, the target shifts up by 1 after removal
				// When dragging up, the target stays the same
				const insertIndex = sourceIndex < targetIndex ? targetIndex : targetIndex;
				items.splice(insertIndex, 0, removed);
			}));
			// Update focus to follow the moved item
			changeFluidFocus(targetIndex);
		}
		
		setDragSourceIndex(null);
		setDragOverIndex(null);
	};

	// Delete selected items
	const deleteSelectedItems = () => {
		const selected = selectedIndices();
		if (selected.size === 0 && typeof fluidFocusId() === "number") {
			// If no multi-selection, delete the focused item
			const focusId = fluidFocusId()!;
			setAppStore("scheduleItems", produce((items) => {
				items.splice(focusId, 1);
			}));
			// Adjust focus to stay within bounds
			if (focusId >= scheduleItems().length) {
				changeFluidFocus(Math.max(0, scheduleItems().length - 1));
			}
		} else if (selected.size > 0) {
			// Delete all selected items (in reverse order to maintain indices)
			const indicesToDelete = Array.from(selected).sort((a, b) => b - a);
			setAppStore("scheduleItems", produce((items) => {
				for (const idx of indicesToDelete) {
					items.splice(idx, 1);
				}
			}));
			// Clear selection and adjust focus
			setSelectedIndices(new Set<number>());
			const newLength = scheduleItems().length;
			if (newLength > 0) {
				changeFluidFocus(Math.min(fluidFocusId() ?? 0, newLength - 1));
			}
		}
	};

	const pushToLive = (focusId?: number | null, live?: boolean) => {
		// const focusId = itemIndex;
		if (typeof focusId !== "number") return; // || !isCurrentPanel()
		setAppStore(live ? "liveItem" : "previewItem", {
			...appStore.scheduleItems[focusId],
			index: 0,
		});
	};

	const { subscribeEvent, changeFocusPanel, currentPanel } = useFocusContext();
	const isCurrentPanel = () => currentPanel() === name;
	const { name, coreFocusId, fluidFocusId, changeFocus, changeFluidFocus } =
		subscribeEvent({
			name: SCHEDULE_PANEL_FOCUS_NAME,
			defaultCoreFocus: 0,
			defaultFluidFocus: 0,
			handlers: {
				ArrowDown: ({ fluidFocusId, changeFluidFocus }) => {
					if (!isCurrentPanel()) return;
					const newFocusId = Math.min(
						(fluidFocusId ?? 0) + 1,
						scheduleItems().length - 1,
					);
					changeFluidFocus(newFocusId);
					// Clear multi-selection when navigating with arrows (unless shift is held)
					setSelectedIndices(new Set<number>());
				},
				ArrowUp: ({ fluidFocusId, changeFluidFocus }) => {
					if (!isCurrentPanel()) return;
					const newFocusId = Math.max((fluidFocusId ?? 0) - 1, 0);
					changeFluidFocus(newFocusId);
					// Clear multi-selection when navigating with arrows
					setSelectedIndices(new Set<number>());
				},
				Enter: ({ fluidFocusId, changeFocus }) => {
					if (!isCurrentPanel()) return;
					changeFocus(fluidFocusId);
					pushToLive(fluidFocusId, true);
				},
				Delete: () => {
					if (!isCurrentPanel()) return;
					deleteSelectedItems();
				},
			},
			clickHandlers: {
				onClick: ({ changeFluidFocus, focusId, event }) => {
					if (typeof focusId !== "number") return;
					
					const mouseEvent = event as MouseEvent;
					const clickedItem = scheduleItems()[focusId];
					
					if (mouseEvent.ctrlKey || mouseEvent.metaKey) {
						// Ctrl+click: Toggle selection of this item
						setSelectedIndices((prev) => {
							const newSet = new Set(prev);
							if (newSet.has(focusId)) {
								newSet.delete(focusId);
							} else {
								newSet.add(focusId);
							}
							return newSet;
						});
						setLastClickedIndex(focusId);
					} else if (mouseEvent.shiftKey && lastClickedIndex() !== null) {
						// Shift+click: Select range from last clicked to current
						const start = Math.min(lastClickedIndex()!, focusId);
						const end = Math.max(lastClickedIndex()!, focusId);
						const newSet = new Set<number>();
						for (let i = start; i <= end; i++) {
							newSet.add(i);
						}
						setSelectedIndices(newSet);
					} else {
						// Normal click: Clear selection and focus this item
						setSelectedIndices(new Set<number>());
						setLastClickedIndex(focusId);
						
						// Sync to scripture/song panels if applicable
						if (clickedItem && (clickedItem.type === "scripture" || clickedItem.type === "song")) {
							setAppStore("syncFromSchedule", {
								type: clickedItem.type,
								metadata: clickedItem.metadata,
							});
						}
					}
					
					changeFluidFocus(focusId);
					pushToLive(focusId, false);
				},
				onDblClick: ({ changeFocus, focusId }) => {
					if (typeof focusId === "number") {
						changeFocus(focusId);
						pushToLive(focusId, true);
						// Clear multi-selection on double-click
						setSelectedIndices(new Set<number>());
					}
				},
			},
		});

	let virtualizerParentRef!: HTMLDivElement;
	const rowVirtualizer = createMemo(() =>
		createVirtualizer({
			count: scheduleItems().length,
			getScrollElement: () => virtualizerParentRef,
			estimateSize: () => 20,
			overscan: 5,
		}),
	);

	// Scroll to focused item and update preview when navigating
	createEffect(() => {
		const focusId = fluidFocusId();
		console.log("Schedule Panel Fluid Focus Changed: ", focusId);
		if (typeof focusId === "number") {
			rowVirtualizer().scrollToIndex(focusId);
			// Update preview when navigating with keyboard
			if (isCurrentPanel() && scheduleItems().length > 0) {
				pushToLive(focusId, false);
			}
		}
	});

	// Track previous schedule length to detect when items are added
	const [prevScheduleLength, setPrevScheduleLength] = createSignal(scheduleItems().length);
	
	// Select the newly added item when schedule grows
	createEffect(
		on(
			() => scheduleItems().length,
			(newLength) => {
				const prevLength = prevScheduleLength();
				if (newLength > prevLength && newLength > 0) {
					// Items were added, select the last one
					const newIndex = newLength - 1;
					changeFluidFocus(newIndex);
					changeFocus(newIndex);
				}
				setPrevScheduleLength(newLength);
			},
			{ defer: true }
		)
	);

	// Schedule item context menu content
	const ScheduleContextMenuContent = () => {
		const idx = contextMenuIndex();
		if (idx === null) return null;
		const item = scheduleItems()[idx];
		if (!item) return null;

		return (
			<Menu.Content>
				<Menu.ItemGroup>
					<Menu.ItemGroupLabel>Item Actions</Menu.ItemGroupLabel>
					<Menu.Item
						value="go-live"
						onClick={() => {
							pushToLive(idx, true);
							setContextMenuOpen(false);
						}}
					>
						<TbPlayerPlay />
						Go Live
					</Menu.Item>
					<Menu.Item
						value="preview"
						onClick={() => {
							pushToLive(idx, false);
							setContextMenuOpen(false);
						}}
					>
						<CgDisplayGrid />
						Preview
					</Menu.Item>
					<Menu.Item
						value="edit"
						onClick={() => {
							setEditItemIndex(idx);
							setEditModalOpen(true);
							setContextMenuOpen(false);
						}}
					>
						<TbEdit />
						Edit Item
					</Menu.Item>
				</Menu.ItemGroup>
				<Menu.Separator />
				<Show when={themesForCurrentItem().length > 0}>
					<Menu.ItemGroup>
						<Menu.ItemGroupLabel>
							<HStack gap={1}>
								<TbPalette size={14} />
								Theme
							</HStack>
						</Menu.ItemGroupLabel>
						<Menu.Item
							value="theme-default"
							onClick={() => changeItemTheme(idx, null)}
						>
							Use Default
							<Show when={!item.themeOverride}>
								<Text fontSize="xs" color="green.400" ml="auto">✓</Text>
							</Show>
						</Menu.Item>
						<For each={themesForCurrentItem()}>
							{(theme) => (
								<Menu.Item
									value={`theme-${theme.id}`}
									onClick={() => changeItemTheme(idx, theme.id)}
								>
									{theme.title}
									<Show when={item.themeOverride?.id === theme.id}>
										<Text fontSize="xs" color="green.400" ml="auto">✓</Text>
									</Show>
								</Menu.Item>
							)}
						</For>
					</Menu.ItemGroup>
					<Menu.Separator />
				</Show>
				<Menu.ItemGroup>
					<Menu.Item
						value="delete"
						color="fg.error"
						onClick={() => {
							setAppStore("scheduleItems", produce((items) => {
								items.splice(idx, 1);
							}));
							setContextMenuOpen(false);
						}}
					>
						<TbTrash />
						Remove from Schedule
					</Menu.Item>
				</Menu.ItemGroup>
			</Menu.Content>
		);
	};

	return (
		<Stack pos="relative" h="full" pt={8} pb="1" gap={0}>
			<ContextMenu
				open={contextMenuOpen()}
				setOpen={setContextMenuOpen}
				ref={virtualizerParentRef}
				content={<ScheduleContextMenuContent />}
			>
				<Show
					when={scheduleItems().length}
					fallback={
						<VStack gap={3} h="full" justify="center" px={6}>
							<Box color="gray.600">
								<TbPlaylist size={40} />
							</Box>
							<VStack gap={1}>
								<Text fontSize="14px" fontWeight="medium" color="gray.300">
									No items in schedule
								</Text>
								<Text fontSize="12px" color="gray.500" textAlign="center">
									Add songs, scriptures, or media from the tabs below
								</Text>
							</VStack>
						</VStack>
					}
				>
					<Box
						style={{
							height: `${rowVirtualizer().getTotalSize()}px`,
							width: "100%",
							position: "relative",
						}}
					>
						<Box
							pos="absolute"
							top={0}
							left={0}
							w="full"
							style={{
								transform: `translateY(${rowVirtualizer().getVirtualItems()[0]?.start ?? 0}px)`,
							}}
						>
							<For each={rowVirtualizer().getVirtualItems()}>
								{(virtualItem) => {
									const item = scheduleItems()[virtualItem.index];
									const TypeIcon = typeIcons[item.type] || TbList;
									// Use themeOverride if available, otherwise fall back to global theme
									const itemTheme = item.themeOverride ?? themeMap()[item.type];
									return (
										<ScheduleItem
											index={virtualItem.index}
											item={item}
											isFocusItem={fluidFocusId() === virtualItem.index}
											isSelected={selectedIndices().has(virtualItem.index)}
											panelName={name}
											isCurrentPanel={currentPanel() === name}
											theme={itemTheme}
											icon={TypeIcon}
											onDragStart={handleDragStart}
											onDragOver={handleDragOver}
											onDragEnd={handleDragEnd}
											isDragOver={dragOverIndex() === virtualItem.index}
											hasThemeOverride={!!item.themeOverride}
											onContextMenu={(e, idx) => {
												setContextMenuIndex(idx);
												// Don't prevent default - let the ContextTrigger handle the menu opening
											}}
										/>
									);
								}}
							</For>
						</Box>
					</Box>
				</Show>
			</ContextMenu>

			{/* Header */}
			<HStack
				justifyContent="space-between"
				gap={0}
				position="absolute"
				top={0}
				w="full"
				h={8}
				bg="gray.900"
				borderBottom="1px solid"
				borderBottomColor="gray.800"
				color="gray.300"
			>
				<HStack gap={2} ml={3}>
					<TbPlaylist size={14} color="var(--colors-gray-500)" />
					<Text fontSize="12px" fontWeight="medium" color="gray.300">
						Schedule
					</Text>
					<Show when={scheduleItems().length}>
						<Text fontSize="11px" color="gray.500">
							({scheduleItems().length})
						</Text>
					</Show>
					<Show when={selectedIndices().size > 0}>
						<Text fontSize="11px" color="blue.400">
							• {selectedIndices().size} selected
						</Text>
					</Show>
				</HStack>
				<HStack gap={1}>
					{/* Delete button */}
					<Show when={scheduleItems().length > 0}>
						<Tooltip.Root openDelay={400} closeDelay={0}>
							<Tooltip.Trigger
								asChild={(triggerProps) => (
									<IconButton
										{...triggerProps()}
										variant="ghost"
										size="xs"
										color="gray.500"
										_hover={{ color: "red.400", bg: "gray.800" }}
										onClick={deleteSelectedItems}
									>
										<TbTrash size={14} />
									</IconButton>
								)}
							/>
							<Tooltip.Positioner>
								<Tooltip.Content>
									<Text fontSize="xs">Delete selected (Del)</Text>
								</Tooltip.Content>
							</Tooltip.Positioner>
						</Tooltip.Root>
					</Show>
					<Menu.Root>
						<Menu.Trigger
							asChild={(triggerProps) => (
								<HStack
									gap={0.5}
									h={6}
									px={2}
									py={0.5}
									cursor="pointer"
									color="gray.400"
									_hover={{ color: "white", bg: "gray.700" }}
									rounded="sm"
									mr={1}
									transition="all 0.15s ease"
									{...triggerProps()}
								>
									<CgDisplayGrid size={15} />
									<TbChevronDown size={10} />
								</HStack>
							)}
						></Menu.Trigger>
						<Portal>
							<Menu.Positioner>
								<Menu.Content minW="160px">
									<Menu.ItemGroup>
										<Menu.Root
											positioning={{ placement: "right-start", gutter: 2 }}
										>
											<Menu.TriggerItem w="full" justifyContent="space-between">
												<span>Sort by</span>
												<TbChevronRight size={14} />
											</Menu.TriggerItem>
											<Portal>
												<Menu.Positioner>
													<Menu.Content minW="120px">
														<Menu.ItemGroup>
															<Menu.Item value="name">Name</Menu.Item>
															<Menu.Item value="date-added">
																Date Added
															</Menu.Item>
															<Menu.Item value="type">Type</Menu.Item>
														</Menu.ItemGroup>
														<Menu.Separator />
														<Menu.ItemGroup>
															<Menu.Item value="ascending">Ascending</Menu.Item>
															<Menu.Item value="descending">
																Descending
															</Menu.Item>
														</Menu.ItemGroup>
													</Menu.Content>
												</Menu.Positioner>
											</Portal>
										</Menu.Root>
										<Menu.Item value="clear-all" color="fg.error">
											Clear Schedule
										</Menu.Item>
									</Menu.ItemGroup>
								</Menu.Content>
							</Menu.Positioner>
						</Portal>
					</Menu.Root>
				</HStack>
			</HStack>

			{/* Schedule Item Editor Modal */}
			<ScheduleItemEditor
				open={editModalOpen()}
				setOpen={setEditModalOpen}
				itemIndex={editItemIndex()}
			/>
		</Stack>
	);
}
