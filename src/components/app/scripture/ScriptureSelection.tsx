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
	createSignal,
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
	defaultPalette,
	defaultSupportingPalette,
	neutralPalette,
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
import { appLogger } from "~/utils/logger";

/**
 * Check if a verse string matches a target verse number.
 * Handles various verse formats:
 * - Exact match: "2" matches 2
 * - Ranges: "1-2" matches 1 and 2, "2-4" matches 2, 3, 4
 * - Subdivisions: "2a", "2b" match 2
 * - Combined: "1-2a" matches 1 and 2
 */
function verseMatches(
	verseStr: string | number,
	targetVerse: number | string,
): boolean {
	const verse = String(verseStr);
	const target =
		typeof targetVerse === "string" ? parseInt(targetVerse) : targetVerse;

	if (isNaN(target)) return false;

	// Check for exact match first (handles simple cases like "2" === 2)
	const simpleNum = parseInt(verse);
	if (!isNaN(simpleNum) && simpleNum === target && verse === String(target)) {
		return true;
	}

	// Check for verse ranges like "1-2", "2-4"
	const rangeMatch = verse.match(/^(\d+)-(\d+)/);
	if (rangeMatch) {
		const start = parseInt(rangeMatch[1]);
		const end = parseInt(rangeMatch[2]);
		if (target >= start && target <= end) {
			return true;
		}
	}

	// Check for verse subdivisions like "2a", "2b", "15b"
	const subdivisionMatch = verse.match(/^(\d+)[a-z]/i);
	if (subdivisionMatch) {
		const baseVerse = parseInt(subdivisionMatch[1]);
		if (baseVerse === target) {
			return true;
		}
	}

	// Check for simple numeric match (handles "2" matching 2)
	if (simpleNum === target) {
		return true;
	}

	return false;
}

/**
 * Find the best matching verse index from a list of scriptures.
 * Prefers exact matches over range/subdivision matches.
 * Returns -1 if no match found.
 */
function findBestVerseMatch(
	scriptures: ScriptureVerse[],
	book: string,
	chapter: number,
	targetVerse: number | string,
): number {
	const normalizedBook = book.toLowerCase();
	const target =
		typeof targetVerse === "string" ? parseInt(targetVerse) : targetVerse;

	let exactMatchIndex = -1;
	let rangeMatchIndex = -1;

	for (let i = 0; i < scriptures.length; i++) {
		const scripture = scriptures[i];
		if (
			scripture.book_name.toLowerCase() === normalizedBook &&
			scripture.chapter === chapter
		) {
			const verseStr = String(scripture.verse);

			// Check for exact match first
			if (verseStr === String(target)) {
				exactMatchIndex = i;
				break; // Exact match found, no need to continue
			}

			// Check for range/subdivision match (keep first one found)
			if (rangeMatchIndex === -1 && verseMatches(verseStr, target)) {
				rangeMatchIndex = i;
			}
		}
	}

	// Prefer exact match, fall back to range match
	return exactMatchIndex !== -1 ? exactMatchIndex : rangeMatchIndex;
}

const allBooks = bibleData
	.map((obj) => ({ name: obj.name, id: obj.id }))
	.sort((a, b) => a.name.localeCompare(b.name));

