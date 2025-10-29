import { Box, Flex, HStack, VStack } from "styled-system/jsx";
import SelectionGroups from "../SelectionGroups";
import { createStore, produce } from "solid-js/store";
import { Menu } from "../../ui/menu";
import { For, Portal } from "solid-js/web";
import {
	TbChevronDown,
	TbChevronRight,
	TbPlus,
	TbSettings,
	TbTree,
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
import { defaultPalette, SONGS_TAB_FOCUS_NAME } from "~/utils/constants";
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
		return await window.electronAPI.fetchAllSongs();
	}, []);
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
	const applyQueryFilter = (songs: SongData[]) =>
		songs.filter((song) => song.title.includes(songControls.query));
	const filteredSongs = createMemo<SongData[]>(() => {
		const songCollection = currentCollection();
		if (currentGroup().subGroups && songCollection) {
			return applyQueryFilter(
				allSongs().filter((song) => songCollection.items.includes(song.id)),
			);
		} else {
			return applyQueryFilter(allSongs());
		}
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
		rowVirtualizer().scrollToIndex(fluidFocusId() ?? 0);
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

	const updateSearchMode = () => {
		setSongControls("searchMode", (former) =>
			former === "search" ? "title" : "search",
		);
	};

	return (
		<Flex h="full" pos="relative" data-panel={SONGS_TAB_FOCUS_NAME}>
			<SelectionGroups
				searchInput={
					<SongSearchInput
						searchMode={songControls.searchMode}
						updateSearchMode={updateSearchMode}
						query={songControls.query}
						onFilter={handleFilter}
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
									return (
										<HStack
											pos="absolute"
											top={0}
											left={0}
											w="full"
											textAlign="left"
											userSelect="none"
											fontSize="14px"
											pl={2}
											cursor="pointer"
											py={1.5}
											css={{
												"& *": {
													pointerEvents: "none",
												},
												_hover: {
													bgColor: "purple.800/40",
												},
											}}
											style={{
												height: `${virtualItem.size}px`,
												transform: `translateY(${virtualItem.start}px)`,
												// "background-color": virtualItem.index === fluidFocusId() ? isCurrentPanel() ? token.var(`colors.${defaultPalette}.900`) : token.var(`colors.gray.800`) : virtualItem.index === coreFocusId() ? token.var(`colors.gray.800`) : "",
												// color: virtualItem.index === fluidFocusId() ? token.var(`colors.white`) : token.var(`colors.gray.100`),
												...getBaseFocusStyles(SONGS_TAB_FOCUS_NAME),
												...getFocusableStyles(
													SONGS_TAB_FOCUS_NAME,
													virtualItem.index === fluidFocusId(),
													isCurrentPanel(),
													virtualItem.index === coreFocusId(),
												),
											}}
											data-panel={SONGS_TAB_FOCUS_NAME}
											data-focusId={virtualItem.index}
										>
											<Text>{song.title}</Text>
											<Text>{song.author}</Text>
											<Text>{song.copyright}</Text>
										</HStack>
									);
								}}
							</For>
						</Box>
					</Match>
					<Match when={!filteredSongs().length}>
						<VStack gap={1} w="full" h="full" justifyContent="center">
							<Text textStyle="xl" color="gray.100">
								No Songs in your Database
							</Text>
							<Text fontSize="sm" color="gray.400">
								You can import or manually add songs yourself
							</Text>
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
	searchMode: SongSearchMode;
	updateSearchMode: () => void;
}

const SongSearchInput = (props: SearchInputProps) => {
	return (
		<InputGroup
			w="full"
			pr={2}
			startElement={() => (
				<IconButton
					size="sm"
					variant="plain"
					cursor="pointer"
					onClick={props.updateSearchMode}
					aria-label={
						props.searchMode === "title"
							? "Switch to search mode"
							: "Switch to title mode"
					}
				>
					<Show
						when={props.searchMode === "title"}
						fallback={<VsSearchFuzzy />}
					>
						<VsListTree />
					</Show>
				</IconButton>
			)}
			startElementProps={{ padding: 0, pointerEvents: "auto" }}
			endElement={() => <Kbd variant="plain">⌘A</Kbd>}
		>
			<Input
				pos="relative"
				fontSize={14}
				zIndex={10}
				variant="outline"
				// borderWidth={2}
				// borderColor="border.emphasized"
				rounded="none"
				border="unset"
				px="2"
				h="9"
				outline="none"
				w="full"
				_selection={{
					bgColor: "blue.600",
				}}
				value={props.query}
				placeholder="Search songs"
				onInput={props.onFilter}
				data-testid="song-search-input"
				aria-label="Search songs"
			/>
		</InputGroup>
	);
};
