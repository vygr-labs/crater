import { Box, Flex, HStack, VStack } from "styled-system/jsx";
import SelectionGroups from "../SelectionGroups";
import { createStore, produce } from "solid-js/store";
import { Menu } from "../../ui/menu";
import { For, Portal } from "solid-js/web";
import {
	TbBook,
	TbChevronDown,
	TbChevronRight,
	TbEdit,
	TbEye,
	TbFolder,
	TbMusic,
	TbPalette,
	TbPaletteOff,
	TbPlus,
	TbPresentation,
	TbSearch,
	TbSettings,
	TbStar,
	TbStarFilled,
	TbTree,
	TbX,
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
	defaultSupportingPalette,
	THEMES_TAB_FOCUS_NAME,
} from "~/utils/constants";
import { focusStyles } from "~/utils/atomic-recipes";
import {
	getBaseFocusStyles,
	getFocusableStyles,
	getToastType,
	parseThemeData,
	toaster,
} from "~/utils";
import { css } from "styled-system/css";
import { token } from "styled-system/tokens";
import { createAsyncMemo } from "solidjs-use";
import type { PanelCollection } from "~/types/app-context";
import ThemeSelectionGroupDisplay from "./SelectionGroupDisplay";
import { MainActionBarMenu, MainDisplayMenuContent } from "./MainPanelMenus";
import { Kbd } from "../../ui/kbd";
import { VsListTree, VsSearchFuzzy } from "solid-icons/vs";
import type { ThemeMetadata, ThemeType } from "~/types";
import { changeDefaultTheme } from "~/utils/store-helpers";
import Image from "../Image";
import RenderTheme from "../editor/RenderTheme";
import { defaultThemeRenderMap } from "../projection/RenderProjection";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";

type ThemePanelGroupValues = "all" | "collections" | "favorites";
type ThemeListData = {
	title: string;
	value: ThemePanelGroupValues;
};
type ThemeSearchMode = "search" | "title";

type ThemeControlsData = {
	searchMode: ThemeSearchMode;
	group: ThemeType;
	collection: number | null;
	query: string;
	contextMenuOpen: boolean;
};

const NUM_OF_DISPLAY_LANES = 8;
const laneItemSize = 100 / NUM_OF_DISPLAY_LANES;

const themeTypeConfig: Record<
	ThemeType,
	{ icon: typeof TbMusic; label: string; color: string }
> = {
	song: { icon: TbMusic, label: "Song", color: "purple" },
	scripture: { icon: TbBook, label: "Scripture", color: "blue" },
	presentation: { icon: TbPresentation, label: "Presentation", color: "green" },
};

