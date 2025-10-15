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
import {
	createEffect,
	createMemo,
	createRenderEffect,
	on,
	Show,
	type JSX,
} from "solid-js";
import { Text } from "../../ui/text";
import { createVirtualizer } from "@tanstack/solid-virtual";
import { useAppContext } from "~/layouts/AppContext";
import { useFocusContext } from "~/layouts/FocusContext";
import { defaultPalette, THEMES_TAB_FOCUS_NAME } from "~/utils/constants";
import { focusStyles } from "~/utils/atomic-recipes";
import { getBaseFocusStyles, getFocusableStyles } from "~/utils";
import { css } from "styled-system/css";
import { token } from "styled-system/tokens";
import { createAsyncMemo } from "solidjs-use";
import type { PanelCollection } from "~/types/app-context";
import ThemeSelectionGroupDisplay from "./SelectionGroupDisplay";
import { MainActionBarMenu, MainDisplayMenuContent } from "./MainPanelMenus";
import SearchInput from "../../custom/search-input";
import { Kbd } from "../../ui/kbd";
import { VsListTree, VsSearchFuzzy } from "solid-icons/vs";
import type { ThemeMetadata, ThemeType } from "~/types";

type ThemePanelGroupValues = "all" | "collections" | "favorites";
type ThemeListData = {
	title: string;
	value: ThemePanelGroupValues;
};
type ThemeSearchMode = "search" | "title";

type ThemeControlsData = {
	searchMode: ThemeSearchMode;
	group: string;
	collection: number | null;
	query: string;
	contextMenuOpen: boolean;
};

const NUM_OF_DISPLAY_LANES = 5;

