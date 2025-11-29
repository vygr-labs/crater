import { Box, Flex, HStack, VStack } from "styled-system/jsx";
import SelectionGroups from "../SelectionGroups";
import { createStore, produce, unwrap } from "solid-js/store";
import { For, Portal, Show } from "solid-js/web";
import { IconButton } from "../../ui/icon-button";
import { InputGroup } from "../../ui/input-group";
import ControlTabDisplay from "../ControlTabDisplay";
import {
	createEffect,
	createMemo,
	Match,
	on,
	Switch,
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
	capitalizeFirstLetter,
	formatReference,
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
import { Kbd } from "../../ui/kbd";
import { VsListTree, VsSearchFuzzy } from "solid-icons/vs";
import { TbBook, TbBook2, TbBookOff, TbSearch, TbX } from "solid-icons/tb";
import type { AvailableTranslation, ScriptureVerse } from "~/types";
import bibleData from "~/utils/parser/osis.json";
import bookInfo from "~/utils/parser/books.json";
import { Input } from "~/components/ui/input";
import Fuse from "fuse.js";
import { appLogger } from "~/utils/logger";

type ScripturePanelGroupValues = "all" | "collections" | "favorites";
type ScriptureListData = {
	title: string;
	value: ScripturePanelGroupValues;
};
type ScriptureSearchMode = "search" | "special";

type ScriptureControlsData = {
	searchMode: ScriptureSearchMode;
	group: string;
	collection: number | null;
	query: string;
	filter: string;
	contextMenuOpen: boolean;
	translation: AvailableTranslation;
};

interface StageMarkData {
	book?: string;
	chapter?: number;
	verse?: number;
	stage: number;
	currentValue: string;
	selectionStart: number;
	selectionEnd: number;
}

const fuzzy = new Fuse([] as ScriptureVerse[], {
	keys: ["text"],
});

export default function ScriptureSelection() {
	const { appStore, setAppStore } = useAppContext();
	const [scriptureControls, setScriptureControls] =
		createStore<ScriptureControlsData>({
			group: "all",
			collection: null,
			searchMode: "special",
			query: "",
			filter: "",
			contextMenuOpen: false,
			translation: "NKJV",
		});
	const allScriptures = createAsyncMemo(async () => {
		// const updated = appStore.scripturesUpdateCounter
		console.log("Translation: ", scriptureControls.translation);
		const results = await window.electronAPI.fetchAllScripture(
			scriptureControls.translation,
		);
		fuzzy.setCollection(results);
		return results;
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
	// const applyQueryFilter = (scriptures: ScriptureVerse[]) => {
	// return fuzzy.search(scriptureControls.query).map((m) => m.item);
	// scriptures.filter((scripture) =>
	// 	scripture.text.includes(scriptureControls.query),
	// );
	// };
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
		if (scriptureControls.query) {
			return fuzzy.search(scriptureControls.query).map((m) => m.item);
		} else {
			return allScriptures();
		}
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
					title: capitalizeFirstLetter(
						`${previewScripture.book_name} ${previewScripture.chapter}:${previewScripture.verse} (${previewScripture.version.toUpperCase()})`,
						true,
					),
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

	const keepInputSelection = (e: Event) => {
		e.preventDefault();
		// event.target?.blur();
		// console.log("Changing Focus: ");
		// searchInputRef?.focus();
	};

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
				event,
			}) => {
				const newCoreFocusId = Math.min(
					(fluidFocusId ?? 0) + 1,
					filteredScriptures().length,
				);
				console.log("ARROWDOWN Changing fluid focus: ", newCoreFocusId);
				changeFluidFocus(newCoreFocusId);
				updateFilterStage(event);
			},
			ArrowUp: ({
				coreFocusId,
				fluidFocusId,
				changeFocus,
				changeCoreFocus,
				changeFluidFocus,
				event,
			}) => {
				const newCoreFocusId = Math.max((fluidFocusId ?? 0) - 1, 0);
				console.log("ARROWUP Changing fluid focus: ", newCoreFocusId);
				changeFluidFocus(newCoreFocusId);
				updateFilterStage(event);
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
			onClick: ({ changeFluidFocus, focusId, event }) => {
				if (typeof focusId === "number") {
					changeFluidFocus(focusId);
					setScriptureControls("contextMenuOpen", false);
				}
				keepInputSelection(event);
			},
			onDblClick: ({ changeFocus, focusId, event }) => {
				if (typeof focusId === "number") {
					changeFocus(focusId);
					pushToLive(focusId, true);
				}
				keepInputSelection(event);
			},
			onRightClick: ({ changeFluidFocus, focusId, event }) => {
				if (typeof focusId === "number") {
					changeFluidFocus(focusId);
					setScriptureControls("contextMenuOpen", true);
				}
				keepInputSelection(event);
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
		if (isCurrentPanel() && filteredScriptures().length) {
			rowVirtualizer().scrollToIndex(fluidFocusId() ?? 0);
		}
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

	const updateFilterInput = (scripture?: ScriptureVerse) => {
		if (scriptureControls.searchMode !== "special") return;
		console.log(
			"Checking: ",
			scripture,
			stageMarkData,
			scripture?.book_name,
			stageMarkData.book,
		);
		if (
			scripture &&
			(scripture.book_name.toLowerCase() !==
				stageMarkData.book?.toLowerCase() ||
				scripture.chapter !== stageMarkData.chapter ||
				scripture.verse !== stageMarkData.verse)
		) {
			console.log("Check Successful: ", scripture);
			setStageMarkData({
				book: scripture.book_name,
				chapter: scripture.chapter,
				verse: scripture.verse,
				stage: 0,
				selectionStart: 0,
				selectionEnd: scripture.book_name.length,
				currentValue: "",
			});
		}
	};

	// send current fluid item to preview-menu
	createEffect(() => {
		const fluidId = fluidFocusId();
		if (typeof fluidId === "number") {
			pushToLive(fluidId, false);
			const scripture = filteredScriptures()[fluidId];
			console.log("Sending current item preview: ", fluidId, scripture);
			updateFilterInput(scripture);
		}
	});

	const handleFilter = (e: InputEvent) => {
		setScriptureControls("query", (e.target as HTMLInputElement).value);
	};

	const allBooks = bibleData
		.map((obj) => ({ name: obj.name, id: obj.id }))
		.toSorted();
	let highlightInput!: HTMLParagraphElement;
	const [stageMarkData, setStageMarkData] = createStore<StageMarkData>({
		stage: 0,
		book: "",
		chapter: 1,
		verse: 1,
		currentValue: "",
		selectionStart: 0,
		selectionEnd: 0,
	});

	createEffect(
		on(
			[
				() => stageMarkData.selectionStart,
				() => stageMarkData.selectionEnd,
				() => stageMarkData.currentValue,
				() => stageMarkData.stage,
				() => stageMarkData.book,
				() => stageMarkData.chapter,
				() => stageMarkData.verse,
			],
			() => {
				console.log(
					"Should Auto Select: ",
					stageMarkData.currentValue,
					stageMarkData.stage,
					stageMarkData.selectionStart,
					stageMarkData.selectionEnd,
					stageMarkData.book,
					stageMarkData.chapter,
					stageMarkData.verse,
				);
				const stageOffsets: Record<number, number> = {
					0: 0,
					1: (stageMarkData.book?.length ?? 0) + 1,
					2: (stageMarkData.chapter?.toString().length ?? 0) + 1,
				};
				const offset =
					stageMarkData.stage > 0
						? Array(stageMarkData.stage + 1)
								.fill(0)
								.reduce((p, c, i) => p + stageOffsets[i], 0)
						: 0;
				console.log(
					"selection Offset",
					Array(stageMarkData.stage + 1).fill(0),
					offset,
				);
				searchInputRef.focus();
				searchInputRef.setSelectionRange(
					offset + stageMarkData.selectionStart,
					offset + stageMarkData.selectionEnd,
				);
				handlerUpdateFluidFocus();
			},
		),
	);

	const handlerUpdateFluidFocus = () => {
		const scriptureIndex = filteredScriptures().findIndex(
			(scripture) =>
				scripture.book_name === stageMarkData.book?.toLowerCase() &&
				scripture.chapter === stageMarkData.chapter &&
				scripture.verse === stageMarkData.verse,
		);
		console.log(
			"Found Index: ",
			scriptureIndex,
			stageMarkData.book?.toLocaleLowerCase(),
			stageMarkData.chapter,
			stageMarkData.verse,
		);
		if (scriptureIndex > -1 && scriptureIndex !== fluidFocusId()) {
			changeFluidFocus(scriptureIndex);
		}
	};

	const scripturePattern = /^(\d*\s*\w*)\s*(\d*)[:|\s]*(\d*)$/gm;
	const handleSpecialSearch = (e: InputEvent) => {
		e.preventDefault();
		const target = e.target as HTMLInputElement;
		let stage = stageMarkData.stage;
		let [_, book, chapter, verse] = [
			"",
			stageMarkData.book ?? "",
			stageMarkData.chapter ?? 1,
			stageMarkData.verse ?? 1,
		];
		let newVal;
		if (e.data) {
			newVal = stageMarkData.currentValue + e.data;
			console.log(
				"val check: ",
				`--${stageMarkData.currentValue}--`,
				`--${e.data}--`,
				newVal.split(" ").length,
				book.split(" ").length,
				newVal.split(" ").length > book.split(" ").length,
			);
			if (
				e.data === " " &&
				newVal.split(" ").length > book.split(" ").length &&
				stageMarkData.stage < 2
			) {
				stage += 1;
				console.log("entered new stage: ", stage);
			}
		} else {
			newVal = stageMarkData.currentValue.substring(
				0,
				stageMarkData.currentValue.length - 1,
			);
		}

		console.log(
			"Mid-check: ",
			newVal,
			stage,
			stageMarkData.currentValue,
			e.data,
		);
		let invalidFilter = false;
		let extractedChapter: number = NaN;
		let extractedVerse: number = NaN;
		try {
			const d = newVal.matchAll(scripturePattern).toArray()[0];
			book = d[1];
			extractedChapter = parseInt(d[2]);
			extractedVerse = parseInt(d[3]);
			chapter = extractedChapter || 1; // set defaults
			verse = extractedVerse || 1; // set defaults

			console.log(
				`-${book}-`,
				"-",
				chapter,
				"-",
				verse,
				"-",
				extractedChapter,
				"-",
				extractedVerse,
			);
			if (stage === 1) {
				newVal = `${book} ${extractedChapter || ""}`;
			} else if (stage === 2) {
				newVal = `${book} ${chapter}:${extractedVerse || ""}`;
			}
		} catch (err) {
			appLogger.error("Error in regex scripture search", err);
			invalidFilter = true;
		}

		const foundBook = allBooks.find((b) =>
			b.name.toLowerCase().startsWith(book.toLowerCase()),
		) ?? {
			name: stageMarkData.book || allBooks[0].name,
			id: allBooks.find(
				(b) => b.name.toLowerCase() === stageMarkData.book?.toLowerCase(),
			)?.id,
		};
		const bookMeta = bookInfo.find((book) => book.id === foundBook.id);
		const foundChapter = bookMeta?.chapters?.[chapter - 1];
		const foundVerse = verse <= (foundChapter ?? 1);
		let portionStart: number = 0;
		let portionEnd: number = 0;
		if (stage === 0) {
			portionStart = book.length;
			portionEnd = foundBook.name.length;
		} else if (stage === 1) {
			portionStart = extractedChapter ? extractedChapter.toString().length : 0;
			portionEnd = chapter.toString().length;
		} else if (stage === 2) {
			portionStart = extractedVerse ? extractedVerse.toString().length : 0;
			portionEnd = verse.toString().length;
		}

		console.log(
			"What I want to set: ",
			foundBook,
			book,
			chapter,
			verse,
			stage,
			portionStart,
			portionEnd,
			newVal,
		);
		if (foundBook && foundChapter && foundVerse) {
			setStageMarkData(
				produce((store) => {
					console.log("Before Set: ", store);
					store.currentValue = newVal;
					store.book = foundBook.name;
					store.chapter = chapter;
					store.verse = verse;
					store.stage = stage;
					store.selectionStart = portionStart;
					store.selectionEnd = portionEnd;
					console.log("Finished Setting: ", store, portionStart, portionEnd);
				}),
			);
		}

		console.log(
			`--${stageMarkData.currentValue}--`,
			`--${newVal}--`,
			invalidFilter,
			stageMarkData,
		);
	};

	const updateFilterStage = (e?: KeyboardEvent) => {
		const target = searchInputRef as HTMLInputElement;

		let {
			book: currentBook,
			chapter: currentChapter,
			verse: currentVerse,
			stage,
		} = unwrap(stageMarkData);
		let inputVal = "";

		console.log(
			"Input Nav: ",
			currentBook,
			currentChapter,
			currentVerse,
			stage,
			fluidFocusId(),
		);

		if (e) {
			console.log("IS EVENT: ", e);
			e.preventDefault();
			if (e.key === "ArrowUp" || e.key === "ArrowDown") {
				stage = 2;
			}
			if (e.key === "ArrowRight" && stage < 2) {
				stage += 1;
			} else if (e.key === "ArrowLeft" && stage >= 0) {
				stage -= 1;
			}
		}

		if (stage === 1) {
			inputVal = `${stageMarkData.book} `;
		} else if (stage === 2) {
			inputVal = `${stageMarkData.book} ${stageMarkData.chapter}:`;
		}
		const stageLengths = [
			stageMarkData.book?.length ?? 0,
			stageMarkData.chapter?.toString().length ?? 0,
			stageMarkData.verse?.toString().length ?? 0,
		];
		setStageMarkData({
			stage,
			selectionStart: 0,
			selectionEnd: stageLengths[stage],
			currentValue: inputVal,
		});
	};

	const handleFilterNav = (e: KeyboardEvent) => {
		if (["ArrowDown", "ArrowUp", "Enter"].includes(e.key)) e.preventDefault();
		if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
			updateFilterStage(e);
		}
	};

	const updateSearchMode = () => {
		setScriptureControls(
			produce((store) => {
				store.searchMode = store.searchMode === "search" ? "special" : "search";
				store.query = "";
			}),
		);
	};

	const handleInputClick = (e: MouseEvent) => {
		if (scriptureControls.searchMode !== "special") return;
		e.preventDefault();
		console.log(e, searchInputRef.selectionStart, searchInputRef.selectionEnd);
		const stageOffsets: Record<number, number> = {
			0: 0,
			1: stageMarkData.book?.length ?? 0,
			2: stageMarkData.chapter?.toString().length ?? 0,
		};
		let clickedStage = 0;
		const stageLengths = [
			stageMarkData.book?.length ?? 0,
			(stageMarkData.chapter?.toString().length ?? 0) + 1,
			(stageMarkData.verse?.toString().length ?? 0) + 1,
		];

		let maxPos = 0;
		let selection: number[] = [];
		let inputVal = "";
		for (let i = 0; i < stageLengths.length; i++) {
			maxPos += stageLengths[i];
			if ((searchInputRef.selectionStart ?? 0) <= maxPos) {
				clickedStage = i;
				break;
			}
		}

		selection = [maxPos - stageLengths[clickedStage], maxPos];
		if (clickedStage === 1) {
			selection[0] += 1;
			inputVal = `${stageMarkData.book} `;
		} else if (clickedStage === 2) {
			selection[0] += 1;
			inputVal = `${stageMarkData.book} ${stageMarkData.chapter}:`;
		}
		console.log("Clicked Stage: ", clickedStage, selection, inputVal);
		// searchInputRef.setSelectionRange(selection[0], selection[1]);
		// searchInputRef.focus();

		setStageMarkData(
			produce((store) => {
				store.stage = clickedStage;
				store.selectionStart = 0;
				store.selectionEnd = stageLengths[clickedStage];
				store.currentValue = inputVal;
			}),
		);
		console.log({ ...stageMarkData });
	};

	const tabCenterContent = (
		<Text fontSize="11px" color="gray.500">
			{filteredScriptures().length.toLocaleString()} verses
			<Show when={scriptureControls.query}>{` matching search`}</Show>
		</Text>
	);

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
						onSpecialSearch={handleSpecialSearch}
						onInputClick={handleInputClick}
						setSearchInputRef={(el) => {
							searchInputRef = el;
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
				subgroupIcon={TbBook}
			/>
			<ControlTabDisplay
				open={scriptureControls.contextMenuOpen}
				setOpen={(v) => setScriptureControls("contextMenuOpen", v)}
				contextMenuContent={<MainDisplayMenuContent />}
				actionBarMenu={<MainActionBarMenu />}
				centerContent={tabCenterContent}
				ref={virtualizerParentRef}
			>
				<Switch>
					<Match when={filteredScriptures().length}>
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
													bgColor: "purple.900/30",
												},
											}}
											style={{
												height: `${virtualItem.size}px`,
												transform: `translateY(${virtualItem.start}px)`,
												...getBaseFocusStyles(SCRIPTURE_TAB_FOCUS_NAME),
												...getFocusableStyles(
													SCRIPTURE_TAB_FOCUS_NAME,
													isSelected(),
													isCurrentPanel(),
													isCurrent(),
												),
											}}
											data-panel={SCRIPTURE_TAB_FOCUS_NAME}
											data-focusId={virtualItem.index}
										>
											{/* Scripture icon */}
											<Box
												color={
													isSelected() && isCurrentPanel()
														? "purple.300"
														: "gray.500"
												}
												flexShrink={0}
												alignSelf="flex-start"
												mt="2px"
											>
												<TbBook2 size={16} />
											</Box>
											{/* Scripture info - single row */}
											<HStack gap={2} flex={1} minW={0} alignItems="center">
												{/* Main scripture text */}
												<Text
													fontSize="15px"
													color={
														isSelected() && isCurrentPanel()
															? "gray.100"
															: "gray.400"
													}
													truncate
													flex={1}
													minW={0}
												>
													{scripture.text}
												</Text>
												{/* Reference */}
												<Text
													fontWeight="medium"
													fontSize="14px"
													color={
														isSelected() && isCurrentPanel()
															? "gray.300"
															: "gray.500"
													}
													textTransform="capitalize"
													whiteSpace="nowrap"
													flexShrink={0}
												>
													{scripture.book_name} {scripture.chapter}:
													{scripture.verse}
												</Text>
												{/* Version badge */}
												<Box
													fontSize="9px"
													fontWeight="bold"
													color={
														isSelected() && isCurrentPanel()
															? "purple.200"
															: "gray.400"
													}
													textTransform="uppercase"
													letterSpacing="wide"
													flexShrink={0}
													bg={
														isSelected() && isCurrentPanel()
															? "purple.800/60"
															: "gray.800"
													}
													px={1.5}
													py={0.5}
													borderRadius="sm"
												>
													{scripture.version}
												</Box>
											</HStack>
										</HStack>
									);
								}}
							</For>
						</Box>
					</Match>
					<Match when={!allScriptures().length}>
						<VStack gap={3} w="full" h="full" justifyContent="center" px={6}>
							<Box color="gray.600">
								<TbBookOff size={48} />
							</Box>
							<VStack gap={1}>
								<Text textStyle="lg" fontWeight="medium" color="gray.200">
									No Scriptures Available
								</Text>
								<Text fontSize="13px" color="gray.500" textAlign="center">
									Select a Bible version from the sidebar to load scriptures
								</Text>
							</VStack>
						</VStack>
					</Match>
					<Match
						when={
							allScriptures() &&
							scriptureControls.query &&
							!filteredScriptures().length
						}
					>
						<VStack gap={3} w="full" h="full" justifyContent="center" px={6}>
							<Box color="gray.600">
								<TbSearch size={40} />
							</Box>
							<VStack gap={1}>
								<Text textStyle="md" fontWeight="medium" color="gray.200">
									No scriptures found
								</Text>
								<Text fontSize="13px" color="gray.500" textAlign="center">
									No verses match your search query
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
	filter: string;
	onFilter: JSX.EventHandlerUnion<HTMLInputElement, InputEvent>;
	onSpecialSearch: JSX.EventHandlerUnion<HTMLInputElement, InputEvent>;
	onInputClick: JSX.EventHandlerUnion<HTMLInputElement, MouseEvent>;
	searchMode: ScriptureSearchMode;
	updateSearchMode: () => void;
	setSearchInputRef: (el: HTMLInputElement) => void;
	markData: StageMarkData;
	handleKeyNav: JSX.EventHandlerUnion<HTMLInputElement, KeyboardEvent>;
}