function parseScriptureInput(input: string): {
	book: string | null;
	chapter: number | null;
	verse: number | null;
} {
	if (!input) return { book: null, chapter: null, verse: null };

	// Normalize input:
	// 1. Lowercase
	// 2. Add spaces around digits to separate them from letters (e.g. "1sam" -> "1 sam", "gen1" -> "gen 1")
	// 3. Replace colons with spaces
	// 4. Collapse multiple spaces
	const normalized = input.toLowerCase()
		.replace(/(\d+)/g, " $1 ")
		.replace(/[:]/g, " ")
		.replace(/\s+/g, " ")
		.trim();

	const tokens = normalized.split(" ");
	
	let bestBook: { name: string; id: string } | null = null;
	let usedTokens = 0;
	
	// Try to match the longest sequence of tokens to a book name
	let currentStr = "";
	let candidateBooks = allBooks;

	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];
		const nextStr = currentStr ? currentStr + " " + token : token;
		
		// Find books that start with nextStr
		// Note: allBooks are sorted alphabetically
		const nextCandidates = candidateBooks.filter(b => 
			b.name.toLowerCase().startsWith(nextStr)
		);
		
		if (nextCandidates.length === 0) {
			// No matches for nextStr.
			// The previous match (currentStr) is the best we can do.
			break;
		}
		
		// We have matches, continue to see if we can be more specific
		candidateBooks = nextCandidates;
		currentStr = nextStr;
		usedTokens = i + 1;
	}
	
	if (candidateBooks.length > 0) {
		// We found at least one book matching the prefix.
		// Pick the first one (alphabetical).
		bestBook = candidateBooks[0];
		
		// Parse chapter and verse from remaining tokens
		const remainingTokens = tokens.slice(usedTokens);
		const chapter = remainingTokens.length > 0 ? parseInt(remainingTokens[0]) : null;
		const verse = remainingTokens.length > 1 ? parseInt(remainingTokens[1]) : null;
		
		return {
			book: bestBook.name,
			chapter: isNaN(chapter!) ? null : chapter,
			verse: isNaN(verse!) ? null : verse
		};
	}

	return { book: null, chapter: null, verse: null };
}

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
	inputValue: string;
	interpretedValue?: string;
};

interface StageMarkData {
	book?: string;
	chapter?: number;
	verse?: number | string;
	stage: number;
	currentValue: string;
	selectionStart: number;
	selectionEnd: number;
}

