import { Box, Flex, HStack } from "styled-system/jsx";
import SelectionGroups from "../SelectionGroups";
import { createStore, produce, unwrap } from "solid-js/store";
import { For, Portal } from "solid-js/web";
import { IconButton } from "../../ui/icon-button";
import { InputGroup } from "../../ui/input-group";
import ControlTabDisplay from "../ControlTabDisplay";
import {
	createEffect,
	createMemo,
	Show,
	type Accessor,
	type JSX,
	type Setter,
} from "solid-js";
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
import SearchInput, { type StageMarkData } from "../../custom/search-input";
import { Kbd } from "../../ui/kbd";
import { VsListTree, VsSearchFuzzy } from "solid-icons/vs";
import type { AvailableTranslation, ScriptureVerse } from "~/types";
import bibleData from "~/utils/parser/osis.json";
import chapterAndVerse from "~/utils/parser/cv";

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
	filter: string;
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
			filter: "",
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

	let searchInputRef!: HTMLInputElement;
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
	const { name, coreFocusId, fluidFocusId, changeFluidFocus } = subscribeEvent({
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
		const fluidId = fluidFocusId();
		console.log("Sending current item preview: ");
		if (typeof fluidId === "number") {
			pushToLive(fluidId, false);
			const scripture = filteredScriptures()[fluidId];
			if (scripture) {
				setStageMarkData({
					book: scripture.book_name,
					chapter: scripture.chapter,
					verse: scripture.verse,
				});
			}
		}
	});

	const handleFilter = (e: InputEvent) => {
		setScriptureControls("query", (e.target as HTMLInputElement).value);
	};

	const allBooks = bibleData.map((obj) => obj.name).sort();
	// let currentBook = "";
	// let currentChapter = 0;
	// let currentVerse = 0;
	let stage = 0;
	let fullText = "";
	let newVal = "";
	let portionEnd = 0;
	let formerFilter = "";
	let highlightInput!: HTMLParagraphElement;
	const [stageMarkData, setStageMarkData] = createStore<StageMarkData>({});

	const handlerUpdateFluidFocus = () => {
		if (!stageMarkData) return;
		const scriptureIndex = filteredScriptures().findIndex(
			(scripture) =>
				scripture.book_name === stageMarkData.book?.toLowerCase() &&
				scripture.chapter === stageMarkData.chapter &&
				scripture.verse === stageMarkData.verse,
		);
		if (scriptureIndex > -1) {
			changeFluidFocus(scriptureIndex);
		}
	};

	const handleTextInsert = (
		e: InputEvent,
		currentBook: string,
		currentChapter: number,
		currentVerse: number,
	) => {
		const target = e.target as HTMLInputElement;
		let userInput: string = (target.value + e.data).toLowerCase();
		newVal = userInput;
		// let formerInput: string = target.value.toLowerCase();
		const portions = userInput.split(" ");
		const bookHasSpace = currentBook.includes(" ");
		if (userInput.length === 1) {
			stage = 0;
		}
		if (
			e.data === " " &&
			portions.length > currentBook.split(" ").length &&
			stage < 2
		) {
			stage += 1;
			newVal = currentBook;
			if (stage > 0) {
				newVal += " ";
			}
			if (stage > 1) {
				newVal += currentChapter + ":";
			}
			target.value = newVal;
		}

		console.log("SPACE CHECK: ", portions);
		if (stage === 0) {
			portionEnd = newVal.length;
			currentBook =
				allBooks.find((book) => book.toLowerCase().startsWith(userInput)) || "";
			currentChapter = 1;
			currentVerse = 1;
		} else if (stage === 1) {
			portionEnd = currentChapter.toString().length - 1;
			currentChapter = parseInt(bookHasSpace ? portions[2] : portions[1]) || 1;
			console.log("Expecting Chapter: ", currentChapter);
			currentVerse = 1;
		} else if (stage === 2) {
			portionEnd = currentVerse.toString().length - 1;
			currentVerse = parseInt(portions.at(-1)?.split(":").at(-1) ?? "") || 1;
			console.log("Expecting Verse: ", currentVerse);
		}

		return {
			newBook: currentBook,
			newChapter: currentChapter,
			newVerse: currentVerse,
		};
	};

	const getCurrentData = () => {
		const currentBook = stageMarkData.book ?? "";
		const currentChapter = stageMarkData.chapter ?? 0;
		const currentVerse = stageMarkData.verse ?? 0;

		return { currentBook, currentChapter, currentVerse };
	};

	const handleSearch = (e: InputEvent) => {
		e.preventDefault();
		let { currentBook, currentChapter, currentVerse } = getCurrentData();

		console.log("SEARCHING: ", e);
		if (e.inputType === "insertText") {
			const { newBook, newChapter, newVerse } = handleTextInsert(
				e,
				currentBook,
				currentChapter,
				currentVerse,
			);
			currentBook = newBook;
			currentChapter = newChapter;
			currentVerse = newVerse;
		} else if (e.inputType === "deleteContentBackward") {
			let gap = 1;
			if (newVal.at(-1) === ":" && stage === 2) {
				stage = 1;
				gap = 2;
				portionEnd = currentChapter.toString().length;
			} else if (newVal.at(-1) === " " && stage === 1) {
				stage = 0;
				gap = 2;
				portionEnd = currentBook.length;
			}
			newVal = newVal.slice(0, newVal.length - gap);
			portionEnd -= 1;
			console.log(newVal, portionEnd);
		}
		console.log(
			"After Insert Updates: ",
			currentBook,
			currentChapter,
			currentVerse,
		);

		fullText = newVal.length
			? `${currentBook} ${currentChapter}:${currentVerse}`
			: "";
		console.log("Full TEXT: ", fullText, stage, portionEnd, formerFilter);
		setStageMarkData({
			book: currentBook,
			chapter: currentChapter,
			verse: currentVerse,
			stage,
			searching: Boolean(fullText.length),
			fullText: fullText,
			portion: fullText.slice(newVal.length, portionEnd),
			stageLength: portionEnd,
		});
		handlerUpdateFluidFocus();
		console.log(`${formerFilter}--${newVal}`);
		setScriptureControls("filter", newVal);
		formerFilter = newVal;
	};

	const handleFilterNav = (e: KeyboardEvent) => {
		if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
			const target = e.target as HTMLInputElement;
			const { currentBook, currentChapter, currentVerse } = getCurrentData();

			e.preventDefault();
			if (e.key === "ArrowRight" && stage < 2) {
				stage += 1;
				portionEnd = 0;
				newVal = currentBook;
				if (stage > 0) {
					newVal += " ";
				}
				if (stage > 1) {
					newVal += currentChapter + ":";
				}
				target.value = newVal;
			} else if (e.key === "ArrowLeft" && stage > 0) {
				stage -= 1;
				portionEnd = 0;
				newVal = "";
				if (stage > 0) {
					newVal += currentBook + " ";
				}
				if (stage > 1) {
					newVal += currentChapter + ":";
				}
				target.value = newVal;
			}
			setStageMarkData({
				book: currentBook,
				chapter: currentChapter,
				verse: currentVerse,
				stage,
				searching: Boolean(fullText.length),
				fullText: fullText,
				portion: fullText.slice(newVal.length, portionEnd),
				stageLength: portionEnd,
			});
			handlerUpdateFluidFocus();
		}
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
						filter={scriptureControls.filter}
						onFilter={handleFilter}
						onSearch={handleSearch}
						searchInputRef={searchInputRef}
						setHighlightInputRef={(el) => {
							highlightInput = el;
						}}
						markData={stageMarkData}
						handleKeyNav={handleFilterNav}
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
	filter: string;
	onFilter: JSX.EventHandlerUnion<HTMLInputElement, InputEvent>;
	onSearch: JSX.EventHandlerUnion<HTMLInputElement, InputEvent>;
	searchMode: ScriptureSearchMode;
	updateSearchMode: () => void;
	searchInputRef: HTMLInputElement;
	setHighlightInputRef: (el: HTMLParagraphElement) => void;
	markData: StageMarkData;
	handleKeyNav: JSX.EventHandlerUnion<HTMLInputElement, KeyboardEvent>;
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
				value={props.filter}
				onbeforeinput={
					props.searchMode === "search" ? props.onFilter : props.onSearch
				}
				onkeydown={props.handleKeyNav}
				ref={props.searchInputRef}
				setHighlightRef={props.setHighlightInputRef}
				textTransform="capitalize"
				scripture={props.markData}
				// onFocus={handleSearchInputFocus}
				data-testid="scripture-search-input"
				aria-label="Search scriptures"
			/>
		</InputGroup>
	);
};
