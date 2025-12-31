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
	TbUser,
	TbClock,
	TbSortAscending,
	TbSortDescending,
	TbFileText,
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

// Search modes:
// - "title": Search by song title only
// - "lyrics": Full-text search across title, author, and lyrics (FTS5 trigram)
// - "author": Search by author only
// - "recent": Sort by most recently modified
// - "oldest": Sort by oldest (creation date)
// - "newest": Sort by newest (creation date)
type SongSearchMode = "title" | "lyrics" | "author" | "recent" | "oldest" | "newest";

const SONG_SEARCH_MODES: SongSearchMode[] = ["title", "lyrics", "author", "recent", "oldest", "newest"];

const SONG_SEARCH_MODE_LABELS: Record<SongSearchMode, string> = {
	title: "Title",
	lyrics: "Lyrics",
	author: "Author",
	recent: "Recently Modified",
	oldest: "Oldest First",
	newest: "Newest First",
};

const SONG_SEARCH_MODE_PLACEHOLDERS: Record<SongSearchMode, string> = {
	title: "Search by title...",
	lyrics: "Search in lyrics...",
	author: "Search by author...",
	recent: "Filter recently modified...",
	oldest: "Filter oldest songs...",
	newest: "Filter newest songs...",
};

const SONG_SEARCH_MODE_ICONS: Record<SongSearchMode, typeof TbSearch> = {
	title: TbSearch,
	lyrics: TbFileText,
	author: TbUser,
	recent: TbClock,
	oldest: TbSortAscending,
	newest: TbSortDescending,
};

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
		const _ = appStore.songsUpdateCounter;
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
		const query = songControls.query.trim().toLowerCase();
		const searchMode = songControls.searchMode;
		
		// Get base song list (all songs or collection filtered)
		let baseSongs = allSongs();
		if (currentGroup().subGroups && songCollection) {
			baseSongs = baseSongs.filter((song) =>
				songCollection.items.includes(song.id),
			);
		}

		// Apply search mode specific filtering/sorting
		let result: SongData[] = baseSongs;

		switch (searchMode) {
			case "title":
				// Simple title filter (case-insensitive)
				if (query) {
					result = baseSongs.filter((song) =>
						song.title.toLowerCase().includes(query)
					);
				}
				break;

			case "lyrics":
				// Use FTS5 trigram search for lyrics/full-text search
				if (query) {
					const ftsResults = searchedSongs();
					if (ftsResults && ftsResults.length > 0) {
						// If in a collection, filter FTS results to only include collection songs
						if (currentGroup().subGroups && songCollection) {
							const collectionIds = new Set(songCollection.items);
							result = ftsResults.filter((song: SongData) =>
								collectionIds.has(song.id),
							);
						} else {
							result = ftsResults;
						}
					} else {
						result = [];
					}
				}
				break;

			case "author":
				// Filter by author name
				if (query) {
					result = baseSongs.filter((song) =>
						song.author?.toLowerCase().includes(query)
					);
				}
				break;

			case "recent":
				// Sort by most recently modified (updated_at)
				result = [...baseSongs].sort((a, b) => {
					const dateA = new Date(a.updated_at).getTime();
					const dateB = new Date(b.updated_at).getTime();
					return dateB - dateA; // Most recent first
				});
				// Optionally filter by query if present
				if (query) {
					result = result.filter((song) =>
						song.title.toLowerCase().includes(query)
					);
				}
				break;

			case "oldest":
				// Sort by creation date (oldest first)
				result = [...baseSongs].sort((a, b) => {
					const dateA = new Date(a.created_at).getTime();
					const dateB = new Date(b.created_at).getTime();
					return dateA - dateB; // Oldest first
				});
				// Optionally filter by query if present
				if (query) {
					result = result.filter((song) =>
						song.title.toLowerCase().includes(query)
					);
				}
				break;

			case "newest":
				// Sort by creation date (newest first)
				result = [...baseSongs].sort((a, b) => {
					const dateA = new Date(a.created_at).getTime();
					const dateB = new Date(b.created_at).getTime();
					return dateB - dateA; // Newest first
				});
				// Optionally filter by query if present
				if (query) {
					result = result.filter((song) =>
						song.title.toLowerCase().includes(query)
					);
				}
				break;
		}

		return result;
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

		window.electronAPI.fetchSongLyrics(metadata.id).then(async (songData) => {
			// Check if song has a custom theme assigned
			let themeOverride;
			if (metadata.theme_id) {
				themeOverride = await window.electronAPI.fetchTheme(metadata.theme_id);
			}

			setAppStore(isLive ? "liveItem" : "previewItem", {
				metadata,
				type: "song",
				data: songData,
				index: 0,
				themeOverride: themeOverride ?? undefined,
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

	let searchInputRef!: HTMLInputElement;
	createEffect(() => {
		if (isCurrentPanel()) {
			searchInputRef?.focus();
		}
	});

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
	// Don't sync in lyrics search mode as results are filtered by search text
	createEffect(
		on(
			() => appStore.syncFromSchedule,
			(syncData) => {
				if (!syncData || syncData.type !== "song") return;
				// Don't sync in lyrics search mode as FTS results won't contain the song
				if (songControls.searchMode === "lyrics" && songControls.query.trim()) return;
				
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

	const updateSearchMode = (newMode?: SongSearchMode) => {
		if (newMode) {
			setSongControls("searchMode", newMode);
		} else {
			// Cycle through modes: title -> lyrics -> author -> recent -> oldest -> newest -> title
			const modes: SongSearchMode[] = ["title", "lyrics", "author", "recent", "oldest", "newest"];
			setSongControls("searchMode", (current) => {
				const currentIndex = modes.indexOf(current);
				return modes[(currentIndex + 1) % modes.length];
			});
		}
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
						ref={searchInputRef}
						searchMode={songControls.searchMode}
						updateSearchMode={updateSearchMode}
						query={songControls.query}
						onFilter={handleFilter}
						onClear={() => setSongControls("query", "")}
						onFocus={() => changeFocusPanel(SONGS_TAB_FOCUS_NAME)}
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
									// Check if this song is currently displayed in live panel
									const isLive = () => 
										appStore.liveItem?.type === "song" && 
										(appStore.liveItem?.metadata as SongData)?.id === song.id;
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
												"background-color": isLive() 
													? token.var(`colors.${defaultPalette}.900`)
													: isSelected() && isCurrentPanel()
														? token.var("colors.gray.800")
														: undefined,
											}}
											data-panel={SONGS_TAB_FOCUS_NAME}
											data-focusId={virtualItem.index}
										>
											{/* Song icon */}
											<Box
												color={
													isLive()
														? `${defaultPalette}.300`
														: isSelected() && isCurrentPanel()
															? "gray.300"
															: `${neutralPalette}.500`
												}
												flexShrink={0}
											>
												<TbMusic size={16} />
											</Box>
											{/* Song info */}
											<VStack gap={0} alignItems="flex-start" flex={1} minW={0}>
												<Text
													fontWeight={isSelected() || isLive() ? "medium" : "normal"}
													truncate
													w="full"
													style={{
														color: isLive()
															? token.var(`colors.${defaultPalette}.100`)
															: isSelected() && isCurrentPanel()
																? token.var("colors.gray.200")
																: token.var(`colors.${neutralPalette}.100`)
													}}
												>
													{song.title}
												</Text>
												<Show when={song.author}>
													<Text
														fontSize="12px"
														color={
															isLive()
																? `${defaultPalette}.200`
																: isSelected() && isCurrentPanel()
																	? "gray.400"
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
	onFocus: () => void;
	searchMode: SongSearchMode;
	updateSearchMode: (mode?: SongSearchMode) => void;
	ref: HTMLInputElement;
}

const SongSearchInput = (props: SearchInputProps) => {
	const SearchIcon = () => {
		const Icon = SONG_SEARCH_MODE_ICONS[props.searchMode];
		return <Icon size={14} />;
	};

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
				<Menu.Root
					positioning={{ placement: "bottom-start" }}
					onSelect={(details) => {
						props.updateSearchMode(details.value as SongSearchMode);
					}}
				>
					<Menu.Trigger asChild={(triggerProps) => (
						<IconButton
							{...triggerProps()}
							size="xs"
							variant="ghost"
							cursor="pointer"
							color="gray.400"
							_hover={{ color: "gray.200", bg: "gray.800" }}
							aria-label={`Search mode: ${SONG_SEARCH_MODE_LABELS[props.searchMode]}`}
							title={`Search mode: ${SONG_SEARCH_MODE_LABELS[props.searchMode]}`}
						>
							<HStack gap={0.5}>
								<SearchIcon />
								<TbChevronDown size={10} />
							</HStack>
						</IconButton>
					)} />
					<Portal>
						<Menu.Positioner>
							<Menu.Content
								minW="180px"
								bg="gray.900"
								borderColor="gray.700"
								boxShadow="lg"
							>
								<Menu.ItemGroup>
									<Menu.ItemGroupLabel
										fontSize="11px"
										color="gray.500"
										fontWeight="medium"
										px={2}
										py={1}
									>
										Search Mode
									</Menu.ItemGroupLabel>
									<For each={SONG_SEARCH_MODES}>
										{(mode) => {
											const ModeIcon = SONG_SEARCH_MODE_ICONS[mode];
											return (
												<Menu.Item
													value={mode}
													px={2}
													py={1.5}
													fontSize="13px"
													cursor="pointer"
													_hover={{ bg: "gray.800" }}
													color={props.searchMode === mode ? `${defaultPalette}.400` : "gray.200"}
													fontWeight={props.searchMode === mode ? "medium" : "normal"}
												>
													<HStack gap={2}>
														<ModeIcon size={14} />
														<Text>{SONG_SEARCH_MODE_LABELS[mode]}</Text>
													</HStack>
												</Menu.Item>
											);
										}}
									</For>
								</Menu.ItemGroup>
							</Menu.Content>
						</Menu.Positioner>
					</Portal>
				</Menu.Root>
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
				ref={props.ref}
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
				placeholder={SONG_SEARCH_MODE_PLACEHOLDERS[props.searchMode]}
				onInput={props.onFilter}
				onFocus={props.onFocus}
				data-testid="song-search-input"
				aria-label="Search songs"
			/>
		</InputGroup>
	);
};