export default function ScriptureSelection() {
	const { appStore, setAppStore, settings } = useAppContext();
	const [scriptureControls, setScriptureControls] =
		createStore<ScriptureControlsData>({
			group: "all",
			collection: null,
			searchMode: "special",
			query: "",
			filter: "",
			contextMenuOpen: false,
			translation: "NKJV",
			inputValue: "",
			interpretedValue: "",
		});
	const allScriptures = createAsyncMemo(async () => {
		// const updated = appStore.scripturesUpdateCounter
		console.log("Translation: ", scriptureControls.translation);
		const results = await window.electronAPI.fetchAllScripture(
			scriptureControls.translation,
		);
		return results;
	}, []);

	// Search scriptures using backend FTS5 trigram search
	const searchedScriptures = createAsyncMemo(async () => {
		if (!scriptureControls.query.trim()) return null;
		return await window.electronAPI.searchScriptures(
			scriptureControls.query,
			scriptureControls.translation,
		);
	}, null);

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

	let searchInputRef!: HTMLInputElement;

	const filteredScriptures = createMemo<ScriptureVerse[]>(() => {
		console.log(
			"All Groups: ",
			allGroups(),
			currentGroup(),
			scriptureControls.translation,
		);

		const query = scriptureControls.query.trim();

		// If there's a search query, use FTS5 results
		if (query) {
			const ftsResults = searchedScriptures();
			if (ftsResults && ftsResults.length > 0) {
				return ftsResults;
			}
			return []; // No results found
		}

		// No query - return all scriptures
		return allScriptures();
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

	let globalChangeFluidFocus: ((id: number) => void) | undefined;
	let globalFluidFocusId: (() => number | undefined) | undefined;

	const toggleSearchMode = (currentFluidId?: number | null) => {
		const wasSearch = scriptureControls.searchMode === "search";

		// Capture current scripture
		let targetScripture: ScriptureVerse | null = null;
		const focusId =
			typeof currentFluidId === "number" ? currentFluidId : globalFluidFocusId?.();

		if (wasSearch && typeof focusId === "number") {
			targetScripture = filteredScriptures()[focusId];
		}

		setScriptureControls(
			produce((store) => {
				store.searchMode = store.searchMode === "search" ? "special" : "search";
				store.query = "";
			}),
		);

		if (wasSearch) {
			if (targetScripture) {
				setScriptureControls(
					"inputValue",
					`${targetScripture.book_name} ${targetScripture.chapter}:${targetScripture.verse}`,
				);

				// Find index in allScriptures and update focus
				const all = allScriptures();
				if (all && globalChangeFluidFocus) {
					const index = findBestVerseMatch(
						all,
						targetScripture.book_name,
						targetScripture.chapter,
						targetScripture.verse,
					);
					if (index > -1) {
						globalChangeFluidFocus(index);
						// Defer scrolling to allow virtualizer to update with new count
						setTimeout(() => {
							rowVirtualizer().scrollToIndex(index, { align: "center" });
						}, 50);
					}
				}
			} else {
				setScriptureControls("inputValue", "Genesis 1:1");
			}
		} else {
			setTimeout(() => {
				searchInputRef?.focus();
			}, 0);
		}
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
					filteredScriptures().length - 1,
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
				event,
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
			f: ({ event, fluidFocusId }) => {
				if (event.ctrlKey) {
					event.preventDefault();
					toggleSearchMode(fluidFocusId);
				}
			},
			F: ({ event, fluidFocusId }) => {
				if (event.ctrlKey) {
					event.preventDefault();
					toggleSearchMode(fluidFocusId);
				}
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
	globalChangeFluidFocus = changeFluidFocus;
	globalFluidFocusId = () => {
		const val = fluidFocusId();
		return val === null ? undefined : val;
	};
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

	// Track if we need to push to live after translation changes
	let pushToLiveAfterTranslationChange = false;

	// Handle double-click on translation in left menu - push current scripture to live
	function handleTranslationDblClick(translationId: number) {
		const translation = allTranslations().find((t) => t.id === translationId);
		if (!translation) return;

		// If already on this translation, just push current to live
		if (scriptureControls.translation === translation.version) {
			const fluidId = fluidFocusId();
			if (typeof fluidId === "number") {
				pushToLive(fluidId, true);
			}
		} else {
			// Mark that we want to push to live after translation loads
			pushToLiveAfterTranslationChange = true;
		}
	}

	// Effect to push to live after translation change completes
	createEffect(() => {
		const scriptures = filteredScriptures();
		const currentTranslation = scriptureControls.translation;

		if (
			pushToLiveAfterTranslationChange &&
			scriptures.length > 0 &&
			scriptures[0]?.version?.toUpperCase() === currentTranslation.toUpperCase()
		) {
			// Translation has loaded, now push to live
			const fluidId = fluidFocusId();
			if (typeof fluidId === "number") {
				pushToLive(fluidId, true);
			}
			pushToLiveAfterTranslationChange = false;
		}
	});

	// scroll to current fluid item when navigating (not on panel focus change)
	createEffect(
		on(
			() => fluidFocusId(),
			(focusId) => {
				if (typeof focusId === "number" && filteredScriptures().length) {
					rowVirtualizer().scrollToIndex(focusId);
				}
			},
			{ defer: true },
		),
	);

	// Track the currently selected scripture reference for translation changes
	// This stores the reference independently of the input value
	let selectedScriptureRef: {
		book_name: string;
		chapter: number;
		verse: string;
		translation: string;
	} | null = null;

	// Re-sync selected verse when translation changes
	// This ensures the same book/chapter/verse stays selected even though the index might change
	let previousTranslation = scriptureControls.translation;
	createEffect(() => {
		const currentTranslation = scriptureControls.translation;
		const scriptures = filteredScriptures();

		// Only re-sync if translation actually changed and we have scriptures loaded
		// Also verify that the scriptures are from the NEW translation (async data has loaded)
		if (
			currentTranslation !== previousTranslation &&
			scriptures.length > 0 &&
			selectedScriptureRef &&
			scriptures[0]?.version?.toUpperCase() === currentTranslation.toUpperCase()
		) {
			const scriptureIndex = findBestVerseMatch(
				scriptures,
				selectedScriptureRef!.book_name,
				selectedScriptureRef!.chapter,
				selectedScriptureRef!.verse,
			);
			console.log(
				"Translation changed, re-syncing focus:",
				previousTranslation,
				"->",
				currentTranslation,
				selectedScriptureRef,
				"New index:",
				scriptureIndex,
			);
			if (scriptureIndex > -1) {
				changeFluidFocus(scriptureIndex);
				// Update the translation in selectedScriptureRef after successful re-sync
				selectedScriptureRef.translation = currentTranslation;
			}
			previousTranslation = currentTranslation;
		}
	});

	// Sync from schedule item click - scroll to the scripture if it exists
	// Switches to the schedule item's translation
	const [pendingSyncData, setPendingSyncData] = createSignal<{
		book: string;
		chapter: number;
		verse: number;
		translation: string;
	} | null>(null);

	createEffect(
		on(
			() => appStore.syncFromSchedule,
			(syncData) => {
				if (!syncData || syncData.type !== "scripture") return;
				if (scriptureControls.searchMode !== "special") return; // Don't sync in search mode

				const metadata = syncData.metadata;
				if (!metadata?.id) return;

				// Parse the id format: "book-chapter-verse" (e.g., "genesis-1-1")
				const idParts = String(metadata.id).split("-");
				if (idParts.length < 3) return;

				// Handle multi-word book names (e.g., "1-samuel-1-1" -> book = "1 samuel")
				const verseStr = idParts.pop()!;
				const chapterStr = idParts.pop()!;
				const book = idParts.join(" ");
				const chapter = parseInt(chapterStr);
				const verse = parseInt(verseStr);

				if (isNaN(chapter) || isNaN(verse)) return;

				// Extract translation from title, e.g., "Genesis 1:1 (NKJV)" -> "NKJV"
				const titleMatch = metadata.title?.match(/\(([A-Z]+)\)\s*$/);
				const translation = titleMatch
					? (titleMatch[1] as AvailableTranslation)
					: scriptureControls.translation;

				// Store sync data for pending sync
				setPendingSyncData({ book, chapter, verse, translation });

				if (translation !== scriptureControls.translation) {
					// Switch translation - the pending sync will be handled when scriptures reload
					setScriptureControls("translation", translation);
				}
				// Note: Don't try to sync immediately here - let the pending sync effect handle it
				// This ensures consistent behavior whether translation changed or not

				// Clear the sync trigger
				setAppStore("syncFromSchedule", null);
			},
			{ defer: true },
		),
	);

	// Handle pending sync when scriptures load (after translation change)
	createEffect(() => {
		const scriptures = filteredScriptures();
		const syncData = pendingSyncData();

		if (syncData && scriptures.length > 0) {
			// Verify the scriptures are from the expected translation
			if (
				scriptures[0]?.version?.toUpperCase() ===
				syncData.translation.toUpperCase()
			) {
				const { book, chapter, verse } = syncData;
				const matchIndex = findBestVerseMatch(scriptures, book, chapter, verse);
				if (matchIndex > -1) {
					changeFluidFocus(matchIndex);
				}
				setPendingSyncData(null);
			}
		}
	});

	// Update the selected scripture reference whenever fluid focus changes
	// Only update if the scriptures are from the current translation to avoid race conditions
	createEffect(() => {
		const fluidId = fluidFocusId();
		const scriptures = filteredScriptures();
		const currentTranslation = scriptureControls.translation;

		if (typeof fluidId === "number" && scriptures.length > 0) {
			const scripture = scriptures[fluidId];
			// Only update selectedScriptureRef if the scripture is from the current translation
			// This prevents corrupting the reference during translation switch
			if (
				scripture &&
				scripture.version?.toUpperCase() === currentTranslation.toUpperCase()
			) {
				selectedScriptureRef = {
					book_name: scripture.book_name,
					chapter: scripture.chapter,
					verse: scripture.verse,
					translation: currentTranslation,
				};
			}
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

	// send current fluid item to preview-menu
	createEffect(() => {
		const fluidId = fluidFocusId();
		if (typeof fluidId === "number") {
			pushToLive(fluidId, false);
		}
	});

	let isInputDrivenFocus = false;

	// Update input value when navigating in special mode
	createEffect(() => {
		const fluidId = fluidFocusId();

		if (isInputDrivenFocus) {
			isInputDrivenFocus = false;
			return;
		}

		if (
			scriptureControls.searchMode === "special" &&
			typeof fluidId === "number"
		) {
			const scripture = filteredScriptures()[fluidId];
			if (scripture) {
				setScriptureControls(
					"inputValue",
					`${scripture.book_name} ${scripture.chapter}:${scripture.verse}`,
				);
			}
		}
	});

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
				if (settings.scriptureInputMode !== "controlled") return;

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

				if (searchInputRef) {
					searchInputRef.focus();
					searchInputRef.setSelectionRange(
						offset + stageMarkData.selectionStart,
						offset + stageMarkData.selectionEnd,
					);
				}
				updateControlledFluidFocus();
			},
		),
	);

	const updateControlledFluidFocus = () => {
		if (settings.scriptureInputMode !== "controlled") return;

		const scriptureIndex = findBestVerseMatch(
			filteredScriptures(),
			stageMarkData.book ?? "",
			stageMarkData.chapter ?? 1,
			stageMarkData.verse ?? 1,
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
		let book: string = stageMarkData.book ?? "";
		let chapter: number = stageMarkData.chapter ?? 1;
		let verse: number =
			typeof stageMarkData.verse === "string"
				? parseInt(stageMarkData.verse) || 1
				: (stageMarkData.verse ?? 1);
		let newVal;
		if (e.data) {
			newVal = stageMarkData.currentValue + e.data;
		} else {
			if (
				stageMarkData.currentValue.length === 0 &&
				stageMarkData.stage > 0 &&
				stageMarkData.stage < 2
			) {
				stage -= 1;
				newVal = "";
			} else {
				newVal = stageMarkData.currentValue.substring(
					0,
					stageMarkData.currentValue.length - 1,
				);
			}
		}

		let invalidFilter = false;
		let extractedChapter: number = NaN;
		let extractedVerse: number = NaN;
		try {
			if (stage === 1) {
				extractedChapter = parseInt(newVal);
				if (isNaN(extractedChapter)) invalidFilter = true;
			} else if (stage === 2) {
				extractedVerse = parseInt(newVal);
				if (isNaN(extractedVerse)) invalidFilter = true;
			}
		} catch (err) {
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
			book = foundBook.name;
			portionStart = newVal.length;
			portionEnd = book.length;
		} else if (stage === 1) {
			chapter = extractedChapter || chapter;
			portionStart = newVal.length;
			portionEnd = newVal.length;
		} else if (stage === 2) {
			verse = extractedVerse || verse;
			portionStart = newVal.length;
			portionEnd = newVal.length;
		}

		if (foundBook && foundChapter && foundVerse) {
			if (!invalidFilter) {
				setStageMarkData({
					stage,
					book,
					chapter,
					verse,
					currentValue: newVal,
					selectionStart: portionStart,
					selectionEnd: portionEnd,
				});
			}
		}
	};

	const updateFilterStage = (e?: KeyboardEvent) => {
		if (settings.scriptureInputMode !== "controlled") return;

		const target = searchInputRef as HTMLInputElement;

		let {
			book: currentBook,
			chapter: currentChapter,
			verse: currentVerse,
			stage,
		} = unwrap(stageMarkData);
		let inputVal = "";

		if (e) {
			if (e.key === " ") {
				stage = Math.min(stage + 1, 2);
			} else if (e.key === "Backspace" && stageMarkData.currentValue === "") {
				stage = Math.max(stage - 1, 0);
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
		if (settings.scriptureInputMode !== "controlled") return;

		if (["ArrowDown", "ArrowUp", "Enter"].includes(e.key)) e.preventDefault();
	};

	const handleFilter = (e: InputEvent) => {
		setScriptureControls("query", (e.target as HTMLInputElement).value);
	};

	// Reset focus to first item when search query changes
	createEffect(
		on(
			() => scriptureControls.query,
			() => {
				// Reset to first result when query changes
				if (filteredScriptures().length > 0) {
					changeFluidFocus(0);
				} else {
					changeFluidFocus(null);
				}
			},
		),
	);

	let highlightInput!: HTMLParagraphElement;

	const handlerUpdateFluidFocus = (
		book: string,
		chapter: number,
		verse: number,
		fromInput = false,
	) => {
		const scriptureIndex = findBestVerseMatch(
			filteredScriptures(),
			book,
			chapter,
			verse,
		);
		console.log("Found Index: ", scriptureIndex, book, chapter, verse);
		if (scriptureIndex > -1 && scriptureIndex !== fluidFocusId()) {
			if (fromInput) isInputDrivenFocus = true;
			changeFluidFocus(scriptureIndex);
		}
	};

	const handleInputChange = (e: InputEvent) => {
		if (
			settings.scriptureInputMode === "controlled" &&
			scriptureControls.searchMode === "special"
		) {
			handleSpecialSearch(e);
			return;
		}

		const target = e.target as HTMLInputElement;
		const newValue = target.value;

		setScriptureControls("inputValue", newValue);

		if (scriptureControls.searchMode === "special") {
			const { book, chapter, verse } = parseScriptureInput(newValue);
			if (book) {
				handlerUpdateFluidFocus(book, chapter ?? 1, verse ?? 1, true);
			}
		}
	};

	const updateSearchMode = () => {
		toggleSearchMode(fluidFocusId());
	};

	const handleInputClick = (e: MouseEvent) => {
		// Always change focus panel to scriptures when clicking the input
		changeFocusPanel(name);

		if (
			settings.scriptureInputMode === "controlled" &&
			scriptureControls.searchMode === "special"
		) {
			e.preventDefault();
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
				inputVal = `${stageMarkData.book} `;
			} else if (clickedStage === 2) {
				inputVal = `${stageMarkData.book} ${stageMarkData.chapter}:`;
			}

			setStageMarkData(
				produce((store) => {
					store.stage = clickedStage;
					store.selectionStart = 0;
					store.selectionEnd = stageLengths[clickedStage];
					store.currentValue = inputVal;
				}),
			);
		}
	};

	const interpretedScripture = createMemo(() => {
		const input =
			scriptureControls.searchMode === "special"
				? scriptureControls.inputValue
				: scriptureControls.query;
		if (!input) return null;
		const { book, chapter, verse } = parseScriptureInput(input);
		if (!book) return null;
		return `${book} ${chapter ?? 1}:${verse ?? 1}`;
	});

	// Auto-complete the input when the user presses Tab or Enter
	const handleInputKeyDown = (e: KeyboardEvent) => {
		if (
			settings.scriptureInputMode === "controlled" &&
			scriptureControls.searchMode === "special"
		) {
			handleFilterNav(e);
			updateFilterStage(e);
			return;
		}

		const isCraterMode = settings.scriptureInputMode === "crater";

		if (e.key === "Tab" || e.key === "Enter") {
			const interpreted = interpretedScripture();
			if (interpreted && scriptureControls.searchMode === "special") {
				e.preventDefault();
				if (isCraterMode) {
					// Use space instead of colon for the input value to make navigation easier
					setScriptureControls("inputValue", interpreted.replace(":", " "));
				}
				// Also ensure we navigate to it
				const { book, chapter, verse } = parseScriptureInput(
					isCraterMode ? interpreted : scriptureControls.inputValue,
				);
				if (book) {
					handlerUpdateFluidFocus(book, chapter ?? 1, verse ?? 1);
				}
			}
		} else if (
			e.key === " " &&
			scriptureControls.searchMode === "special" &&
			isCraterMode
		) {
			// Autocomplete book on space
			const input = scriptureControls.inputValue;
			const { book } = parseScriptureInput(input);
			if (book && !input.includes(" ")) {
				e.preventDefault();
				setScriptureControls("inputValue", book + " ");
				// Navigate to book chapter 1 verse 1
				handlerUpdateFluidFocus(book, 1, 1, true);
			}
		}
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
						inputValue={scriptureControls.inputValue}
						interpretedValue={interpretedScripture()}
						onFilter={handleFilter}
						onInputChange={handleInputChange}
						onInputClick={handleInputClick}
						onKeyDown={handleInputKeyDown}
						setSearchInputRef={(el) => {
							searchInputRef = el;
						}}
						scriptureInputMode={settings.scriptureInputMode}
						markData={stageMarkData}
					/>
				}
				currentGroup={[scriptureControls.group]}
				currentSubgroup={scriptureControls.collection}
				groups={allGroups()}
				handleAccordionChange={handleGroupAccordionChange}
				onSubgroupDblClick={handleTranslationDblClick}
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
													bgColor: `${defaultPalette}.900/30`,
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
														? `${defaultPalette}.300`
														: `${neutralPalette}.500`
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
													fontWeight={isSelected() ? "medium" : "normal"}
													fontSize="15px"
													truncate
													flex={1}
													minW={0}
													style={{
														color:  isSelected() && isCurrentPanel()
															? token.var("colors.gray.300")
															: token.var(`colors.${neutralPalette}.100`)
													}}
												>
													{scripture.text}
												</Text>
												{/* Reference */}
												<Text
													fontWeight="medium"
													fontSize="14px"
													color={
														isSelected() && isCurrentPanel()
															? `${neutralPalette}.300`
															: `${neutralPalette}.500`
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
															? `${defaultPalette}.200`
															: "gray.400"
													}
													textTransform="uppercase"
													letterSpacing="wide"
													flexShrink={0}
													bg={
														isSelected() && isCurrentPanel()
															? `${defaultPalette}.800/60`
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
	inputValue: string;
	interpretedValue?: string | null;
	onFilter: JSX.EventHandlerUnion<HTMLInputElement, InputEvent>;
	onInputChange: JSX.EventHandlerUnion<HTMLInputElement, InputEvent>;
	onInputClick: JSX.EventHandlerUnion<HTMLInputElement, MouseEvent>;
	onKeyDown?: JSX.EventHandlerUnion<HTMLInputElement, KeyboardEvent>;
	searchMode: ScriptureSearchMode;
	updateSearchMode: () => void;
	setSearchInputRef: (el: HTMLInputElement) => void;
	scriptureInputMode: "controlled" | "crater";
	markData?: StageMarkData;
}

const ScriptureSearchInput = (props: SearchInputProps) => {
	return (
		<VStack gap={0} w="full">
			<InputGroup
				w="full"
				pr={1}
				bg="gray.900/50"
				// borderBottom="1px solid"
				// borderBottomColor="gray.800"
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
						⌘F
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
					color="gray.200"
					lineHeight={2}
					letterSpacing={0.4}
					_placeholder={{ color: `${neutralPalette}.500` }}
					_selection={{
						bgColor: `white`,
						color: "black",
						fontWeight: 500,
					}}
					ref={props.setSearchInputRef}
					value={
						props.searchMode === "special" &&
						props.scriptureInputMode === "controlled" &&
						props.markData?.book
							? `${props.markData.book} ${props.markData.chapter}:${props.markData.verse}`
							: props.searchMode === "special"
								? props.inputValue
								: props.query
					}
					placeholder={
						props.searchMode === "special" ? "Genesis 1:1" : "Search verses..."
					}
					onclick={props.onInputClick}
					oninput={
						props.searchMode === "search" ? props.onFilter : props.onInputChange
					}
					onkeydown={props.onKeyDown}
					textTransform={
						props.searchMode === "special" ? "capitalize" : "initial"
					}
					data-testid="scripture-search-input"
					aria-label="Search scriptures"
				/>
			</InputGroup>
			<Show
				when={
					props.searchMode === "special" && props.scriptureInputMode === "crater"
				}
			>
				<Box
					w="full"
					px={2}
					py={1}
					bg="gray.900/30"
					// borderBottom="1px solid"
					// borderBottomColor="gray.800"
				>
					<Text fontSize="13px" color="gray.500">
						Interpreted:{" "}
						<Text as="span" color="gray.300">
							{props.interpretedValue || "..."}
						</Text>
					</Text>
				</Box>
			</Show>
		</VStack>
	);
};
