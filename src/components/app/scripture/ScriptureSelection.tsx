import { Box, Flex, HStack } from "styled-system/jsx";
import SelectionGroups from "../SelectionGroups";
import { createStore, produce, unwrap } from "solid-js/store";
import { For, Portal } from "solid-js/web";
import { IconButton } from "../../ui/icon-button";
import { InputGroup } from "../../ui/input-group";
import ControlTabDisplay from "../ControlTabDisplay";
import { createEffect, createMemo, Show, type JSX } from "solid-js";
import { Text } from "../../ui/text";
import { createVirtualizer } from "@tanstack/solid-virtual";
import { useAppContext } from "~/layouts/AppContext";
import { useFocusContext } from "~/layouts/FocusContext";
import {
	ALL_SCRIPTURE_DYNAMICSUB_KEY,
	SCRIPTURE_TAB_FOCUS_NAME,
	SONGS_TAB_FOCUS_NAME,
} from "~/utils/constants";
import { focusStyles } from "~/utils/atomic-recipes";
import {
	getBaseFocusStyles,
	getFocusableStyles,
	getFocusVariant,
} from "~/utils";
import { css } from "styled-system/css";
import { token } from "styled-system/tokens";
import { createAsyncMemo } from "solidjs-use";
import type { PanelCollection } from "~/types/app-context";
import ScriptureSelectionGroupDisplay from "./SelectionGroupDisplay";
import { MainActionBarMenu, MainDisplayMenuContent } from "./MainPanelMenus";
import SearchInput from "../../custom/search-input";
import { Kbd } from "../../ui/kbd";
import { VsListTree, VsSearchFuzzy } from "solid-icons/vs";
import type { AvailableTranslation, ScriptureVerse } from "~/types";

type ScripturePanelGroupValues = "all" | "collections" | "favorites";
type ScriptureListData = {
	title: string;
	value: ScripturePanelGroupValues;
};
type ScriptureSearchMode = "search" | "title";

type ScriptureControlsData = {
	searchMode: ScriptureSearchMode;
	group: string;
	collection: number | null;
	query: string;
	contextMenuOpen: boolean;
	translation: AvailableTranslation;
};

