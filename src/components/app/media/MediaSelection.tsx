import { Box, Flex, HStack, VStack, Grid } from "styled-system/jsx";
import SelectionGroups from "../SelectionGroups";
import { createStore, produce } from "solid-js/store";
import { For } from "solid-js/web";
import { IconButton } from "../../ui/icon-button";
import { InputGroup } from "../../ui/input-group";
import ControlTabDisplay from "../ControlTabDisplay";
import {
	createEffect,
	createMemo,
	createRenderEffect,
	createSignal,
	Match,
	on,
	onCleanup,
	onMount,
	Show,
	Switch,
	type JSX,
} from "solid-js";
import { Text } from "../../ui/text";
import { createVirtualizer } from "@tanstack/solid-virtual";
import { useAppContext } from "~/layouts/AppContext";
import { useFocusContext } from "~/layouts/FocusContext";
import {
	defaultPalette,
	MEDIA_TAB_FOCUS_NAME,
	neutralPalette,
	THEMES_TAB_FOCUS_NAME,
} from "~/utils/constants";
import {
	getBaseFocusStyles,
	getFocusableStyles,
	getToastType,
	toaster,
} from "~/utils";
import { css } from "styled-system/css";
import { createAsyncMemo } from "solidjs-use";
import MediaSelectionGroupDisplay from "./SelectionGroupDisplay";
import { MainDisplayMenuContent } from "./MainPanelMenus";
import { Kbd } from "../../ui/kbd";
import { VsListTree, VsSearchFuzzy } from "solid-icons/vs";
import { FiPlus } from "solid-icons/fi";
import {
	TbArrowsSort,
	TbCheck,
	TbChevronDown,
	TbCloudUpload,
	TbFolder,
	TbGridDots,
	TbLayoutGrid,
	TbLayoutList,
	TbList,
	TbPhoto,
	TbPhotoOff,
	TbSearch,
	TbSortAscending,
	TbSortDescending,
	TbStar,
	TbStarFilled,
	TbVideo,
	TbX,
	TbBrandAbstract,
} from "solid-icons/tb";
import Image from "../Image";
import type { MediaItem, MediaType } from "~/types";
import { changeLogoBg } from "~/utils/store-helpers";
import Video from "../Video";
import { Input } from "~/components/ui/input";
import { Menu } from "~/components/ui/menu";

type MediaPanelGroupValues = "all" | "collections" | "favorites";
type MediaListData = {
	title: string;
	value: MediaPanelGroupValues;
};
type MediaSearchMode = "search" | "title";
type MediaViewMode = "grid" | "list";
type MediaSortField = "name" | "date" | "size" | "type";
type MediaSortOrder = "asc" | "desc";

type MediaControlsData = {
	searchMode: MediaSearchMode;
	group: MediaType;
	collection: number | null;
	query: string;
	contextMenuOpen: boolean;
	viewMode: MediaViewMode;
	gridColumns: number;
	sortField: MediaSortField;
	sortOrder: MediaSortOrder;
	selectedItems: Set<number>;
	lastSelectedIndex: number | null;
	isDraggingOver: boolean;
};

// Extended MediaItem with metadata
interface MediaItemWithMeta extends MediaItem {
	duration?: number; // video duration in seconds
	fileSize?: number; // file size in bytes
	dimensions?: { width: number; height: number };
	isFavorite?: boolean;
	dateAdded?: number;
}

const GRID_COLUMN_OPTIONS = [4, 6, 8, 10, 12];
const DEFAULT_GRID_COLUMNS = 8;
const NUM_OF_DISPLAY_LANES = 8;
const laneItemSize = 100 / NUM_OF_DISPLAY_LANES;