const ScriptureSearchInput = (props: SearchInputProps) => {
	return (
		<InputGroup
			w="full"
			pr={1}
			bg="gray.900/50"
			borderBottom="1px solid"
			borderBottomColor="gray.800"
			_focusWithin={{
				borderColor: "purple.700",
				bg: "gray.900",
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
						props.searchMode === "special"
							? "Switch to search mode"
							: "Switch to reference mode"
					}
					title={
						props.searchMode === "special" ? "Reference search" : "Text search"
					}
				>
					<Show
						when={props.searchMode === "special"}
						fallback={<VsSearchFuzzy size={14} />}
					>
						<VsListTree size={14} />
					</Show>
				</IconButton>
			)}
			startElementProps={{ padding: 0, pointerEvents: "auto", pl: 1 }}
			endElement={() => (
				<Kbd
					variant="outline"
					size="sm"
					color="gray.500"
					borderColor="gray.700"
				>
					⌘B
				</Kbd>
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
				_placeholder={{ color: "gray.500" }}
				_selection={{
					bgColor: "purple.700",
				}}
				ref={props.setSearchInputRef}
				value={
					props.searchMode === "special" && props.markData.book
						? `${props.markData.book} ${props.markData.chapter}:${props.markData.verse}`
						: ""
				}
				placeholder={
					props.searchMode === "special" ? "Genesis 1:1" : "Search verses..."
				}
				onclick={
					props.searchMode === "special" ? props.onInputClick : undefined
				}
				onbeforeinput={
					props.searchMode === "special" ? props.onSpecialSearch : undefined
				}
				oninput={props.searchMode === "search" ? props.onFilter : undefined}
				onkeydown={
					props.searchMode === "special" ? props.handleKeyNav : undefined
				}
				textTransform={
					props.searchMode === "special" ? "capitalize" : "initial"
				}
				data-testid="scripture-search-input"
				aria-label="Search scriptures"
			/>
		</InputGroup>
	);
};