export default function ThemeSelection() {
	const { appStore, setAppStore } = useAppContext();
	const allThemes = createAsyncMemo(async () => {
		const updated = appStore.themesUpdateTrigger;
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
		if (!currentGroup().subGroups && currentGroup().type) {
			console.log(currentGroup().type, allThemes());
			return applyQueryFilter(
				allThemes().filter((theme) => theme.type === currentGroup().type),
			);
		} else if (currentGroup().subGroups && themeCollection) {
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
			estimateSize: () => 40,
			overscan: 5,
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
				const newCoreFocusId = Math.max((fluidFocusId ?? 0) - 1, 0);
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
					(fluidFocusId ?? 0) + 1,
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
				console.log("Clicked Here in Themes	");
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
	const currentSelectedTheme = createAsyncMemo(async () => {
		const fluidId = fluidFocusId();
		if (typeof fluidId === "number") {
			const id = filteredThemes()[fluidId].id;
			const theme = await window.electronAPI.fetchTheme(id);
			return parseThemeData(theme?.theme_data);
		}
		return {};
	});

	function handleGroupAccordionChange(
		open: (ThemePanelGroupValues | string)[],
		e?: MouseEvent,
	) {
		if (!open.length) return;
		setThemeControls(
			produce((store) => {
				const subSelection = open.find((item) => item.includes("-"));
				console.log(open, subSelection);

				if (subSelection) {
					const [group, collection] = subSelection.split("-");
					store.group = group as ThemeType;
					store.collection = parseInt(collection);
				} else {
					store.group = open[0] as ThemeType;
					store.collection = null;
				}
			}),
		);
	}

	// scroll to current fluid item
	createEffect(() => {
		if (isCurrentPanel() && filteredThemes().length) {
			rowVirtualizer().scrollToIndex(fluidFocusId() ?? 0);
		}
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

	createEffect(() => {
		if (!isCurrentPanel()) {
			setThemeControls("contextMenuOpen", false);
		}
	});

	// send current fluid item to preview-menu
	// createEffect(() => {
	//     pushToLive(fluidFocusId(), false)
	// })

	const handleThemeEdit = async () => {
		const toEdit = fluidFocusId();
		console.log("Handle Theme Edit: ", toEdit);
		if (typeof toEdit !== "number") return;

		const id = filteredThemes()[toEdit].id;
		const theme = await window.electronAPI.fetchTheme(id);
		console.log(theme, id);
		setAppStore("themeEditor", {
			open: true,
			type: theme?.type,
			initial: theme,
		});
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
		setAppStore("themeEditor", {
			open: true,
			type: themeControls.group,
			initial: null,
		});
	};

	const handleThemeDelete = () => {
		const fluidIndex = fluidFocusId();
		if (typeof fluidIndex !== "number") return;
		const selected = filteredThemes()[fluidIndex];
		window.electronAPI.deleteTheme(selected.id).then(({ success, message }) => {
			console.log("Deleted Theme: ", selected);
			toaster.create({
				type: getToastType(success),
				title: message,
			});

			setAppStore("themesUpdateTrigger", (former) => former + 1);
			setThemeControls("contextMenuOpen", false);
		});
	};

	const handleSetDefaultTheme = async () => {
		const fluidIndex = fluidFocusId();
		console.log("Setting default to index: ", fluidIndex);
		if (typeof fluidIndex !== "number") return;

		const currentTheme = await window.electronAPI.fetchTheme(
			filteredThemes()[fluidIndex].id,
		);

		console.log(currentTheme);
		if (!currentTheme) return;
		changeDefaultTheme(setAppStore, currentTheme);
		console.log(appStore.displayData.songTheme);
	};

	const themeCountDisplay = (
		<Text fontSize="11px" color="gray.500">
			{filteredThemes().length.toLocaleString()} themes
			<Show when={themeControls.query}>{` matching search`}</Show>
		</Text>
	);

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
				subgroupIcon={TbFolder}
			/>
			<ControlTabDisplay
				open={themeControls.contextMenuOpen}
				setOpen={(v) => setThemeControls("contextMenuOpen", v)}
				contextMenuContent={
					<MainDisplayMenuContent
						onThemeEdit={handleThemeEdit}
						onThemeDelete={handleThemeDelete}
						currentType={themeControls.group}
						onSetDefaultTheme={handleSetDefaultTheme}
					/>
				}
				actionBarMenu={<MainActionBarMenu onCreateTheme={handleCreateTheme} />}
				centerContent={themeCountDisplay}
				ref={virtualizerParentRef}
			>
				<Switch>
					<Match when={filteredThemes().length}>
						<Flex h="full">
							<Box
								w="7/12"
								style={{
									height: `${rowVirtualizer().getTotalSize()}px`,
									// width: "50%",
									position: "relative",
								}}
							>
								<For each={rowVirtualizer().getVirtualItems()}>
									{(virtualItem) => {
										const theme = filteredThemes()[virtualItem.index];
										const isSelected = () =>
											virtualItem.index === fluidFocusId();
										const isCurrent = () => virtualItem.index === coreFocusId();
										const isDefault = () =>
											appStore.displayData.songTheme?.id === theme.id ||
											appStore.displayData.scriptureTheme?.id === theme.id;
										return (
											<HStack
												pos="absolute"
												top={0}
												left={0}
												px={3}
												py={2}
												w="full"
												gap={3}
												alignItems="center"
												class="disable-child-clicks"
												cursor="pointer"
												css={{
													"& *": {
														pointerEvents: "none",
													},
													_hover: {
														bgColor: "purple.900/30",
													},
												}}
												style={{
													height: `${virtualItem.size}px`,
													transform: `translateY(${virtualItem.start}px)`,
													...getBaseFocusStyles(THEMES_TAB_FOCUS_NAME),
													...getFocusableStyles(
														THEMES_TAB_FOCUS_NAME,
														isSelected(),
														isCurrentPanel(),
														isCurrent(),
													),
												}}
												data-panel={THEMES_TAB_FOCUS_NAME}
												data-focusId={virtualItem.index}
											>
												{/* Theme icon */}
												<Box
													color={
														isSelected() && isCurrentPanel()
															? "purple.300"
															: "gray.500"
													}
													flexShrink={0}
												>
													<TbPalette size={16} />
												</Box>
												{/* Theme title */}
												<Text
													flex={1}
													minW={0}
													fontSize="14px"
													truncate
													color={
														isSelected() && isCurrentPanel()
															? "white"
															: "gray.200"
													}
												>
													{theme.title}
												</Text>
												{/* Theme type badge */}
												<Box
													fontSize="9px"
													fontWeight="bold"
													color={
														isSelected() && isCurrentPanel()
															? `${themeTypeConfig[theme.type]?.color || "purple"}.200`
															: "gray.500"
													}
													textTransform="uppercase"
													letterSpacing="wide"
													flexShrink={0}
													bg={
														isSelected() && isCurrentPanel()
															? `${themeTypeConfig[theme.type]?.color || "purple"}.800/60`
															: "gray.800"
													}
													px={1.5}
													py={0.5}
													borderRadius="sm"
												>
													{themeTypeConfig[theme.type]?.label || theme.type}
												</Box>
												{/* Default badge with star */}
												<Show when={isDefault()}>
													<HStack
														gap={1}
														bg={
															isSelected() ? "yellow.800/60" : "yellow.900/40"
														}
														color={isSelected() ? "yellow.300" : "yellow.500"}
														px={1.5}
														py={0.5}
														borderRadius="sm"
														fontSize="9px"
														fontWeight="bold"
														textTransform="uppercase"
														letterSpacing="wide"
													>
														<TbStarFilled size={10} />
														<Text>Default</Text>
													</HStack>
												</Show>
											</HStack>
										);
									}}
								</For>
							</Box>
							{/* Preview Panel */}
							<VStack
								w="5/12"
								h="full"
								pointerEvents="none"
								p={4}
								gap={3}
								bg="gray.950/50"
								borderLeft="1px solid"
								borderColor="gray.800"
							>
								{/* Preview header */}
								<HStack
									w="full"
									justifyContent="space-between"
									alignItems="center"
								>
									<HStack gap={2} color="gray.400">
										<TbEye size={14} />
										<Text
											fontSize="11px"
											fontWeight="medium"
											textTransform="uppercase"
											letterSpacing="wide"
										>
											Theme Preview
										</Text>
									</HStack>
									<Show when={filteredThemes()[fluidFocusId() ?? 0]}>
										<Text
											fontSize="10px"
											color="gray.500"
											truncate
											maxW="120px"
										>
											{filteredThemes()[fluidFocusId() ?? 0]?.title}
										</Text>
									</Show>
								</HStack>
								{/* Preview content */}
								<Box
									aspectRatio={16 / 9}
									border="2px solid"
									borderColor="purple.700"
									borderRadius="md"
									overflow="hidden"
									maxH="full"
									mx="auto"
									w="full"
									boxShadow="0 0 0 1px rgba(147, 51, 234, 0.2)"
								>
									<Box w="full" h="full">
										<RenderTheme
											data={currentSelectedTheme()}
											renderMap={defaultThemeRenderMap}
										/>
									</Box>
								</Box>
								{/* Quick actions hint */}
								<HStack w="full" justifyContent="center" gap={4}>
									<HStack gap={1} color="gray.600" fontSize="10px">
										<Kbd variant="plain" fontSize="9px">
											Enter
										</Kbd>
										<Text>to select</Text>
									</HStack>
									<HStack gap={1} color="gray.600" fontSize="10px">
										<Kbd variant="plain" fontSize="9px">
											Right-click
										</Kbd>
										<Text>for options</Text>
									</HStack>
								</HStack>
							</VStack>
						</Flex>
					</Match>
					<Match when={!allThemes().length}>
						<VStack gap={3} w="full" h="full" justifyContent="center" px={6}>
							<Box color="gray.600">
								<TbPaletteOff size={48} />
							</Box>
							<VStack gap={1}>
								<Text textStyle="lg" fontWeight="medium" color="gray.200">
									No Themes Available
								</Text>
								<Text fontSize="13px" color="gray.500" textAlign="center">
									Express your creativity by creating one using the "+" button
								</Text>
							</VStack>
						</VStack>
					</Match>
					<Match
						when={
							allThemes().length &&
							themeControls.query &&
							!filteredThemes().length
						}
					>
						<VStack gap={3} w="full" h="full" justifyContent="center" px={6}>
							<Box color="gray.600">
								<TbSearch size={40} />
							</Box>
							<VStack gap={1}>
								<Text textStyle="md" fontWeight="medium" color="gray.200">
									No themes found
								</Text>
								<Text fontSize="13px" color="gray.500" textAlign="center">
									No themes match your search query
								</Text>
							</VStack>
						</VStack>
					</Match>
					<Match when={allThemes().length && !filteredThemes().length}>
						<VStack gap={3} w="full" h="full" justifyContent="center" px={6}>
							<Box color="gray.600">
								<TbPalette size={48} />
							</Box>
							<VStack gap={1}>
								<Text textStyle="md" fontWeight="medium" color="gray.200">
									No Themes in This Category
								</Text>
								<Text fontSize="13px" color="gray.500" textAlign="center">
									Create a new theme using the "+" button below
								</Text>
							</VStack>
						</VStack>
					</Match>
				</Switch>
			</ControlTabDisplay>
		</Flex>
	);
}

interface SearchInputProps {
	query: string;
	onFilter: (e: InputEvent) => void;
	searchMode: ThemeSearchMode;
	updateSearchMode: () => void;
}

const ThemeSearchInput = (props: SearchInputProps) => {
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
				_placeholder={{ color: "gray.500" }}
				_selection={{
					bgColor: "purple.600",
				}}
				value={props.query}
				placeholder="Search themes"
				onInput={props.onFilter}
				data-testid="theme-search-input"
				aria-label="Search themes"
			/>
			{/* Clear button */}
			<Show when={props.query}>
				<IconButton
					size="xs"
					variant="ghost"
					mr={1}
					color="gray.500"
					_hover={{ color: "gray.300" }}
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
