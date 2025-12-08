import { Box, Flex, HStack, VStack } from "styled-system/jsx";
import SelectionGroups from "../SelectionGroups";
import { createStore, produce } from "solid-js/store";
import { Menu } from "../../ui/menu";
import { For, Portal } from "solid-js/web";
import {
	TbChevronDown,
	TbChevronRight,
	TbMusic,
	TbMusicOff,
	TbPlus,
	TbSearch,
	TbSettings,
	TbTree,
	TbX,
} from "solid-icons/tb";
import { IconButton } from "../../ui/icon-button";
import { InputGroup } from "../../ui/input-group";
import { ImPlus } from "solid-icons/im";
import { FiSettings } from "solid-icons/fi";
import ControlTabDisplay from "../ControlTabDisplay";
import type { SongData } from "~/types/context";
import {
	createEffect,
	createMemo,
	createRenderEffect,
	Match,
	on,
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
	neutralPalette,
	SONGS_TAB_FOCUS_NAME,
} from "~/utils/constants";
import { focusStyles } from "~/utils/atomic-recipes";
import { getBaseFocusStyles, getFocusableStyles } from "~/utils";
import { css } from "styled-system/css";
import { token } from "styled-system/tokens";
import { createAsyncMemo } from "solidjs-use";
import type { PanelCollection } from "~/types/app-context";
import SongSelectionGroupDisplay from "./SelectionGroupDisplay";
import { MainActionBarMenu, MainDisplayMenuContent } from "./MainPanelMenus";
import { Kbd } from "../../ui/kbd";
import { VsListTree, VsSearchFuzzy } from "solid-icons/vs";
import { updateSongEdit } from "~/utils/store-helpers";
import { Input } from "~/components/ui/input";

type SongPanelGroupValues = "all" | "collections" | "favorites";
type SongListData = {
	title: string;
	value: SongPanelGroupValues;
};
type SongSearchMode = "search" | "title";

type SongControlsData = {
	searchMode: SongSearchMode;
	group: string;
	collection: number | null;
	query: string;
	contextMenuOpen: boolean;
};