export default function ScriptureSelection() {
	const { appStore, setAppStore } = useAppContext();
	const [scriptureControls, setScriptureControls] =
		createStore<ScriptureControlsData>({
			group: "all",
			collection: null,
			searchMode: "title",
			query: "",
			contextMenuOpen: false,
			translation: "NKJV",
		});
	const allScriptures = createAsyncMemo(async () => {
		// const updated = appStore.scripturesUpdateCounter
		console.log("Translation: ", scriptureControls.translation);
		return await window.electronAPI.fetchAllScripture(
			scriptureControls.translation,
		);
	}, []);
	const allTranslations = createAsyncMemo(async () => {
		return await window.electronAPI.fetchTranslations();
	}, []);
	const dynamicSubgroups = createMemo(() => ({
		[ALL_SCRIPTURE_DYNAMICSUB_KEY]: allTranslations().map((translation) => ({
			name: translation.version,
			id: translation.id,
			items: [],
		})),
	}));
	const allGroups = createMemo(() => {
		const updatedGroups = Object.fromEntries(
			Object.entries(unwrap(appStore.displayGroups.scripture)).map(
				([key, obj]) => {
					console.log("Is dynamic??", key, obj.dynamic, obj);
					if (obj.dynamic?.id) {
						console.log(
							"Appending dynamic thing: ",
							dynamicSubgroups()[obj.dynamic.id],
						);
						obj.subGroups = dynamicSubgroups()[obj.dynamic.id];
					}
					return [key, obj];
				},
			),
		);
		return updatedGroups;
	});
	const currentGroup = createMemo(() => allGroups()[scriptureControls.group]);
	// const currentCollection = createMemo(() =>
	// 	currentGroup().subGroups?.find(
	// 		(group) => group.id === scriptureControls.collection,
	// 	),
	// );
	const applyQueryFilter = (scriptures: ScriptureVerse[]) =>
		scriptures.filter((scripture) =>
			scripture.text.includes(scriptureControls.query),
		);
	const filteredScriptures = createMemo<ScriptureVerse[]>(() => {
		// const scriptureCollection = currentCollection();
		console.log(
			"All Groups: ",
			allGroups(),
			currentGroup(),
			scriptureControls.translation,
		);
		// if (currentGroup().subGroups && scriptureControls.translation) {
		// 	return applyQueryFilter(
		// 		allScriptures().filter((scripture) =>
		// 			scriptureCollection.items.includes(scripture.id),
		// 		),
		// 	);
		// } else {
		return applyQueryFilter(allScriptures());
		// }
	});

	const pushToLive = (itemId?: number | null, isLive?: boolean) => {
		const focusId = itemId;
		if (
			typeof focusId !== "number" ||
			!filteredScriptures().length ||
			!isCurrentPanel()
		)
			return;

		const previewScripture = filteredScriptures()[focusId];
		if (previewScripture) {
			setAppStore(isLive ? "liveItem" : "previewItem", {
				metadata: {
					title: `${previewScripture.book_name} ${previewScripture.chapter}:${previewScripture.verse} (${previewScripture.version.toUpperCase()})`,
					id: `${previewScripture.book_name}-${previewScripture.chapter}-${previewScripture.verse}`.toLowerCase(),
				},
				type: "scripture",
				data: [previewScripture],
				index: 0,
			});
		}
	};

	let virtualizerParentRef!: HTMLDivElement;
	const rowVirtualizer = createMemo(() =>
		createVirtualizer({
			count: filteredScriptures().length,
			getScrollElement: () => virtualizerParentRef,
			estimateSize: () => 36,
			overscan: 5,
		}),
	);

	const { subscribeEvent, changeFocusPanel, currentPanel } = useFocusContext();
	const { name, coreFocusId, fluidFocusId } = subscribeEvent({
		name: SCRIPTURE_TAB_FOCUS_NAME,
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
					filteredScriptures().length,
				);
				console.log("ARROWDOWN Changing fluid focus: ", newCoreFocusId);
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
				console.log("ARROWUP Changing fluid focus: ", newCoreFocusId);
				changeFluidFocus(newCoreFocusId);
			},
			Enter: ({
				coreFocusId,
				fluidFocusId,
				changeFocus,
				changeCoreFocus,
				changeFluidFocus,
			}) => {
				console.log("ARROWDOWN Changing All focus: ", fluidFocusId);
				changeFocus(fluidFocusId);
				pushToLive(fluidFocusId, true);
			},
		},
		clickHandlers: {
			onClick: ({ changeFluidFocus, focusId }) => {
				if (typeof focusId === "number") {
					changeFluidFocus(focusId);
					setScriptureControls("contextMenuOpen", false);
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
					setScriptureControls("contextMenuOpen", true);
				}
			},
		},
	});
	const isCurrentPanel = createMemo(() => currentPanel() === name);

	function handleGroupAccordionChange(
		open: (ScripturePanelGroupValues | string)[],
		e?: MouseEvent,
	) {
		console.log(open);
		setScriptureControls(
			produce((store) => {
				const subSelection = open.find((item) => item.includes("-"));

				if (!open.length) {
					store.group = "";
					return;
				}

				if (subSelection) {
					const [group, strCollection] = subSelection.split("-");
					const collection = parseInt(strCollection);
					store.group = group;
					store.collection = collection;
					store.translation = allTranslations().find(
						(translation) => translation.id === collection,
					)?.version as AvailableTranslation;
				} else {
					store.group = open[0];
					// store.collection = null;
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
		if (scriptureControls.contextMenuOpen && fluidFocus) {
			if (
				!rowVirtualizer()
					.getVirtualItems()
					.map((item) => item.index)
					.includes(fluidFocus)
			) {
				setScriptureControls("contextMenuOpen", false);
			}
		}
	});

	// send current fluid item to preview-menu
	createEffect(() => {
		console.log("Sending current item preview: ", fluidFocusId());
		pushToLive(fluidFocusId(), false);
	});

	const handleFilter = (e: InputEvent) => {
		setScriptureControls("query", (e.target as HTMLInputElement).value);
	};

	const updateSearchMode = () => {
		setScriptureControls("searchMode", (former) =>
			former === "search" ? "title" : "search",
		);
	};

	return (
		<Flex h="full" pos="relative">
			<SelectionGroups
				searchInput={
					<ScriptureSearchInput
						searchMode={scriptureControls.searchMode}
						updateSearchMode={updateSearchMode}
						query={scriptureControls.query}
						onFilter={handleFilter}
					/>
				}
				currentGroup={[scriptureControls.group]}
				currentSubgroup={scriptureControls.collection}
				groups={allGroups()}
				handleAccordionChange={handleGroupAccordionChange}
				actionMenus={<ScriptureSelectionGroupDisplay />}
			/>
			<ControlTabDisplay
				open={scriptureControls.contextMenuOpen}
				contextMenuContent={<MainDisplayMenuContent />}
				actionBarMenu={<MainActionBarMenu />}
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
							const scripture = filteredScriptures()[virtualItem.index];
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
										...getBaseFocusStyles(SONGS_TAB_FOCUS_NAME),
										...getFocusableStyles(
											SONGS_TAB_FOCUS_NAME,
											virtualItem.index === fluidFocusId(),
											isCurrentPanel(),
											virtualItem.index === coreFocusId(),
										),
										// "background-color": virtualItem.index === fluidFocusId() ? token.var(`colors.${defaultPalette}.900`) : virtualItem.index === coreFocusId() ? token.var(`colors.gray.800`) : "",
										// color: virtualItem.index === fluidFocusId() ? token.var(`colors.white`) : token.var(`colors.gray.100`),
									}}
									data-panel={SCRIPTURE_TAB_FOCUS_NAME}
									data-focusId={virtualItem.index}
								>
									<Box pl={2} textTransform="uppercase">
										{scripture.version}
									</Box>
									<Box pl={2} textTransform="capitalize" whiteSpace="nowrap">
										{scripture.book_name} {scripture.chapter}:{scripture.verse}
									</Box>
									<Box
										pl={2}
										pr={2}
										whiteSpace="nowrap"
										overflow="hidden"
										textOverflow="ellipsis"
									>
										{scripture.text}
									</Box>
								</HStack>
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
	searchMode: ScriptureSearchMode;
	updateSearchMode: () => void;
}

const ScriptureSearchInput = (props: SearchInputProps) => {
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
				placeholder="Search scriptures"
				onInput={props.onFilter}
				// ref={searchInputRef}
				// onFocus={handleSearchInputFocus}
				data-testid="scripture-search-input"
				aria-label="Search scriptures"
			/>
		</InputGroup>
	);
};