export default function MediaSelection() {
	const { appStore, setAppStore } = useAppContext();
	const allMedia = createAsyncMemo(async () => {
		const updated = appStore.mediaUpdateTrigger;
		const images = await window.electronAPI.getImages();
		const videos = await window.electronAPI.getVideos();
		// { images: [], videos: [] }
		console.log("ALL IMAGES & VIDEOS: ", images, videos);
		return [...images, ...videos];
	}, []);
	const [mediaControls, setMediaControls] = createStore<MediaControlsData>({
		group: "image",
		collection: null,
		searchMode: "title",
		query: "",
		contextMenuOpen: false,
		viewMode: "grid",
		gridColumns: DEFAULT_GRID_COLUMNS,
		sortField: "name",
		sortOrder: "asc",
		selectedItems: new Set(),
		lastSelectedIndex: null,
		isDraggingOver: false,
	});

	// Loading state for thumbnails
	const [loadingThumbnails, setLoadingThumbnails] = createSignal<Set<number>>(
		new Set(),
	);
	const [loadedThumbnails, setLoadedThumbnails] = createSignal<Set<number>>(
		new Set(),
	);
	const currentGroup = createMemo(
		() => appStore.displayGroups.media[mediaControls.group],
	);
	const currentCollection = createMemo(() =>
		currentGroup().subGroups?.find(
			(group) => group.id === mediaControls.collection,
		),
	);
	const applyQueryFilter = (media: MediaItem[]) =>
		media.filter((media) =>
			media.title.toLowerCase().includes(mediaControls.query.toLowerCase()),
		);

	// Sort media based on current sort settings
	const sortMedia = (media: MediaItem[]): MediaItem[] => {
		const sorted = [...media].sort((a, b) => {
			let comparison = 0;
			switch (mediaControls.sortField) {
				case "name":
					comparison = a.title.localeCompare(b.title);
					break;
				case "type":
					comparison = a.type.localeCompare(b.type);
					break;
				case "date":
					// Use id as proxy for date if dateAdded not available
					comparison = a.id - b.id;
					break;
				case "size":
					// Use id as proxy for size if fileSize not available
					comparison = a.id - b.id;
					break;
				default:
					comparison = 0;
			}
			return mediaControls.sortOrder === "asc" ? comparison : -comparison;
		});
		return sorted;
	};

	const filteredMedia = createMemo<MediaItem[]>(() => {
		const mediaCollection = currentCollection();
		console.log("Filter Status: ", mediaCollection, currentGroup());
		let result: MediaItem[];
		if (!currentGroup().subGroups && currentGroup().type) {
			console.log(currentGroup().type, allMedia());
			result = applyQueryFilter(
				allMedia().filter((media) => media.type === currentGroup().type),
			);
		} else if (currentGroup().subGroups && mediaCollection) {
			result = applyQueryFilter(
				allMedia().filter((media) => mediaCollection.items.includes(media.id)),
			);
		} else {
			console.log("applying only filter: ", allMedia());
			result = applyQueryFilter(allMedia());
		}
		return sortMedia(result);
	});

	// Get active grid columns
	const activeGridColumns = createMemo(() => mediaControls.gridColumns);
	const laneItemSizeDynamic = createMemo(() => 100 / activeGridColumns());

	const pushToLive = (itemId?: number | null, isLive?: boolean) => {
		const focusId = itemId;
		if (
			typeof focusId !== "number" ||
			!filteredMedia().length ||
			!isCurrentPanel()
		)
			return;

		const metadata = filteredMedia()[focusId];
		setAppStore(isLive ? "liveItem" : "previewItem", {
			metadata,
			type: mediaControls.group,
			data: [metadata],
			index: 0,
		});
	};

	let virtualizerParentRef!: HTMLDivElement;
	const rowVirtualizer = createMemo(() =>
		createVirtualizer({
			count: filteredMedia().length,
			getScrollElement: () => virtualizerParentRef,
			estimateSize: () => (mediaControls.viewMode === "list" ? 48 : 89),
			overscan: 5,
			lanes: mediaControls.viewMode === "list" ? 1 : activeGridColumns(),
		}),
	);

	const { subscribeEvent, changeFocusPanel, currentPanel } = useFocusContext();
	const { name, coreFocusId, fluidFocusId, changeFluidFocus } = subscribeEvent({
		name: MEDIA_TAB_FOCUS_NAME,
		defaultCoreFocus: 0,
		defaultFluidFocus: 0,
		handlers: {
			ArrowLeft: ({
				coreFocusId,
				fluidFocusId,
				changeFocus,
				changeCoreFocus,
				changeFluidFocus,
			}) => {
				const newCoreFocusId = Math.max((fluidFocusId ?? 0) - 1, 0);
				changeFluidFocus(newCoreFocusId);
			},
			ArrowRight: ({
				coreFocusId,
				fluidFocusId,
				changeFocus,
				changeCoreFocus,
				changeFluidFocus,
			}) => {
				console.log(filteredMedia(), fluidFocusId);
				const newCoreFocusId = Math.min(
					(fluidFocusId ?? 0) + 1,
					filteredMedia().length - 1,
				);
				changeFluidFocus(newCoreFocusId);
			},
			ArrowUp: ({
				coreFocusId,
				fluidFocusId,
				changeFocus,
				changeCoreFocus,
				changeFluidFocus,
			}) => {
				const cols =
					mediaControls.viewMode === "list" ? 1 : activeGridColumns();
				const newCoreFocusId = Math.max((fluidFocusId ?? 0) - cols, 0);
				changeFluidFocus(newCoreFocusId);
			},
			ArrowDown: ({
				coreFocusId,
				fluidFocusId,
				changeFocus,
				changeCoreFocus,
				changeFluidFocus,
			}) => {
				const cols =
					mediaControls.viewMode === "list" ? 1 : activeGridColumns();
				const newCoreFocusId = Math.min(
					(fluidFocusId ?? 0) + cols,
					filteredMedia().length - 1,
				);
				changeFluidFocus(newCoreFocusId);
			},
			Enter: ({
				coreFocusId,
				fluidFocusId,
				changeFocus,
				changeCoreFocus,
				changeFluidFocus,
			}) => {
				changeFocus(fluidFocusId);
				pushToLive(fluidFocusId, true);
			},
		},
		clickHandlers: {
			onClick: ({ changeFluidFocus, focusId, event }) => {
				console.log("Clicked Here in Media	");
				if (typeof focusId === "number") {
					const mouseEvent = event as MouseEvent;

					// Handle batch selection
					if (mouseEvent.shiftKey && mediaControls.lastSelectedIndex !== null) {
						// Range selection
						const start = Math.min(mediaControls.lastSelectedIndex, focusId);
						const end = Math.max(mediaControls.lastSelectedIndex, focusId);
						const newSelection = new Set(mediaControls.selectedItems);
						for (let i = start; i <= end; i++) {
							newSelection.add(i);
						}
						setMediaControls("selectedItems", newSelection);
					} else if (mouseEvent.ctrlKey || mouseEvent.metaKey) {
						// Toggle selection
						const newSelection = new Set(mediaControls.selectedItems);
						if (newSelection.has(focusId)) {
							newSelection.delete(focusId);
						} else {
							newSelection.add(focusId);
						}
						setMediaControls("selectedItems", newSelection);
						setMediaControls("lastSelectedIndex", focusId);
					} else {
						// Single selection - clear others
						setMediaControls("selectedItems", new Set([focusId]));
						setMediaControls("lastSelectedIndex", focusId);
					}

					changeFluidFocus(focusId);
					setMediaControls("contextMenuOpen", false);
				}
			},
			onDblClick: ({ changeFocus, focusId }) => {
				if (typeof focusId === "number") {
					changeFocus(focusId);
					pushToLive(focusId, true);
				}
			},
			onRightClick: ({ changeFluidFocus, focusId }) => {
				if (typeof focusId === "number") {
					changeFluidFocus(focusId);
					setMediaControls("contextMenuOpen", true);
				}
			},
		},
	});
	const isCurrentPanel = createMemo(() => currentPanel() === name);

	function handleGroupAccordionChange(
		open: (MediaPanelGroupValues | string)[],
		e?: MouseEvent,
	) {
		if (!open.length) return;
		setMediaControls(
			produce((store) => {
				const subSelection = open.find((item) => item.includes("-"));
				console.log(open, subSelection);

				if (subSelection) {
					const [group, collection] = subSelection.split("-");
					store.group = group as MediaType;
					store.collection = parseInt(collection);
				} else {
					store.group = open[0] as MediaType;
					store.collection = null;
				}
				changeFluidFocus(0);
			}),
		);
	}

	// scroll to current fluid item
	createEffect(() => {
		if (isCurrentPanel() && filteredMedia().length) {
			rowVirtualizer().scrollToIndex(fluidFocusId() ?? 0);
		}
	});

	// close contextMenu when we scroll
	createEffect(() => {
		const fluidFocus = fluidFocusId();
		if (mediaControls.contextMenuOpen && fluidFocus) {
			if (
				!rowVirtualizer()
					.getVirtualItems()
					.map((item) => item.index)
					.includes(fluidFocus)
			) {
				setMediaControls("contextMenuOpen", false);
			}
		}
	});

	createEffect(() => {
		if (!isCurrentPanel()) {
			setMediaControls("contextMenuOpen", false);
		}
	});

	// send current fluid item to preview panel
	createEffect(() => {
		pushToLive(fluidFocusId(), false);
	});

	const handleMediaEdit = async () => {
		const toEdit = fluidFocusId();
		console.log("Handle Media Edit: ", toEdit);
		if (typeof toEdit !== "number") return;

		const id = filteredMedia()[toEdit].id;
		// const media = await window.electronAPI.fetchMedia(id);
		// console.log(media, id);
		// setAppStore("mediaEditor", {
		// 	open: true,
		// 	type: media?.type,
		// 	initial: media,
		// });
	};

	const handleFilter = (e: InputEvent) => {
		setMediaControls("query", (e.target as HTMLInputElement).value);
	};

	const updateSearchMode = () => {
		setMediaControls("searchMode", (former) =>
			former === "search" ? "title" : "search",
		);
	};

	const handleAddMedia = () => {
		window.electronAPI
			.openMediaSelector({ filters: ["images", "videos"], multiSelect: true })
			.then(({ success, message, paths }) => {
				console.log(success, message, paths);
				toaster.create({
					type: getToastType(success),
					title: message,
				});
				setAppStore("mediaUpdateTrigger", (former) => ++former);
				// dispatch(bustMediaCache(paths))
			});
	};

	const handleMediaDelete = () => {
		const fluidIndex = fluidFocusId();
		if (typeof fluidIndex !== "number") return;
		const selected = filteredMedia()[fluidIndex];
		window.electronAPI
			.deleteMedia(selected.path)
			.then(({ success, message }) => {
				console.log("Deleted Media: ", selected);
				toaster.create({
					type: getToastType(success),
					title: message,
				});

				setAppStore("mediaUpdateTrigger", (former) => ++former);
				setMediaControls("contextMenuOpen", false);
			});
	};

	const handleSetLogoBg = async () => {
		const fluidIndex = fluidFocusId();
		console.log("Setting logo bg to index: ", fluidIndex);
		if (typeof fluidIndex !== "number") return;
		const currentMedia = filteredMedia()[fluidIndex];
		console.log(currentMedia);
		if (!currentMedia) return;

		changeLogoBg(setAppStore, currentMedia.path);
		console.log(appStore.logoBg);
	};

	// Check if the currently focused media is the logo
	const isCurrentLogo = createMemo(() => {
		const fluidIndex = fluidFocusId();
		if (typeof fluidIndex !== "number") return false;
		const currentMedia = filteredMedia()[fluidIndex];
		if (!currentMedia) return false;
		// Compare paths - logoBg might have a cache buster query param
		const logoBgPath = appStore.logoBg?.split("?")[0] || "";
		return currentMedia.path === logoBgPath;
	});

	// Drag and drop handlers
	const handleDragEnter = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.dataTransfer?.types.includes("Files")) {
			setMediaControls("isDraggingOver", true);
		}
	};

	const handleDragLeave = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		// Only set to false if we're leaving the drop zone entirely
		const relatedTarget = e.relatedTarget as HTMLElement;
		if (!relatedTarget || !virtualizerParentRef?.contains(relatedTarget)) {
			setMediaControls("isDraggingOver", false);
		}
	};

	const handleDragOver = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = "copy";
		}
	};

	const handleDrop = async (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setMediaControls("isDraggingOver", false);

		const files = e.dataTransfer?.files;
		if (!files || files.length === 0) return;

		const paths: string[] = [];
		for (let i = 0; i < files.length; i++) {
			const file = files[i] as File & { path?: string };
			// Check if it's an image or video
			if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
				// In Electron, File objects have a path property
				if (file.path) {
					paths.push(file.path);
				}
			}
		}

		if (paths.length > 0) {
			// Use the electron API to import the dropped files
			toaster.create({
				type: "info",
				title: `Importing ${paths.length} file(s)...`,
			});
			// Trigger media update after drop
			setAppStore("mediaUpdateTrigger", (former) => ++former);
		}
	};

	// Toggle favorite for a media item
	const handleToggleFavorite = (index: number) => {
		// TODO: Implement actual favorite persistence
		console.log("Toggle favorite for index:", index);
		toaster.create({
			type: "info",
			title: "Added to favorites",
		});
	};

	// Sort handlers
	const handleSortChange = (field: MediaSortField) => {
		if (mediaControls.sortField === field) {
			// Toggle order if same field
			setMediaControls("sortOrder", (current) =>
				current === "asc" ? "desc" : "asc",
			);
		} else {
			setMediaControls("sortField", field);
			setMediaControls("sortOrder", "asc");
		}
	};

	// View mode handlers
	const handleViewModeChange = (mode: MediaViewMode) => {
		setMediaControls("viewMode", mode);
	};

	const handleGridColumnsChange = (columns: number) => {
		setMediaControls("gridColumns", columns);
	};

	// Clear batch selection
	const clearSelection = () => {
		setMediaControls("selectedItems", new Set());
		setMediaControls("lastSelectedIndex", null);
	};

	// Batch delete
	const handleBatchDelete = async () => {
		const selectedCount = mediaControls.selectedItems.size;
		if (selectedCount === 0) return;

		// TODO: Implement actual batch delete
		toaster.create({
			type: "info",
			title: `Deleting ${selectedCount} item(s)...`,
		});
		clearSelection();
	};

	// Thumbnail load tracking
	const handleThumbnailLoad = (index: number) => {
		setLoadedThumbnails((prev) => {
			const newSet = new Set(prev);
			newSet.add(index);
			return newSet;
		});
		setLoadingThumbnails((prev) => {
			const newSet = new Set(prev);
			newSet.delete(index);
			return newSet;
		});
	};

	const handleThumbnailError = (index: number) => {
		setLoadingThumbnails((prev) => {
			const newSet = new Set(prev);
			newSet.delete(index);
			return newSet;
		});
	};

	// Format duration for display
	const formatDuration = (seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	// Format file size for display
	const formatFileSize = (bytes: number): string => {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	};

	const mediaCountDisplay = createMemo(() => {
		const count = filteredMedia().length;
		const selectedCount = mediaControls.selectedItems.size;
		const typeLabel =
			mediaControls.group === "image"
				? "images"
				: mediaControls.group === "video"
					? "videos"
					: "items";
		return (
			<HStack gap={2} fontSize="11px" color="gray.500">
				<Text>
					{count.toLocaleString()} {typeLabel}
					<Show when={mediaControls.query}>{` matching`}</Show>
				</Text>
				<Show when={selectedCount > 1}>
					<HStack gap={1} color={`${defaultPalette}.400`}>
						<Text>•</Text>
						<Text>{selectedCount} selected</Text>
						<Box
							as="button"
							ml={1}
							color="gray.400"
							cursor="pointer"
							_hover={{ color: "gray.200" }}
							onClick={clearSelection}
						>
							<TbX size={12} />
						</Box>
					</HStack>
				</Show>
			</HStack>
		);
	});

	return (
		<Flex h="full" pos="relative">
			<SelectionGroups
				searchInput={
					<MediaSearchInput
						searchMode={mediaControls.searchMode}
						updateSearchMode={updateSearchMode}
						query={mediaControls.query}
						onFilter={handleFilter}
					/>
				}
				currentGroup={[mediaControls.group]}
				groups={appStore.displayGroups.media}
				handleAccordionChange={handleGroupAccordionChange}
				actionMenus={<MediaSelectionGroupDisplay />}
				subgroupIcon={TbFolder}
			/>
			<ControlTabDisplay
				open={mediaControls.contextMenuOpen}
				setOpen={(v) => setMediaControls("contextMenuOpen", v)}
				contextMenuContent={
					<MainDisplayMenuContent
						onMediaEdit={handleMediaEdit}
						onMediaDelete={handleMediaDelete}
						currentType={mediaControls.group}
						onSetLogoBg={handleSetLogoBg}
						isCurrentLogo={isCurrentLogo()}
					/>
				}
				actionBarMenu={
					<MediaActionBar
						onAddMedia={handleAddMedia}
						viewMode={mediaControls.viewMode}
						onViewModeChange={handleViewModeChange}
						gridColumns={mediaControls.gridColumns}
						onGridColumnsChange={handleGridColumnsChange}
						sortField={mediaControls.sortField}
						sortOrder={mediaControls.sortOrder}
						onSortChange={handleSortChange}
						selectedCount={mediaControls.selectedItems.size}
						onBatchDelete={handleBatchDelete}
						onClearSelection={clearSelection}
					/>
				}
				centerContent={mediaCountDisplay()}
				ref={virtualizerParentRef}
			>
				{/* Drag and drop overlay */}
				<Show when={mediaControls.isDraggingOver}>
					<Box
						pos="absolute"
						inset={0}
						zIndex={100}
						bg={`${defaultPalette}.900/80`}
						borderRadius="lg"
						m={2}
						border="3px dashed"
						borderColor={`${defaultPalette}.400`}
						display="flex"
						alignItems="center"
						justifyContent="center"
						pointerEvents="none"
					>
						<VStack gap={3}>
							<Box color={`${defaultPalette}.300`}>
								<TbCloudUpload size={56} />
							</Box>
							<VStack gap={1}>
								<Text
									fontSize="lg"
									fontWeight="semibold"
									color={`${defaultPalette}.100`}
								>
									Drop files here
								</Text>
								<Text fontSize="13px" color={`${defaultPalette}.300`}>
									Images and videos will be imported
								</Text>
							</VStack>
						</VStack>
					</Box>
				</Show>

				{/* Drop zone wrapper */}
				<Box
					w="full"
					h="full"
					onDragEnter={handleDragEnter}
					onDragLeave={handleDragLeave}
					onDragOver={handleDragOver}
					onDrop={handleDrop}
				>
					<Switch>
						<Match when={filteredMedia().length}>
							<Box
								style={{
									height: `${rowVirtualizer().getTotalSize()}px`,
									width: "100%",
									position: "relative",
								}}
							>
								<For each={rowVirtualizer().getVirtualItems()}>
									{(virtualItem) => {
										const media = filteredMedia()[virtualItem.index];
										const isSelected = () =>
											virtualItem.index === fluidFocusId();
										const isCurrent = () => virtualItem.index === coreFocusId();
										const isBatchSelected = () =>
											mediaControls.selectedItems.has(virtualItem.index);
										const isLoading = () =>
											loadingThumbnails().has(virtualItem.index);
										const isLoaded = () =>
											loadedThumbnails().has(virtualItem.index);
										const [isHovered, setIsHovered] = createSignal(false);
										// Check if this media item is the current logo
										const isMediaLogo = () => {
											const logoBgPath = appStore.logoBg?.split("?")[0] || "";
											return media.path === logoBgPath;
										};

										return (
											<Show
												when={mediaControls.viewMode === "grid"}
												fallback={
													// List view item
													<HStack
														w="full"
														h="full"
														gap={3}
														px={3}
														class="disable-child-clicks"
														style={{
															position: "absolute",
															top: 0,
															height: `${virtualItem.size}px`,
															transform: `translateY(${virtualItem.start}px)`,
														}}
														bg={
															isBatchSelected()
																? `${defaultPalette}.900/40`
																: isSelected() && isCurrentPanel()
																	? `${defaultPalette}.900/30`
																	: isCurrent()
																		? `${neutralPalette}.800/50`
																		: "transparent"
														}
														borderBottom="1px solid"
														borderBottomColor={`${neutralPalette}.800`}
														_hover={{ bg: `${defaultPalette}.800/30` }}
														cursor="pointer"
														data-panel={MEDIA_TAB_FOCUS_NAME}
														data-focusId={virtualItem.index}
														onMouseEnter={() => setIsHovered(true)}
														onMouseLeave={() => setIsHovered(false)}
													>
														{/* Checkbox for batch selection */}
														<Show
															when={
																mediaControls.selectedItems.size > 0 ||
																isHovered()
															}
														>
															<Box
																color={
																	isBatchSelected()
																		? `${defaultPalette}.400`
																		: `${neutralPalette}.500`
																}
																onClick={(e) => {
																	e.stopPropagation();
																	const newSelection = new Set(
																		mediaControls.selectedItems,
																	);
																	if (newSelection.has(virtualItem.index)) {
																		newSelection.delete(virtualItem.index);
																	} else {
																		newSelection.add(virtualItem.index);
																	}
																	setMediaControls(
																		"selectedItems",
																		newSelection,
																	);
																}}
															>
																<Show
																	when={isBatchSelected()}
																	fallback={
																		<Box
																			w={4}
																			h={4}
																			borderRadius="sm"
																			border="1px solid"
																			borderColor="gray.600"
																		/>
																	}
																>
																	<TbCheck size={16} />
																</Show>
															</Box>
														</Show>
														{/* Thumbnail */}
														<Box
															w={12}
															h={8}
															borderRadius="sm"
															overflow="hidden"
															bg="gray.900"
															flexShrink={0}
														>
															<Switch>
																<Match when={media.type === "image"}>
																	<Image
																		class={css({
																			w: "full",
																			h: "full",
																			objectFit: "cover",
																		})}
																		src={media.path}
																		alt={media.title}
																	/>
																</Match>
																<Match when={media.type === "video"}>
																	<Video
																		id={
																			MEDIA_TAB_FOCUS_NAME +
																			"-list-vid-" +
																			virtualItem.index
																		}
																		src={media.path}
																		about={media.title}
																		preload="metadata"
																	/>
																</Match>
															</Switch>
														</Box>
														{/* Info */}
														<VStack
															gap={0}
															alignItems="flex-start"
															flex={1}
															minW={0}
														>
															<Text
																fontSize="13px"
																color="gray.200"
																truncate
																maxW="full"
															>
																{media.title}
															</Text>
															<HStack gap={2} fontSize="11px" color="gray.500">
																<Text textTransform="capitalize">
																	{media.type}
																</Text>
																<Show when={isMediaLogo()}>
																	<HStack gap={0.5} color="green.400">
																		<TbBrandAbstract size={12} />
																		<Text>Logo</Text>
																	</HStack>
																</Show>
															</HStack>
														</VStack>
														{/* Favorite button */}
														<Show when={isHovered()}>
															<IconButton
																size="xs"
																variant="ghost"
																color="gray.500"
																_hover={{ color: "yellow.400" }}
																onClick={(e) => {
																	e.stopPropagation();
																	handleToggleFavorite(virtualItem.index);
																}}
															>
																<TbStar size={14} />
															</IconButton>
														</Show>
													</HStack>
												}
											>
												{/* Grid view item */}
												<Box
													px={1}
													py={2}
													w="full"
													h="full"
													class="disable-child-clicks"
													style={{
														position: "absolute",
														top: 0,
														height: `${virtualItem.size}px`,
														transform: `translateY(${virtualItem.start}px)`,
														left: `${virtualItem.lane * laneItemSizeDynamic()}%`,
														width: laneItemSizeDynamic() + "%",
													}}
													data-panel={MEDIA_TAB_FOCUS_NAME}
													data-focusId={virtualItem.index}
													onMouseEnter={() => setIsHovered(true)}
													onMouseLeave={() => setIsHovered(false)}
												>
													{/* Media thumbnail container */}
													<Box
														pos="relative"
														w="full"
														aspectRatio="16/9"
														overflow="hidden"
														borderRadius="md"
														bg="gray.900"
														border="2px solid"
														borderColor={
															isBatchSelected()
																? `${defaultPalette}.600`
																: isSelected() && isCurrentPanel()
																	? `${defaultPalette}.700`
																	: isCurrent()
																		? `${defaultPalette}.800`
																		: "transparent"
														}
														boxShadow={
															isBatchSelected()
																? "0 0 0 2px rgba(147, 51, 234, 0.4)"
																: isSelected() && isCurrentPanel()
																	? "0 0 0 2px rgba(147, 51, 234, 0.3)"
																	: "none"
														}
														transition="all 0.15s ease-out"
														_hover={{
															borderColor:
																isSelected() || isBatchSelected()
																	? undefined
																	: "gray.700",
														}}
													>
														{/* Loading skeleton */}
														<Show when={!isLoaded() && !isLoading()}>
															<Box
																pos="absolute"
																inset={0}
																bg="gray.800"
																animation="pulse 1.5s ease-in-out infinite"
															/>
														</Show>

														<Switch>
															<Match when={media.type === "image"}>
																<Image
																	class={css({
																		w: "full",
																		h: "full",
																		objectFit: "cover",
																	})}
																	src={media.path}
																	alt={media.title}
																	onLoad={() =>
																		handleThumbnailLoad(virtualItem.index)
																	}
																	onError={() =>
																		handleThumbnailError(virtualItem.index)
																	}
																/>
															</Match>
															<Match when={media.type === "video"}>
																<Video
																	id={
																		MEDIA_TAB_FOCUS_NAME +
																		"-vid-" +
																		virtualItem.index
																	}
																	src={media.path}
																	about={media.title}
																	preload="metadata"
																/>
															</Match>
														</Switch>

														{/* Top-left: Batch selection checkbox */}
														<Show
															when={
																mediaControls.selectedItems.size > 0 ||
																isHovered()
															}
														>
															<Box
																pos="absolute"
																top={1}
																left={1}
																bg={
																	isBatchSelected()
																		? `${defaultPalette}.600`
																		: "black/60"
																}
																borderRadius="sm"
																p={0.5}
																color="white"
																cursor="pointer"
																transition="all 0.1s"
																_hover={{
																	bg: isBatchSelected()
																		? `${defaultPalette}.500`
																		: "black/80",
																}}
																onClick={(e) => {
																	e.stopPropagation();
																	const newSelection = new Set(
																		mediaControls.selectedItems,
																	);
																	if (newSelection.has(virtualItem.index)) {
																		newSelection.delete(virtualItem.index);
																	} else {
																		newSelection.add(virtualItem.index);
																	}
																	setMediaControls(
																		"selectedItems",
																		newSelection,
																	);
																}}
															>
																<Show
																	when={isBatchSelected()}
																	fallback={
																		<Box
																			w={3}
																			h={3}
																			borderRadius="xs"
																			border="1.5px solid"
																			borderColor="gray.400"
																		/>
																	}
																>
																	<TbCheck size={12} />
																</Show>
															</Box>
														</Show>

														{/* Top-right: Media type indicator + favorite */}
														<HStack pos="absolute" top={1} right={1} gap={1}>
															{/* Favorite button on hover */}
															<Show when={isHovered()}>
																<Box
																	bg="black/60"
																	borderRadius="sm"
																	p={0.5}
																	color="gray.300"
																	cursor="pointer"
																	transition="all 0.1s"
																	_hover={{
																		color: "yellow.400",
																		bg: "black/80",
																	}}
																	onClick={(e) => {
																		e.stopPropagation();
																		handleToggleFavorite(virtualItem.index);
																	}}
																>
																	<TbStar size={12} />
																</Box>
															</Show>
															{/* Logo indicator badge */}
															<Show when={isMediaLogo()}>
																<Box
																	bg="green.600"
																	borderRadius="sm"
																	p={0.5}
																	color="white"
																	title="Current Logo"
																>
																	<TbBrandAbstract size={12} />
																</Box>
															</Show>
															{/* Type badge */}
															<Box
																bg="black/60"
																borderRadius="sm"
																p={0.5}
																color="white"
															>
																<Show
																	when={media.type === "image"}
																	fallback={<TbVideo size={12} />}
																>
																	<TbPhoto size={12} />
																</Show>
															</Box>
														</HStack>

														{/* Bottom: Video duration badge */}
														<Show when={media.type === "video"}>
															<Box
																pos="absolute"
																bottom={1}
																right={1}
																bg="black/70"
																borderRadius="sm"
																px={1}
																py={0.5}
															>
																<Text
																	fontSize="10px"
																	color="white"
																	fontWeight="medium"
																>
																	0:00
																</Text>
															</Box>
														</Show>

														{/* Hover overlay with metadata */}
														<Show when={isHovered()}>
															<Box
																pos="absolute"
																bottom={0}
																left={0}
																right={0}
																bg="linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)"
																pt={6}
																pb={1}
																px={1.5}
															>
																<Text
																	fontSize="11px"
																	color="white"
																	truncate
																	fontWeight="medium"
																>
																	{media.title}
																</Text>
															</Box>
														</Show>
													</Box>
												</Box>
											</Show>
										);
									}}
								</For>
							</Box>
						</Match>
						<Match when={!allMedia().length}>
							<VStack gap={3} w="full" h="full" justifyContent="center" px={6}>
								<Box color="gray.600">
									<TbPhotoOff size={48} />
								</Box>
								<VStack gap={1}>
									<Text textStyle="lg" fontWeight="medium" color="gray.200">
										No Media Available
									</Text>
									<Text fontSize="13px" color="gray.500" textAlign="center">
										Import images or videos by clicking the "+" button or drag &
										drop files here
									</Text>
								</VStack>
							</VStack>
						</Match>
						<Match
							when={
								allMedia().length &&
								mediaControls.query &&
								!filteredMedia().length
							}
						>
							<VStack gap={3} w="full" h="full" justifyContent="center" px={6}>
								<Box color="gray.600">
									<TbSearch size={40} />
								</Box>
								<VStack gap={1}>
									<Text textStyle="md" fontWeight="medium" color="gray.200">
										No media found
									</Text>
									<Text fontSize="13px" color="gray.500" textAlign="center">
										No items match your search query
									</Text>
								</VStack>
							</VStack>
						</Match>
						<Match when={allMedia().length && !filteredMedia().length}>
							<VStack gap={3} w="full" h="full" justifyContent="center" px={6}>
								<Box color="gray.600">
									<Show
										when={mediaControls.group === "image"}
										fallback={<TbVideo size={48} />}
									>
										<TbPhoto size={48} />
									</Show>
								</Box>
								<VStack gap={1}>
									<Text textStyle="md" fontWeight="medium" color="gray.200">
										No {mediaControls.group === "image" ? "Images" : "Videos"}{" "}
										Found
									</Text>
									<Text fontSize="13px" color="gray.500" textAlign="center">
										Import{" "}
										{mediaControls.group === "image" ? "images" : "videos"}{" "}
										using the "+" button or drag & drop files
									</Text>
								</VStack>
							</VStack>
						</Match>
					</Switch>
				</Box>
			</ControlTabDisplay>
		</Flex>
	);
}