export default function SongSelection() {
	const { appStore, setAppStore } = useAppContext();
	const allSongs = createAsyncMemo(async () => {
		const updated = appStore.songsUpdateCounter;
		const songs = await window.electronAPI.fetchAllSongs();
		return songs;
	}, []);

	// Search songs using backend FTS5 trigram search
	const searchedSongs = createAsyncMemo(async () => {
		if (!songControls.query.trim()) return null;
		return await window.electronAPI.searchSongs(songControls.query);
	}, null);

	const [songControls, setSongControls] = createStore<SongControlsData>({
		group: "all",
		collection: null,
		searchMode: "title",
		query: "",
		contextMenuOpen: false,
	});
	const currentGroup = createMemo(
		() => appStore.displayGroups.song[songControls.group],
	);
	const currentCollection = createMemo(() =>
		currentGroup().subGroups?.find(
			(group) => group.id === songControls.collection,
		),
	);

	const filteredSongs = createMemo<SongData[]>(() => {
		const songCollection = currentCollection();
		const query = songControls.query.trim();

		// If there's a search query, use FTS5 results
		if (query) {
			const ftsResults = searchedSongs();
			if (ftsResults && ftsResults.length > 0) {
				// If in a collection, filter FTS results to only include collection songs
				if (currentGroup().subGroups && songCollection) {
					const collectionIds = new Set(songCollection.items);
					return ftsResults.filter((song: SongData) =>
						collectionIds.has(song.id),
					);
				}
				return ftsResults;
			}
			return []; // No results found
		}

		// No query - return all songs (or filtered by collection)
		if (currentGroup().subGroups && songCollection) {
			return allSongs().filter((song) =>
				songCollection.items.includes(song.id),
			);
		}
		return allSongs();
	});
	const pushToLive = (itemId?: number | null, isLive?: boolean) => {
		const focusId = itemId;
		if (
			typeof focusId !== "number" ||
			!filteredSongs().length ||
			!isCurrentPanel()
		)
			return;

		const metadata = filteredSongs()[focusId];
		if (!metadata) return;

		window.electronAPI.fetchSongLyrics(metadata.id).then((songData) => {
			setAppStore(isLive ? "liveItem" : "previewItem", {
				metadata,
				type: "song",
				data: songData,
				index: 0,
			});
		});
	};

	let virtualizerParentRef!: HTMLDivElement;
	const rowVirtualizer = createMemo(() =>
		createVirtualizer({
			count: filteredSongs().length,
			getScrollElement: () => virtualizerParentRef,
			estimateSize: () => 36,
			overscan: 5,
		}),
	);

	const { subscribeEvent, changeFocusPanel, currentPanel } = useFocusContext();
	const { name, coreFocusId, fluidFocusId, changeFluidFocus } = subscribeEvent({
		name: SONGS_TAB_FOCUS_NAME,
		defaultCoreFocus: 0,
		defaultFluidFocus: 0,
		handlers: {
			ArrowDown: ({
				coreFocusId,
				fluidFocusId,
				changeFocus,
				changeCoreFocus,
				changeFluidFocus,
			}) => {
				const newCoreFocusId = Math.min(
					(fluidFocusId ?? 0) + 1,
					filteredSongs().length,
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
				const newCoreFocusId = Math.max((fluidFocusId ?? 0) - 1, 0);
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
			onClick: ({ changeFluidFocus, focusId }) => {
				if (typeof focusId === "number") {
					changeFluidFocus(focusId);
					setSongControls("contextMenuOpen", false);
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
					setSongControls("contextMenuOpen", true);
				}
			},
		},
	});
	const isCurrentPanel = createMemo(() => currentPanel() === name);

	createEffect(() => {
		if (!isCurrentPanel()) {
			console.log("Closing context menu");
			setSongControls("contextMenuOpen", false);
		}
	});

	function handleGroupAccordionChange(
		open: (SongPanelGroupValues | string)[],
		e?: MouseEvent,
	) {
		if (!open.length) return;
		setSongControls(
			produce((store) => {
				const subSelection = open.find((item) => item.includes("-"));

				if (subSelection) {
					const [group, collection] = subSelection.split("-");
					store.group = group;
					store.collection = parseInt(collection);
				} else {
					store.group = open[0];
					store.collection = null;
				}
			}),
		);
	}

	// scroll to current fluid item
	createEffect(() => {
		if (isCurrentPanel() && filteredSongs().length) {
			rowVirtualizer().scrollToIndex(fluidFocusId() ?? 0);
		}
	});

	// close contextMenu when we scroll
	createEffect(() => {
		const fluidFocus = fluidFocusId();
		if (songControls.contextMenuOpen && fluidFocus) {
			if (
				!rowVirtualizer()
					.getVirtualItems()
					.map((item) => item.index)
					.includes(fluidFocus)
			) {
				setSongControls("contextMenuOpen", false);
			}
		}
	});

	// send current fluid item to preview-menu
	createEffect(() => {
		console.log("Fluid Focus Changed: ", fluidFocusId());
		pushToLive(fluidFocusId(), false);
	});

	// Sync from schedule item click - scroll to the song if it exists
	// Only applies when not in search mode (i.e., in title/browse mode)
	createEffect(
		on(
			() => appStore.syncFromSchedule,
			(syncData) => {
				if (!syncData || syncData.type !== "song") return;
				if (songControls.searchMode !== "title") return; // Don't sync in search mode
				
				const metadata = syncData.metadata;
				if (!metadata?.id) return;
				
				const songId = typeof metadata.id === "string" ? parseInt(metadata.id) : metadata.id;
				const songs = filteredSongs();
				
				// Find the song index by its id
				const matchIndex = songs.findIndex((song) => song.id === songId);
				if (matchIndex > -1) {
					changeFluidFocus(matchIndex);
				}
				
				// Clear the sync trigger
				setAppStore("syncFromSchedule", null);
			},
			{ defer: true }
		)
	);

	const handleSongEdit = () => {
		const toEdit = fluidFocusId();
		if (typeof toEdit === "number") {
			setAppStore("songEdit", { open: true, song: filteredSongs()[toEdit] });
		}
	};

	const handleSongDelete = () => {
		const toDelete = fluidFocusId();
		if (typeof toDelete !== "number") return;
		console.log("Deleting Song: ", toDelete, filteredSongs()[toDelete]);

		const songToDelete = filteredSongs()[toDelete];
		if (!songToDelete) return;

		window.electronAPI.deleteSong(songToDelete.id).then(() => {
			setAppStore("songsUpdateCounter", (former) => ++former);
			setSongControls("contextMenuOpen", false);
			if (toDelete === filteredSongs().length - 1) {
				changeFluidFocus(toDelete - 1);
			}
		});
	};

	const handleFilter = (e: InputEvent) => {
		setSongControls("query", (e.target as HTMLInputElement).value);
	};

	// Reset focus to first item when search query changes
	createEffect(
		on(
			() => songControls.query,
			() => {
				// Reset to first result when query changes
				if (filteredSongs().length > 0) {
					changeFluidFocus(0);
				} else {
					changeFluidFocus(null)
				}
			},
		),
	);

	const updateSearchMode = () => {
		setSongControls("searchMode", (former) =>
			former === "search" ? "title" : "search",
		);
	};

	const songCountDisplay = (
		// () => (
		<Text fontSize="11px" color="gray.500">
			{filteredSongs().length} {filteredSongs().length === 1 ? "song" : "songs"}
			<Show when={songControls.query}>
				{` matching "${songControls.query}"`}
			</Show>
		</Text>
	);
	// );

	return (
		<Flex h="full" pos="relative" data-panel={SONGS_TAB_FOCUS_NAME}>
			<SelectionGroups
				searchInput={
					<SongSearchInput
						searchMode={songControls.searchMode}
						updateSearchMode={updateSearchMode}
						query={songControls.query}
						onFilter={handleFilter}
						onClear={() => setSongControls("query", "")}
					/>
				}
				currentGroup={[songControls.group]}
				groups={appStore.displayGroups.song}
				handleAccordionChange={handleGroupAccordionChange}
				actionMenus={<SongSelectionGroupDisplay />}
			/>
			<ControlTabDisplay
				open={songControls.contextMenuOpen}
				setOpen={(v) => setSongControls("contextMenuOpen", v)}
				contextMenuContent={
					<MainDisplayMenuContent
						onSongEdit={handleSongEdit}
						onDeleteSong={handleSongDelete}
					/>
				}
				actionBarMenu={
					<MainActionBarMenu
						onAddSong={() =>
							updateSongEdit(setAppStore, { open: true, song: null })
						}
						onDeleteSong={handleSongDelete}
					/>
				}
				centerContent={songCountDisplay}
				ref={virtualizerParentRef}
			>
				<Switch>
					<Match when={filteredSongs().length}>
						<Box
							style={{
								height: `${rowVirtualizer().getTotalSize()}px`,
								width: "100%",
								position: "relative",
							}}
						>
							<For each={rowVirtualizer().getVirtualItems()}>
								{(virtualItem) => {
									const song = filteredSongs()[virtualItem.index];
									const isSelected = () => virtualItem.index === fluidFocusId();
									const isCurrent = () => virtualItem.index === coreFocusId();
									return (
										<HStack
											pos="absolute"
											top={0}
											left={0}
											w="full"
											textAlign="left"
											userSelect="none"
											fontSize="14px"
											px={3}
											cursor="pointer"
											py={2}
											gap={3}
											css={{
												"& *": {
													pointerEvents: "none",
												},
												_hover: {
													bgColor: `${defaultPalette}.900/30`,
												},
											}}
											style={{
												height: `${virtualItem.size}px`,
												transform: `translateY(${virtualItem.start}px)`,
												...getBaseFocusStyles(SONGS_TAB_FOCUS_NAME),
												...getFocusableStyles(
													SONGS_TAB_FOCUS_NAME,
													isSelected(),
													isCurrentPanel(),
													isCurrent(),
												),
											}}
											data-panel={SONGS_TAB_FOCUS_NAME}
											data-focusId={virtualItem.index}
										>
											{/* Song icon */}
											<Box
												color={
													isSelected() && isCurrentPanel()
														? `${defaultPalette}.300`
														: `${neutralPalette}.500`
												}
												flexShrink={0}
											>
												<TbMusic size={16} />
											</Box>
											{/* Song info */}
											<VStack gap={0} alignItems="flex-start" flex={1} minW={0}>
												<Text
													fontWeight={isSelected() ? "medium" : "normal"}
													color={
														isSelected() && isCurrentPanel()
															? "white"
															: `${neutralPalette}.100`
													}
													truncate
													w="full"
												>
													{song.title}
												</Text>
												<Show when={song.author}>
													<Text
														fontSize="12px"
														color={
															isSelected() && isCurrentPanel()
																? `${defaultPalette}.200`
																: `${neutralPalette}.500`
														}
														truncate
														w="full"
													>
														{song.author}
													</Text>
												</Show>
											</VStack>
										</HStack>
									);
								}}
							</For>
						</Box>
					</Match>
					<Match when={!allSongs().length}>
						<VStack gap={3} w="full" h="full" justifyContent="center" px={6}>
							<Box color="gray.600">
								<TbMusicOff size={48} />
							</Box>
							<VStack gap={1}>
								<Text textStyle="lg" fontWeight="medium" color="gray.200">
									No Songs Yet
								</Text>
								<Text fontSize="13px" color="gray.500" textAlign="center">
									Import songs from a file or create them manually to get
									started
								</Text>
							</VStack>
							<HStack
								mt={2}
								px={4}
								py={2}
								bg={`${defaultPalette}.900/50`}
								rounded="md"
								cursor="pointer"
								_hover={{ bg: `${defaultPalette}.800/50` }}
								onClick={() =>
									updateSongEdit(setAppStore, { open: true, song: null })
								}
							>
								<TbPlus size={16} />
								<Text fontSize="13px" fontWeight="medium">
									Add Your First Song
								</Text>
							</HStack>
						</VStack>
					</Match>
					<Match
						when={allSongs() && songControls.query && !filteredSongs().length}
					>
						<VStack gap={3} w="full" h="full" justifyContent="center" px={6}>
							<Box color="gray.600">
								<TbSearch size={40} />
							</Box>
							<VStack gap={1}>
								<Text textStyle="md" fontWeight="medium" color="gray.200">
									No songs found
								</Text>
								<Text fontSize="13px" color="gray.500" textAlign="center">
									No songs match "{songControls.query}"
								</Text>
							</VStack>
							<HStack
								mt={1}
								px={3}
								py={1.5}
								bg="gray.800"
								rounded="md"
								cursor="pointer"
								_hover={{ bg: "gray.700" }}
								onClick={() => setSongControls("query", "")}
							>
								<TbX size={14} />
								<Text fontSize="12px">Clear search</Text>
							</HStack>
						</VStack>
					</Match>
				</Switch>
			</ControlTabDisplay>
		</Flex>
	);
}

interface SearchInputProps {
	query: string;
	onFilter: JSX.EventHandlerUnion<HTMLInputElement, InputEvent>;
	onClear: () => void;
	searchMode: SongSearchMode;
	updateSearchMode: () => void;
}

const SongSearchInput = (props: SearchInputProps) => {
	return (
		<InputGroup
			w="full"
			pr={1}
			bg="gray.900/50"
			borderBottom="1px solid"
			borderBottomColor="gray.800"
			_focusWithin={{
				borderColor: `${defaultPalette}.700`,
				bg: `${neutralPalette}.900`,
			}}
			transition="all 0.15s ease"
			startElement={() => (
				<IconButton
					size="xs"
					variant="ghost"
					cursor="pointer"
					onClick={props.updateSearchMode}
					color="gray.400"
					_hover={{ color: "gray.200", bg: "gray.800" }}
					aria-label={
						props.searchMode === "title"
							? "Switch to fuzzy search mode"
							: "Switch to title search mode"
					}
					title={props.searchMode === "title" ? "Title search" : "Fuzzy search"}
				>
					<Show
						when={props.searchMode === "title"}
						fallback={<VsSearchFuzzy size={14} />}
					>
						<TbSearch size={14} />
					</Show>
				</IconButton>
			)}
			startElementProps={{ padding: 0, pointerEvents: "auto", pl: 1 }}
			endElement={() => (
				<HStack gap={1}>
					<Show when={props.query}>
						<IconButton
							size="xs"
							variant="ghost"
							cursor="pointer"
							onClick={props.onClear}
							color="gray.500"
							_hover={{ color: "gray.200", bg: "gray.800" }}
							aria-label="Clear search"
						>
							<TbX size={14} />
						</IconButton>
					</Show>
					<Kbd
						variant="outline"
						size="sm"
						color="gray.500"
						borderColor="gray.700"
					>
						⌘A
					</Kbd>
				</HStack>
			)}
			endElementProps={{ pr: 1 }}
		>
			<Input
				pos="relative"
				fontSize={13}
				zIndex={10}
				variant="outline"
				rounded="none"
				border="unset"
				px="2"
				h="9"
				outline="none"
				w="full"
				color="gray.100"
				_placeholder={{ color: `${neutralPalette}.500` }}
				_selection={{
					bgColor: `${defaultPalette}.600`,
				}}
				value={props.query}
				placeholder="Search songs..."
				onInput={props.onFilter}
				data-testid="song-search-input"
				aria-label="Search songs"
			/>
		</InputGroup>
	);
};
