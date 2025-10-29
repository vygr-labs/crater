import { Box, Flex, VStack } from "styled-system/jsx";
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
import { MEDIA_TAB_FOCUS_NAME, THEMES_TAB_FOCUS_NAME } from "~/utils/constants";
import {
	getBaseFocusStyles,
	getFocusableStyles,
	getToastType,
	toaster,
} from "~/utils";
import { css } from "styled-system/css";
import { createAsyncMemo } from "solidjs-use";
import MediaSelectionGroupDisplay from "./SelectionGroupDisplay";
import { MainActionBarMenu, MainDisplayMenuContent } from "./MainPanelMenus";
import { Kbd } from "../../ui/kbd";
import { VsListTree, VsSearchFuzzy } from "solid-icons/vs";
import Image from "../Image";
import type { MediaItem, MediaType } from "~/types";
import { changeLogoBg } from "~/utils/store-helpers";
import Video from "../Video";
import { Input } from "~/components/ui/input";

type MediaPanelGroupValues = "all" | "collections" | "favorites";
type MediaListData = {
	title: string;
	value: MediaPanelGroupValues;
};
type MediaSearchMode = "search" | "title";

type MediaControlsData = {
	searchMode: MediaSearchMode;
	group: MediaType;
	collection: number | null;
	query: string;
	contextMenuOpen: boolean;
};

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
	});
	const currentGroup = createMemo(
		() => appStore.displayGroups.media[mediaControls.group],
	);
	const currentCollection = createMemo(() =>
		currentGroup().subGroups?.find(
			(group) => group.id === mediaControls.collection,
		),
	);
	const applyQueryFilter = (media: MediaItem[]) =>
		media.filter((media) => media.title.includes(mediaControls.query));
	const filteredMedia = createMemo<MediaItem[]>(() => {
		const mediaCollection = currentCollection();
		console.log("Filter Status: ", mediaCollection, currentGroup());
		if (!currentGroup().subGroups && currentGroup().type) {
			console.log(currentGroup().type, allMedia());
			return applyQueryFilter(
				allMedia().filter((media) => media.type === currentGroup().type),
			);
		} else if (currentGroup().subGroups && mediaCollection) {
			return applyQueryFilter(
				allMedia().filter((media) => mediaCollection.items.includes(media.id)),
			);
		} else {
			console.log("applying only filter: ", allMedia());
			return applyQueryFilter(allMedia());
		}
	});

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
			estimateSize: () => 100,
			overscan: 5,
			lanes: NUM_OF_DISPLAY_LANES,
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
				const newCoreFocusId = Math.max(
					(fluidFocusId ?? 0) - NUM_OF_DISPLAY_LANES,
					0,
				);
				changeFluidFocus(newCoreFocusId);
			},
			ArrowDown: ({
				coreFocusId,
				fluidFocusId,
				changeFocus,
				changeCoreFocus,
				changeFluidFocus,
			}) => {
				const newCoreFocusId = Math.min(
					(fluidFocusId ?? 0) + NUM_OF_DISPLAY_LANES,
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
			onClick: ({ changeFluidFocus, focusId }) => {
				console.log("Clicked Here in Media	");
				if (typeof focusId === "number") {
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
		rowVirtualizer().scrollToIndex(fluidFocusId() ?? 0);
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
					/>
				}
				actionBarMenu={<MainActionBarMenu onAddMedia={handleAddMedia} />}
				ref={virtualizerParentRef}
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
									return (
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
												left: `${virtualItem.lane * laneItemSize}%`,
												width: laneItemSize + "%",
												...getBaseFocusStyles(THEMES_TAB_FOCUS_NAME),
												...getFocusableStyles(
													THEMES_TAB_FOCUS_NAME,
													virtualItem.index === fluidFocusId(),
													isCurrentPanel(),
													virtualItem.index === coreFocusId(),
												),
											}}
											data-panel={MEDIA_TAB_FOCUS_NAME}
											data-focusId={virtualItem.index}
										>
											{/* width: "full", height: "auto", aspectRatio: 16 / 9 */}
											<Switch>
												<Match when={media.type === "image"}>
													<Image
														class={css({})}
														src={media.path}
														alt={media.title}
													/>
												</Match>
												<Match when={media.type === "video"}>
													<Video
														id={
															MEDIA_TAB_FOCUS_NAME + "-vid-" + virtualItem.index
														}
														src={media.path}
														about={media.title}
														preload="metadata"
													/>
												</Match>
											</Switch>
											<Text
												mt={1.5}
												textAlign="center"
												maxW="full"
												textStyle="sm"
												truncate
											>
												{media.title}
											</Text>
										</Box>
										// <HStack
										//     pos="absolute"
										//     top={0}
										//     left={0}
										//     w="full"
										//     textAlign="left"
										//     userSelect="none"
										//     fontSize="14px"
										//     pl={2}
										//     cursor="pointer"
										//     py={1.5}
										//     css={{
										//         "& *": {
										//             pointerEvents: "none",
										//         },
										//         _hover: {
										//             bgColor: "purple.800/40"
										//         }
										//     }
										//     }
										//     style={{
										//         height: `${virtualItem.size}px`,
										//         transform: `translateY(${virtualItem.start}px)`,
										//         // "background-color": virtualItem.index === fluidFocusId() ? isCurrentPanel() ? token.var(`colors.${defaultPalette}.900`) : token.var(`colors.gray.800`) : virtualItem.index === coreFocusId() ? token.var(`colors.gray.800`) : "",
										//         // color: virtualItem.index === fluidFocusId() ? token.var(`colors.white`) : token.var(`colors.gray.100`),
										//         ...getBaseFocusStyles(THEMES_TAB_FOCUS_NAME),
										//         ...getFocusableStyles(THEMES_TAB_FOCUS_NAME, virtualItem.index === fluidFocusId(), isCurrentPanel(), virtualItem.index === coreFocusId())
										//     }}
										//     data-panel={THEMES_TAB_FOCUS_NAME}
										//     data-focusId={virtualItem.index}
										// >
										//     <Text>{media.title}</Text>
										//     <Text>{media.author}</Text>
										// </HStack>
									);
								}}
							</For>
						</Box>
					</Match>
					<Match when={!filteredMedia().length}>
						<VStack w="full" h="full" justifyContent="center">
							<Text textStyle="xl" color="gray.100">
								No Media in your Database
							</Text>
							<Text fontSize="sm" color="gray.400">
								Import one from your device by clicking the "+" button below
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
	searchMode: MediaSearchMode;
	updateSearchMode: () => void;
}

const MediaSearchInput = (props: SearchInputProps) => {
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
				firstBookMatch=""
				value={props.query}
				placeholder="Search media"
				onInput={props.onFilter}
				// ref={props.setSearchRef}
				// onFocus={handleSearchInputFocus}
				data-testid="media-search-input"
				aria-label="Search media"
			/>
		</InputGroup>
	);
};