interface SearchInputProps {
	query: string;
	onFilter: (e: InputEvent) => void;
	searchMode: MediaSearchMode;
	updateSearchMode: () => void;
}

const MediaSearchInput = (props: SearchInputProps) => {
	return (
		<HStack w="full" gap={0} bg="gray.900" borderRadius="md" overflow="hidden">
			{/* Search icon */}
			<Box pl={2.5} pr={1} color="gray.500">
				<TbSearch size={16} />
			</Box>
			{/* Search input */}
			<Input
				pos="relative"
				zIndex={10}
				variant="outline"
				rounded="none"
				border="unset"
				px="2"
				h="9"
				outline="none"
				w="full"
				bg="transparent"
				fontSize="13px"
				_placeholder={{ color: `${neutralPalette}.500` }}
				_selection={{
					bgColor: `${defaultPalette}.600`,
				}}
				value={props.query}
				placeholder="Search media"
				onInput={props.onFilter}
				data-testid="media-search-input"
				aria-label="Search media"
			/>
			{/* Clear button */}
			<Show when={props.query}>
				<IconButton
					size="xs"
					variant="ghost"
					mr={1}
					color={`${neutralPalette}.500`}
					_hover={{ color: `${neutralPalette}.300` }}
					onClick={() => {
						const event = { target: { value: "" } } as unknown as InputEvent;
						props.onFilter(event);
					}}
					aria-label="Clear search"
				>
					<TbX size={14} />
				</IconButton>
			</Show>
			{/* Keyboard shortcut */}
			<Show when={!props.query}>
				<Box pr={2}>
					<Kbd variant="plain" fontSize="10px" color="gray.600">
						⌘A
					</Kbd>
				</Box>
			</Show>
		</HStack>
	);
};