export default function ThemeSelection() {
	const { appStore, setAppStore } = useAppContext();
	const allThemes = createAsyncMemo(async () => {
		// const updated = appStore.themesUpdateCounter
		console.log("ALL THEMES: ", await window.electronAPI.fetchAllThemes());
		return await window.electronAPI.fetchAllThemes();
	}, []);
	const [themeControls, setThemeControls] = createStore<ThemeControlsData>({
		group: "song",
		collection: null,
		searchMode: "title",
		query: "",
		contextMenuOpen: false,
	});
	const currentGroup = createMemo(
		() => appStore.displayGroups.theme[themeControls.group],
	);
	const currentCollection = createMemo(() =>
		currentGroup().subGroups?.find(
			(group) => group.id === themeControls.collection,
		),
	);
	const applyQueryFilter = (themes: ThemeMetadata[]) =>
		themes.filter((theme) => theme.title.includes(themeControls.query));
	const filteredThemes = createMemo<ThemeMetadata[]>(() => {
		const themeCollection = currentCollection();
		console.log("Filter Status: ", themeCollection, currentGroup());
		if (currentGroup().subGroups && themeCollection) {
			return applyQueryFilter(
				allThemes().filter((theme) => themeCollection.items.includes(theme.id)),
			);
		} else {
			console.log("applying only filter: ", allThemes());
			return applyQueryFilter(allThemes());
		}
	});

	let virtualizerParentRef!: HTMLDivElement;
	const rowVirtualizer = createMemo(() =>
		createVirtualizer({
			count: filteredThemes().length,
			getScrollElement: () => virtualizerParentRef,
			estimateSize: () => 100,
			overscan: 5,
			lanes: NUM_OF_DISPLAY_LANES,
		}),
	);

	const { subscribeEvent, changeFocusPanel, currentPanel } = useFocusContext();
	const { name, coreFocusId, fluidFocusId } = subscribeEvent({
		name: THEMES_TAB_FOCUS_NAME,
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
				const newCoreFocusId = Math.min(
					(fluidFocusId ?? 0) + 1,
					filteredThemes().length - 1,
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
					filteredThemes().length - 1,
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
			},
		},
		clickHandlers: {
			onClick: ({ changeFluidFocus, focusId }) => {
				if (typeof focusId === "number") {
					changeFluidFocus(focusId);
					setThemeControls("contextMenuOpen", false);
				}
			},
			onDblClick: ({ changeFocus, focusId }) => {
				if (typeof focusId === "number") {
					changeFocus(focusId);
				}
			},
			onRightClick: ({ changeFluidFocus, focusId }) => {
				if (typeof focusId === "number") {
					changeFluidFocus(focusId);
					setThemeControls("contextMenuOpen", true);
				}
			},
		},
	});
	const isCurrentPanel = createMemo(() => currentPanel() === name);

	function handleGroupAccordionChange(
		open: (ThemePanelGroupValues | string)[],
		e?: MouseEvent,
	) {
		if (!open.length) return;
		setThemeControls(
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
		if (themeControls.contextMenuOpen && fluidFocus) {
			if (
				!rowVirtualizer()
					.getVirtualItems()
					.map((item) => item.index)
					.includes(fluidFocus)
			) {
				setThemeControls("contextMenuOpen", false);
			}
		}
	});

	// send current fluid item to preview-menu
	// createEffect(() => {
	//     pushToLive(fluidFocusId(), false)
	// })

	const handleThemeEdit = () => {
		const toEdit = fluidFocusId();
		// if (toEdit) {
		//     setAppStore("themeEditor", { open: true, type: type, theme: filteredThemes()[toEdit] });
		// }
	};

	const handleFilter = (e: InputEvent) => {
		setThemeControls("query", (e.target as HTMLInputElement).value);
	};

	const updateSearchMode = () => {
		setThemeControls("searchMode", (former) =>
			former === "search" ? "title" : "search",
		);
	};

	const handleCreateTheme = () => {
		setAppStore("themeEditor", { open: true, type: "song", initial: null });
	};

	return (
		<Flex h="full" pos="relative">
			<SelectionGroups
				searchInput={
					<ThemeSearchInput
						searchMode={themeControls.searchMode}
						updateSearchMode={updateSearchMode}
						query={themeControls.query}
						onFilter={handleFilter}
					/>
				}
				currentGroup={[themeControls.group]}
				groups={appStore.displayGroups.theme}
				handleAccordionChange={handleGroupAccordionChange}
				actionMenus={<ThemeSelectionGroupDisplay />}
			/>
			<ControlTabDisplay
				open={themeControls.contextMenuOpen}
				contextMenuContent={
					<MainDisplayMenuContent onThemeEdit={handleThemeEdit} />
				}
				actionBarMenu={<MainActionBarMenu onCreateTheme={handleCreateTheme} />}
				ref={virtualizerParentRef}
			>
				<Box
					style={{
						height: `${rowVirtualizer().getTotalSize()}px`,
						width: "100%",
						position: "relative",
					}}
				>
					<For each={rowVirtualizer().getVirtualItems()}>
						{(virtualItem) => {
							const theme = filteredThemes()[virtualItem.index];
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
										left: `${virtualItem.lane * 20}%`,
										width: "20%",
										...getBaseFocusStyles(THEMES_TAB_FOCUS_NAME),
										...getFocusableStyles(
											THEMES_TAB_FOCUS_NAME,
											virtualItem.index === fluidFocusId(),
											isCurrentPanel(),
											virtualItem.index === coreFocusId(),
										),
									}}
									data-panel={THEMES_TAB_FOCUS_NAME}
									data-focusId={virtualItem.index}
								>
									{/* width: "full", height: "auto", aspectRatio: 16 / 9 */}
									<img
										class={css({})}
										src={"file://" + theme.preview_path}
										alt={theme.title}
									/>
									<Text
										mt={1.5}
										textAlign="center"
										maxW="full"
										textStyle="sm"
										truncate
									>
										{theme.title}
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
								//     <Text>{theme.title}</Text>
								//     <Text>{theme.author}</Text>
								// </HStack>
							);
						}}
					</For>
				</Box>
			</ControlTabDisplay>
		</Flex>
	);
}

interface SearchInputProps {
	query: string;
	onFilter: JSX.EventHandlerUnion<HTMLInputElement, InputEvent>;
	searchMode: ThemeSearchMode;
	updateSearchMode: () => void;
}

const ThemeSearchInput = (props: SearchInputProps) => {
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
			<SearchInput
				firstBookMatch=""
				value={props.query}
				placeholder="Search themes"
				onInput={props.onFilter}
				// ref={searchInputRef}
				// onFocus={handleSearchInputFocus}
				data-testid="theme-search-input"
				aria-label="Search themes"
			/>
		</InputGroup>
	);
};