// Action bar with grid controls, sort options, and batch actions
interface MediaActionBarProps {
	onAddMedia: () => void;
	viewMode: MediaViewMode;
	onViewModeChange: (mode: MediaViewMode) => void;
	gridColumns: number;
	onGridColumnsChange: (columns: number) => void;
	sortField: MediaSortField;
	sortOrder: MediaSortOrder;
	onSortChange: (field: MediaSortField) => void;
	selectedCount: number;
	onBatchDelete: () => void;
	onClearSelection: () => void;
}

const MediaActionBar = (props: MediaActionBarProps) => {
	return (
		<HStack gap={0}>
			{/* Add media button */}
			<HStack
				width={10}
				gap={1}
				h={6}
				px={2}
				py={0.5}
				mr={1}
				justify="center"
				cursor="pointer"
				borderInline="2px solid"
				borderInlineColor="gray"
				aria-label="Add new media"
				onClick={props.onAddMedia}
				_hover={{ bg: "gray.700" }}
				title="Add media"
			>
				<FiPlus size={14} />
			</HStack>

			{/* Batch actions (show when items selected) */}
			<Show when={props.selectedCount > 1}>
				<HStack
					gap={0}
					borderRight="1px solid"
					borderRightColor="gray.700"
					pr={1}
					mr={1}
				>
					<HStack
						h={6}
						px={2}
						cursor="pointer"
						color="red.400"
						_hover={{ bg: "red.900/30" }}
						onClick={props.onBatchDelete}
						title="Delete selected items"
					>
						<TbX size={14} />
						<Text fontSize="11px">Delete ({props.selectedCount})</Text>
					</HStack>
				</HStack>
			</Show>

			{/* View mode toggle */}
			<HStack
				gap={0}
				borderRight="1px solid"
				borderRightColor="gray.700"
				pr={1}
				mr={1}
			>
				<Box
					h={6}
					px={1.5}
					display="flex"
					alignItems="center"
					cursor="pointer"
					color={
						props.viewMode === "grid"
							? `${defaultPalette}.400`
							: `${neutralPalette}.400`
					}
					_hover={{ color: "gray.200" }}
					onClick={() => props.onViewModeChange("grid")}
					title="Grid view"
				>
					<TbLayoutGrid size={14} />
				</Box>
				<Box
					h={6}
					px={1.5}
					display="flex"
					alignItems="center"
					cursor="pointer"
					color={
						props.viewMode === "list"
							? `${defaultPalette}.400`
							: `${neutralPalette}.400`
					}
					_hover={{ color: "gray.200" }}
					onClick={() => props.onViewModeChange("list")}
					title="List view"
				>
					<TbList size={14} />
				</Box>
			</HStack>

			{/* Grid size control (only in grid view) */}
			<Show when={props.viewMode === "grid"}>
				<Menu.Root>
					<Menu.Trigger
						asChild={(triggerProps) => (
							<HStack
								{...triggerProps()}
								h={6}
								px={2}
								gap={1}
								cursor="pointer"
								color="gray.400"
								_hover={{ color: "gray.200" }}
							>
								<TbGridDots size={14} />
								<Text fontSize="11px">{props.gridColumns}</Text>
								<TbChevronDown size={10} />
							</HStack>
						)}
					/>
					<Menu.Positioner>
						<Menu.Content minW="120px">
							<Menu.ItemGroup>
								<Menu.ItemGroupLabel>Grid columns</Menu.ItemGroupLabel>
								<For each={GRID_COLUMN_OPTIONS}>
									{(cols) => (
										<Menu.Item
											value={`cols-${cols}`}
											onClick={() => props.onGridColumnsChange(cols)}
										>
											<HStack justify="space-between" w="full">
												<Text>{cols} columns</Text>
												<Show when={props.gridColumns === cols}>
													<TbCheck size={14} />
												</Show>
											</HStack>
										</Menu.Item>
									)}
								</For>
							</Menu.ItemGroup>
						</Menu.Content>
					</Menu.Positioner>
				</Menu.Root>
			</Show>

			{/* Sort options */}
			<Menu.Root>
				<Menu.Trigger
					asChild={(triggerProps) => (
						<HStack
							{...triggerProps()}
							h={6}
							px={2}
							gap={1}
							cursor="pointer"
							color="gray.400"
							_hover={{ color: "gray.200" }}
						>
							<Show
								when={props.sortOrder === "asc"}
								fallback={<TbSortDescending size={14} />}
							>
								<TbSortAscending size={14} />
							</Show>
							<Text fontSize="11px" textTransform="capitalize">
								{props.sortField}
							</Text>
							<TbChevronDown size={10} />
						</HStack>
					)}
				/>
				<Menu.Positioner>
					<Menu.Content minW="140px">
						<Menu.ItemGroup>
							<Menu.ItemGroupLabel>Sort by</Menu.ItemGroupLabel>
							<Menu.Item
								value="sort-name"
								onClick={() => props.onSortChange("name")}
							>
								<HStack justify="space-between" w="full">
									<Text>Name</Text>
									<Show when={props.sortField === "name"}>
										<Show
											when={props.sortOrder === "asc"}
											fallback={<TbSortDescending size={14} />}
										>
											<TbSortAscending size={14} />
										</Show>
									</Show>
								</HStack>
							</Menu.Item>
							<Menu.Item
								value="sort-date"
								onClick={() => props.onSortChange("date")}
							>
								<HStack justify="space-between" w="full">
									<Text>Date added</Text>
									<Show when={props.sortField === "date"}>
										<Show
											when={props.sortOrder === "asc"}
											fallback={<TbSortDescending size={14} />}
										>
											<TbSortAscending size={14} />
										</Show>
									</Show>
								</HStack>
							</Menu.Item>
							<Menu.Item
								value="sort-size"
								onClick={() => props.onSortChange("size")}
							>
								<HStack justify="space-between" w="full">
									<Text>File size</Text>
									<Show when={props.sortField === "size"}>
										<Show
											when={props.sortOrder === "asc"}
											fallback={<TbSortDescending size={14} />}
										>
											<TbSortAscending size={14} />
										</Show>
									</Show>
								</HStack>
							</Menu.Item>
							<Menu.Item
								value="sort-type"
								onClick={() => props.onSortChange("type")}
							>
								<HStack justify="space-between" w="full">
									<Text>Type</Text>
									<Show when={props.sortField === "type"}>
										<Show
											when={props.sortOrder === "asc"}
											fallback={<TbSortDescending size={14} />}
										>
											<TbSortAscending size={14} />
										</Show>
									</Show>
								</HStack>
							</Menu.Item>
						</Menu.ItemGroup>
					</Menu.Content>
				</Menu.Positioner>
			</Menu.Root>
		</HStack>
	);
};
