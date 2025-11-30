import {
	createSignal,
	createEffect,
	createMemo,
	For,
	Show,
	Match,
	Switch,
	onMount,
	on,
} from "solid-js";
import { createStore, produce, unwrap } from "solid-js/store";
import { Box, Flex, HStack, VStack } from "styled-system/jsx";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { TbBook2, TbSearch, TbAlertCircle, TbCheck } from "solid-icons/tb";
import { VsSearchFuzzy } from "solid-icons/vs";
import type {
	StrongsEntry,
	StrongsDataStatus,
	StrongsBibleVerse,
	StrongsSection,
} from "~/types/context";
import { useFocusContext } from "~/layouts/FocusContext";
import { useAppContext } from "~/layouts/AppContext";
import { STRONGS_TAB_FOCUS_NAME, defaultPalette } from "~/utils/constants";
import SelectionGroups from "../SelectionGroups";
import ControlTabDisplay from "../ControlTabDisplay";
import type { PanelGroup } from "~/types/app-context";
import { css } from "styled-system/css";
import bibleData from "~/utils/parser/osis.json";
import bookInfo from "~/utils/parser/books.json";
import { IconButton } from "~/components/ui/icon-button";

type StrongsViewMode = "dictionary" | "scripture";
type ScriptureSearchMode = "search" | "special";

// Parse Strong's HTML data into displayable sections
function parseStrongsIntoSections(entry: StrongsEntry): StrongsSection[] {
	const word = entry.word;
	const html = entry.data;

	// Parse the HTML
	const parser = new DOMParser();
	const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
	const container = doc.body.firstChild as HTMLElement;

	if (!container) {
		return [
			{
				word,
				sectionIndex: 0,
				totalSections: 1,
				label: "Definition",
				content: html,
			},
		];
	}

	// Maximum characters per section for projection
	const MAX_CHARS = 50;

	// Collect all sections
	const rawSections: { type: string; content: string }[] = [];

	// Define section groupings - order matters for priority
	const sectionGroups: {
		label: string;
		patterns: string[];
		content: string[];
	}[] = [
		{
			label: "Overview",
			patterns: ["Original:", "Transliteration:", "Phonetic:"],
			content: [],
		},
		{
			label: "Origin",
			patterns: ["Origin:", "TWOT", "Part(s) of speech:"],
			content: [],
		},
		{
			label: "Strong's Definition",
			patterns: ["Strong's Definition:"],
			content: [],
		},
	];

	// Track BDB Definition separately for list splitting
	let bdbHeader = "";
	let bdbListElement: Element | null = null;

	// Track unmatched elements
	let unmatchedContent: string[] = [];

	// Process elements
	const elements = Array.from(container.children);

	for (const el of elements) {
		const elText = el.textContent || "";
		const elHtml = el.outerHTML;
		let matched = false;

		// Check known section patterns
		for (const group of sectionGroups) {
			if (group.patterns.some((pattern) => elText.includes(pattern))) {
				group.content.push(elHtml);
				matched = true;
				break;
			}
		}

		if (matched) continue;

		// Check for BDB/Definition header
		if (
			elText.includes("BDB Definition:") ||
			(elText.includes("Definition:") && !elText.includes("Strong's"))
		) {
			bdbHeader = elHtml;
			matched = true;
		} else if ((el.tagName === "OL" || el.tagName === "UL") && bdbHeader) {
			bdbListElement = el;
			matched = true;
		} else if (bdbHeader && !bdbListElement) {
			bdbHeader += elHtml;
			matched = true;
		}

		// Track unmatched elements (might be sections we don't know about)
		if (!matched && elText.trim()) {
			unmatchedContent.push(elHtml);
		}
	}

	// Add known section groups
	for (const group of sectionGroups) {
		if (group.content.length > 0) {
			rawSections.push({
				type: group.label,
				content: group.content.join(""),
			});
		}
	}

	// Process BDB Definition - split long content into manageable sections
	if (bdbListElement) {
		// For deeply nested structures, we need a different approach:
		// Find the deepest level where items are small enough to be sections

		type ListItem = {
			text: string;
			directText: string; // Text without nested list content
			element: Element;
			nestedList: Element | null;
			depth: number;
		};

		// Recursively find all items at each depth level
		const getAllItems = (listEl: Element, depth: number = 0): ListItem[] => {
			const items: ListItem[] = [];
			const directItems = Array.from(listEl.querySelectorAll(":scope > li"));

			for (const li of directItems) {
				const nestedList = li.querySelector(":scope > ol, :scope > ul");

				// Get direct text (without nested list)
				const clone = li.cloneNode(true) as Element;
				const nestedInClone = clone.querySelector("ol, ul");
				if (nestedInClone) nestedInClone.remove();
				const directText = clone.textContent || "";

				items.push({
					text: li.textContent || "",
					directText: directText.trim(),
					element: li,
					nestedList: nestedList,
					depth: depth,
				});

				// Recursively get nested items
				if (nestedList) {
					items.push(...getAllItems(nestedList, depth + 1));
				}
			}
			return items;
		};

		// Get all items flattened
		const allItems = getAllItems(bdbListElement);

		// Find items that are good section boundaries (have nested lists and direct text)
		// These are items like "a. (Qal)", "b. (Niphal)", or "i. to happen..."
		const sectionBoundaries: { item: ListItem; index: number }[] = [];

		for (let i = 0; i < allItems.length; i++) {
			const item = allItems[i];
			// Good boundary: has nested content OR is a leaf with reasonable size
			if (item.nestedList || item.text.length <= MAX_CHARS) {
				sectionBoundaries.push({ item, index: i });
			}
		}

		// Build sections by grouping content
		// Strategy: Each section should include an item and all its descendants until the next same-level item
		const definitionSections: { content: string }[] = [];

		// Recursive function to split lists - returns sections with proper start indices
		// Each section is { html: string, itemIndices: number[] } where itemIndices tracks the index at each depth
		const serializeListWithSplits = (
			listEl: Element,
			parentContext: {
				directHtml: string;
				tagName: string;
				typeAttr: string;
				itemIndex: number;
			}[] = [],
		): string[] => {
			const sections: string[] = [];
			const tagName = listEl.tagName.toLowerCase();
			const listType = listEl.getAttribute("type");
			const typeAttr = listType ? ` type="${listType}"` : "";

			const topItems = Array.from(listEl.querySelectorAll(":scope > li"));
			let currentItems: { html: string; index: number }[] = [];
			let currentCharCount = 0;

			// Helper to wrap content with parent context
			const wrapWithParents = (innerHtml: string, itemIdx: number): string => {
				let result = innerHtml;
				// Wrap from innermost to outermost
				const reversedContext = [...parentContext].reverse();
				for (const ctx of reversedContext) {
					const startAttr =
						ctx.itemIndex > 1 ? ` start="${ctx.itemIndex}"` : "";
					result = `<${ctx.tagName}${ctx.typeAttr}${startAttr}><li>${ctx.directHtml}${result}</li></${ctx.tagName}>`;
				}
				// Wrap with current list
				const startAttr = itemIdx > 1 ? ` start="${itemIdx}"` : "";
				return `<${tagName}${typeAttr}${startAttr}>${result}</${tagName}>`;
			};

			// Helper to flush current items as a section
			const flushCurrentItems = () => {
				if (currentItems.length === 0) return;

				const firstIdx = currentItems[0].index;
				const itemsHtml = currentItems.map((item) => item.html).join("");

				if (parentContext.length === 0) {
					// Top level - just wrap with list
					const startAttr = firstIdx > 1 ? ` start="${firstIdx}"` : "";
					sections.push(
						`<${tagName}${typeAttr}${startAttr}>${itemsHtml}</${tagName}>`,
					);
				} else {
					// Nested - wrap with parent context
					let result = itemsHtml;
					const startAttr = firstIdx > 1 ? ` start="${firstIdx}"` : "";
					result = `<${tagName}${typeAttr}${startAttr}>${result}</${tagName}>`;

					// Wrap with parents from innermost to outermost
					const reversedContext = [...parentContext].reverse();
					for (const ctx of reversedContext) {
						const ctxStartAttr =
							ctx.itemIndex > 1 ? ` start="${ctx.itemIndex}"` : "";
						result = `<${ctx.tagName}${ctx.typeAttr}${ctxStartAttr}><li>${ctx.directHtml}${result}</li></${ctx.tagName}>`;
					}
					sections.push(result);
				}

				currentItems = [];
				currentCharCount = 0;
			};

			for (let i = 0; i < topItems.length; i++) {
				const li = topItems[i];
				const itemIndex = i + 1; // 1-based index
				const itemText = li.textContent || "";
				const nestedList = li.querySelector(":scope > ol, :scope > ul");

				// If this item alone is too big AND has nested list, split the nested list
				if (itemText.length > MAX_CHARS && nestedList) {
					// First, flush current items if any
					flushCurrentItems();

					// Get the item's direct content (before nested list)
					const clone = li.cloneNode(true) as Element;
					const nestedInClone = clone.querySelector("ol, ul");
					if (nestedInClone) nestedInClone.remove();
					const directHtml = clone.innerHTML;

					// Build new parent context for recursive call
					const newContext = [
						...parentContext,
						{ directHtml, tagName, typeAttr, itemIndex },
					];

					// Recursively split the nested list
					const nestedSections = serializeListWithSplits(
						nestedList,
						newContext,
					);
					sections.push(...nestedSections);
				} else {
					// Item fits or is a leaf - add to current batch
					if (
						currentCharCount + itemText.length > MAX_CHARS &&
						currentItems.length > 0
					) {
						flushCurrentItems();
					}

					currentItems.push({ html: li.outerHTML, index: itemIndex });
					currentCharCount += itemText.length;
				}
			}

			// Flush remaining items
			flushCurrentItems();

			return sections;
		};

		const listSections = serializeListWithSplits(bdbListElement);

		// Create BDB Definition sections
		const totalDefSections = listSections.length;

		for (let i = 0; i < listSections.length; i++) {
			const label =
				totalDefSections === 1
					? "BDB Definition"
					: `BDB Definition ${i + 1}/${totalDefSections}`;

			rawSections.push({
				type: label,
				content: (i === 0 ? bdbHeader : "") + listSections[i],
			});
		}
	} else if (bdbHeader) {
		// BDB Definition without a list
		rawSections.push({
			type: "BDB Definition",
			content: bdbHeader,
		});
	}

	// Add any unmatched content as "Additional" section
	// This ensures we don't miss any unknown sections in the data
	if (unmatchedContent.length > 0) {
		rawSections.push({
			type: "Additional",
			content: unmatchedContent.join(""),
		});
	}

	// Convert to final sections format
	const sections: StrongsSection[] = rawSections.map((raw, index) => ({
		word,
		sectionIndex: index,
		totalSections: rawSections.length,
		label: raw.type,
		content: raw.content,
	}));

	// Ensure at least one section
	if (sections.length === 0) {
		sections.push({
			word,
			sectionIndex: 0,
			totalSections: 1,
			label: "Definition",
			content: html,
		});
	}

	return sections;
}

interface StrongsControlsData {
	group: "all" | "hebrew" | "greek";
	viewMode: StrongsViewMode;
	// Dictionary search
	dictQuery: string;
	// Scripture search
	scriptureSearchMode: ScriptureSearchMode;
	scriptureQuery: string;
	contextMenuOpen: boolean;
}

interface StageMarkData {
	book?: string;
	chapter?: number;
	verse?: number;
	stage: number;
	currentValue: string;
	selectionStart: number;
	selectionEnd: number;
}

// Parse Strong's tags from verse text
interface ParsedWord {
	text: string;
	strongsRef?: string; // e.g., "H430", "G2316"
	isStrongs: boolean;
}

function parseVerseWithStrongs(text: string): ParsedWord[] {
	const result: ParsedWord[] = [];
	// Pattern to match word followed by Strong's tag: word<WH123> or word<WG456>
	const tagPattern = /<W([HG])(\d+)>/g;
	let lastEnd = 0;
	let match;

	while ((match = tagPattern.exec(text)) !== null) {
		// Get text before this tag
		const beforeText = text.slice(lastEnd, match.index);
		if (beforeText) {
			// Split into words, last word gets the Strong's ref
			const words = beforeText.split(/(\s+)/);
			for (let i = 0; i < words.length; i++) {
				const word = words[i];
				if (!word) continue;

				// Last non-whitespace word gets the Strong's reference
				const isLastWord =
					i === words.length - 1 ||
					words.slice(i + 1).every((w) => /^\s*$/.test(w));

				if (/^\s+$/.test(word)) {
					// It's whitespace
					result.push({ text: word, isStrongs: false });
				} else if (isLastWord) {
					// Last word - attach Strong's ref
					result.push({
						text: word,
						strongsRef: `${match[1]}${match[2]}`,
						isStrongs: true,
					});
				} else {
					result.push({ text: word, isStrongs: false });
				}
			}
		}
		lastEnd = match.index + match[0].length;
	}

	// Handle remaining text after last tag
	const remaining = text.slice(lastEnd);
	if (remaining) {
		result.push({ text: remaining, isStrongs: false });
	}

	return result;
}

// Get book name from book number
function getBookName(bookNum: number): string {
	const book = bibleData.find((b) => b.order === bookNum);
	return book?.name || `Book ${bookNum}`;
}

export default function StrongsSelection() {
	const { appStore, setAppStore } = useAppContext();
	const [controls, setControls] = createStore<StrongsControlsData>({
		group: "all",
		viewMode: "scripture", // Default to scripture view
		dictQuery: "",
		scriptureSearchMode: "special",
		scriptureQuery: "",
		contextMenuOpen: false,
	});

	// Dictionary results
	const [dictResults, setDictResults] = createSignal<StrongsEntry[]>([]);
	const [selectedEntry, setSelectedEntry] = createSignal<StrongsEntry | null>(
		null,
	);

	// Scripture results
	const [scriptureVerses, setScriptureVerses] = createSignal<
		StrongsBibleVerse[]
	>([]);
	const [selectedVerse, setSelectedVerse] =
		createSignal<StrongsBibleVerse | null>(null);

	const [loading, setLoading] = createSignal(false);
	const [error, setError] = createSignal<string | null>(null);
	const [dataStatus, setDataStatus] = createSignal<StrongsDataStatus | null>(
		null,
	);

	// Scripture reference stage data (like ScriptureSelection)
	let searchInputRef!: HTMLInputElement;
	const allBooks = bibleData
		.map((obj) => ({ name: obj.name, id: obj.id, order: obj.order }))
		.toSorted((a, b) => a.order - b.order);

	const [stageMarkData, setStageMarkData] = createStore<StageMarkData>({
		stage: 0,
		book: "Genesis",
		chapter: 1,
		verse: 1,
		currentValue: "",
		selectionStart: 0,
		selectionEnd: 0,
	});

	// Load chapter verses
	const loadChapterVerses = async (book: number, chapter: number) => {
		setLoading(true);
		setError(null);
		try {
			const verses = await window.electronAPI.fetchStrongsBibleChapter({
				book,
				chapter,
			});
			setScriptureVerses(verses);
		} catch (err) {
			console.error("Failed to load Strong's Bible chapter:", err);
			setError("Failed to load verses");
		} finally {
			setLoading(false);
		}
	};

	// Load initial data on mount
	onMount(async () => {
		try {
			const status = await window.electronAPI.checkStrongsData();
			setDataStatus(status);

			// Load Genesis 1 as initial verses if Bible data is available
			if (status.hasBible) {
				await loadChapterVerses(1, 1);
			}
		} catch (err) {
			console.error("Failed to check Strong's data status:", err);
		}
	});

	const { subscribeEvent, currentPanel } = useFocusContext();
	const { name, coreFocusId, fluidFocusId, changeFluidFocus, changeFocus } =
		subscribeEvent({
			name: STRONGS_TAB_FOCUS_NAME,
			defaultCoreFocus: 0,
			defaultFluidFocus: 0,
			handlers: {
				ArrowDown: ({ fluidFocusId, changeFluidFocus, event }) => {
					const maxItems =
						controls.viewMode === "dictionary"
							? dictResults().length
							: scriptureVerses().length;
					const newId = Math.min((fluidFocusId ?? 0) + 1, maxItems - 1);
					changeFluidFocus(newId);
					if (controls.scriptureSearchMode === "special") {
						updateFilterStage(event);
					}
				},
				ArrowUp: ({ fluidFocusId, changeFluidFocus, event }) => {
					const newId = Math.max((fluidFocusId ?? 0) - 1, 0);
					changeFluidFocus(newId);
					if (controls.scriptureSearchMode === "special") {
						updateFilterStage(event);
					}
				},
				Enter: ({ fluidFocusId, changeFocus }) => {
					changeFocus(fluidFocusId);
					pushStrongsToLive(fluidFocusId, true);
				},
			},
			clickHandlers: {
				onClick: ({ changeFluidFocus, focusId, event }) => {
					if (typeof focusId === "number") {
						changeFluidFocus(focusId);
						setControls("contextMenuOpen", false);
					}
				},
				onDblClick: ({ changeFocus, focusId }) => {
					if (typeof focusId === "number") {
						changeFocus(focusId);
						pushStrongsToLive(focusId, true);
					}
				},
			},
		});

	const isCurrentPanel = createMemo(() => currentPanel() === name);

	// Groups for the sidebar
	const allGroups = createMemo(
		(): PanelGroup => ({
			scripture: {
				title: "Scripture",
				subGroups: null,
			},
			dictionary: {
				title: "Dictionary",
				subGroups: null,
			},
		}),
	);

	// ====== DICTIONARY SEARCH ======
	const handleDictSearch = async () => {
		const query = controls.dictQuery.trim();
		if (!query) {
			const entries = await window.electronAPI.getAllStrongs(100, 0);
			setDictResults(entries);
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const directMatch = query.match(/^([HG])(\d+)$/i);

			if (directMatch) {
				const result = await window.electronAPI.fetchStrongs(
					query.toUpperCase(),
				);
				setDictResults(result ? [result] : []);
			} else {
				const results = await window.electronAPI.searchStrongs(query);
				const filtered =
					controls.group === "all"
						? results
						: results.filter((r) =>
								controls.group === "hebrew"
									? r.word.startsWith("H")
									: r.word.startsWith("G"),
							);
				setDictResults(filtered);
			}
		} catch (err) {
			console.error("Error searching Strong's:", err);
			setError("Failed to search Strong's definitions");
		} finally {
			setLoading(false);
		}
	};

	// Debounced dictionary search
	let dictSearchTimeout: number;
	createEffect(() => {
		const query = controls.dictQuery;
		clearTimeout(dictSearchTimeout);

		if (query.length >= 2) {
			dictSearchTimeout = window.setTimeout(handleDictSearch, 300);
		} else if (query.length === 0 && controls.viewMode === "dictionary") {
			handleDictSearch();
		}
	});

	// ====== SCRIPTURE REFERENCE SEARCH ======
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
			if (
				e.data === " " &&
				newVal.split(" ").length > book.split(" ").length &&
				stageMarkData.stage < 2
			) {
				stage += 1;
			}
		} else {
			newVal = stageMarkData.currentValue.substring(
				0,
				stageMarkData.currentValue.length - 1,
			);
		}

		let extractedChapter: number = NaN;
		let extractedVerse: number = NaN;
		try {
			const d = newVal.matchAll(scripturePattern).toArray()[0];
			book = d[1];
			extractedChapter = parseInt(d[2]);
			extractedVerse = parseInt(d[3]);
			chapter = extractedChapter || 1;
			verse = extractedVerse || 1;

			if (stage === 1) {
				newVal = `${book} ${extractedChapter || ""}`;
			} else if (stage === 2) {
				newVal = `${book} ${chapter}:${extractedVerse || ""}`;
			}
		} catch (err) {
			console.error("Error in regex scripture search", err);
		}

		const foundBook = allBooks.find((b) =>
			b.name.toLowerCase().startsWith(book.toLowerCase()),
		) ?? {
			name: stageMarkData.book || allBooks[0].name,
			id: allBooks.find(
				(b) => b.name.toLowerCase() === stageMarkData.book?.toLowerCase(),
			)?.id,
			order: 1,
		};
		const bookMeta = bookInfo.find((b) => b.id === foundBook.id);
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

		if (foundBook && foundChapter && foundVerse) {
			setStageMarkData(
				produce((store) => {
					store.currentValue = newVal;
					store.book = foundBook.name;
					store.chapter = chapter;
					store.verse = verse;
					store.stage = stage;
					store.selectionStart = portionStart;
					store.selectionEnd = portionEnd;
				}),
			);
		}
	};

	const updateFilterStage = (e?: KeyboardEvent) => {
		let {
			book: currentBook,
			chapter: currentChapter,
			verse: currentVerse,
			stage,
		} = unwrap(stageMarkData);
		let inputVal = "";

		if (e) {
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

	// Auto-select input portion when stage changes
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
				if (
					controls.viewMode !== "scripture" ||
					controls.scriptureSearchMode !== "special"
				)
					return;

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

				searchInputRef?.focus();
				searchInputRef?.setSelectionRange(
					offset + stageMarkData.selectionStart,
					offset + stageMarkData.selectionEnd,
				);

				// Load chapter when book/chapter changes
				const bookOrder = allBooks.find(
					(b) => b.name.toLowerCase() === stageMarkData.book?.toLowerCase(),
				)?.order;
				if (bookOrder && stageMarkData.chapter) {
					loadChapterVerses(bookOrder, stageMarkData.chapter);
				}
			},
		),
	);

	// Scroll to selected verse
	createEffect(() => {
		const verses = scriptureVerses();
		const verse = stageMarkData.verse;
		if (verses.length && verse) {
			const verseIndex = verses.findIndex((v) => v.verse === verse);
			if (verseIndex > -1) {
				changeFluidFocus(verseIndex);
			}
		}
	});

	// Toggle search mode
	const updateSearchMode = () => {
		setControls(
			produce((store) => {
				store.scriptureSearchMode =
					store.scriptureSearchMode === "search" ? "special" : "search";
				store.scriptureQuery = "";
			}),
		);
	};

	// Handle group change (view mode change)
	const handleGroupChange = (value: string[]) => {
		if (value.length > 0) {
			const newMode = value[0] as "scripture" | "dictionary";
			setControls("viewMode", newMode);

			// Load initial data for the mode
			if (newMode === "dictionary" && dictResults().length === 0) {
				handleDictSearch();
			}
		}
	};

	// ====== STRONG'S CLICK HANDLERS ======
	const handleStrongsClick = async (strongsRef: string) => {
		try {
			const entry = await window.electronAPI.fetchStrongs(strongsRef);
			if (entry) {
				setSelectedEntry(entry);
				// Parse into sections for display
				const sections = parseStrongsIntoSections(entry);
				// Push to preview
				setAppStore("previewItem", {
					metadata: {
						title: `Strong's ${strongsRef}`,
						id: `strongs-${strongsRef}`,
					},
					type: "strongs",
					data: sections,
					index: 0,
				});
			}
		} catch (err) {
			console.error("Failed to fetch Strong's definition:", err);
		}
	};

	const handleStrongsDoubleClick = async (strongsRef: string) => {
		try {
			const entry = await window.electronAPI.fetchStrongs(strongsRef);
			if (entry) {
				setSelectedEntry(entry);
				// Parse into sections for display
				const sections = parseStrongsIntoSections(entry);
				// Push to live
				setAppStore("liveItem", {
					metadata: {
						title: `Strong's ${strongsRef}`,
						id: `strongs-${strongsRef}`,
					},
					type: "strongs",
					data: sections,
					index: 0,
				});
			}
		} catch (err) {
			console.error("Failed to fetch Strong's definition:", err);
		}
	};

	// Push verse or entry to live/preview
	const pushStrongsToLive = (itemId?: number | null, isLive?: boolean) => {
		if (typeof itemId !== "number" || !isCurrentPanel()) return;

		if (controls.viewMode === "dictionary") {
			const entry = dictResults()[itemId];
			if (entry) {
				// Parse into sections for display
				const sections = parseStrongsIntoSections(entry);
				setAppStore(isLive ? "liveItem" : "previewItem", {
					metadata: {
						title: `Strong's ${entry.word}`,
						id: `strongs-${entry.word}`,
					},
					type: "strongs",
					data: sections,
					index: 0,
				});
			}
		}
	};

	const isHebrew = (word: string) => word.startsWith("H");

	// Center content for the tab
	const centerContent = createMemo(() => {
		if (controls.viewMode === "scripture") {
			const verses = scriptureVerses();
			const bookName = stageMarkData.book || "Genesis";
			const chapter = stageMarkData.chapter || 1;
			return (
				<Text fontSize="11px" color="gray.500">
					{bookName} {chapter} - {verses.length} verses
				</Text>
			);
		} else {
			return (
				<Text fontSize="11px" color="gray.500">
					{dictResults().length.toLocaleString()} result
					{dictResults().length !== 1 ? "s" : ""}
					<Show
						when={controls.dictQuery}
					>{` for "${controls.dictQuery}"`}</Show>
				</Text>
			);
		}
	});

	// Get display value for scripture input
	const getDisplayValue = () => {
		if (controls.scriptureSearchMode === "special") {
			return `${stageMarkData.book || ""} ${stageMarkData.chapter || ""}:${stageMarkData.verse || ""}`.trim();
		}
		return controls.scriptureQuery;
	};

	return (
		<Flex h="full" pos="relative">
			<SelectionGroups
				searchInput={
					controls.viewMode === "scripture" ? (
						<HStack gap={1} flex={1}>
							<IconButton
								variant="ghost"
								size="xs"
								onClick={updateSearchMode}
								title={
									controls.scriptureSearchMode === "special"
										? "Switch to text search"
										: "Switch to reference search"
								}
							>
								{controls.scriptureSearchMode === "special" ? (
									<TbBook2 size={16} />
								) : (
									<VsSearchFuzzy size={16} />
								)}
							</IconButton>
							<Input
								ref={searchInputRef}
								type="text"
								placeholder={
									controls.scriptureSearchMode === "special"
										? "Genesis 1:1"
										: "Search verses..."
								}
								value={getDisplayValue()}
								onBeforeInput={
									controls.scriptureSearchMode === "special"
										? handleSpecialSearch
										: undefined
								}
								onInput={
									controls.scriptureSearchMode === "search"
										? (e) =>
												setControls("scriptureQuery", e.currentTarget.value)
										: undefined
								}
								onKeyDown={handleFilterNav}
								size="sm"
								flex={1}
							/>
						</HStack>
					) : (
						<Input
							type="text"
							placeholder="Search by number (H123) or keyword..."
							value={controls.dictQuery}
							onInput={(e) => setControls("dictQuery", e.currentTarget.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") handleDictSearch();
							}}
							size="sm"
							flex={1}
						/>
					)
				}
				currentGroup={[controls.viewMode]}
				currentSubgroup={null}
				groups={allGroups()}
				handleAccordionChange={handleGroupChange}
				subgroupIcon={TbBook2}
			/>

			<ControlTabDisplay
				open={controls.contextMenuOpen}
				setOpen={(v) => setControls("contextMenuOpen", v)}
				ref={(el) => {}}
				contextMenuContent={
					<Box p={4}>
						<Text fontSize="sm" color="gray.400">
							Strong's Concordance lookup tool
						</Text>
					</Box>
				}
				actionBarMenu={<></>}
				centerContent={centerContent()}
			>
				<Flex h="full" overflow="hidden">
					{/* Main Content */}
					<Box w="100%" h="full" overflowY="auto">
						<Switch>
							<Match when={loading()}>
								<VStack
									gap={3}
									w="full"
									h="full"
									justifyContent="center"
									px={6}
								>
									<Text color="gray.400">Loading...</Text>
								</VStack>
							</Match>

							<Match when={error()}>
								<VStack
									gap={3}
									w="full"
									h="full"
									justifyContent="center"
									px={6}
								>
									<Text color="red.400">{error()}</Text>
								</VStack>
							</Match>

							{/* SCRIPTURE VIEW */}
							<Match
								when={
									controls.viewMode === "scripture" &&
									scriptureVerses().length > 0
								}
							>
								<For each={scriptureVerses()}>
									{(verse, index) => {
										const isFocused = () => fluidFocusId() === index();
										const parsedWords = () => parseVerseWithStrongs(verse.text);

										return (
											<Box
												px={4}
												py={3}
												cursor="pointer"
												bg={isFocused() ? "gray.800" : "transparent"}
												borderBottom="1px solid"
												borderBottomColor="gray.800"
												_hover={{ bg: "gray.800/70" }}
												onClick={() => {
													changeFluidFocus(index());
													setSelectedVerse(verse);
												}}
											>
												<HStack gap={2} alignItems="flex-start">
													{/* Verse number */}
													<Text
														fontSize="xs"
														color={`${defaultPalette}.400`}
														fontWeight="bold"
														minW="24px"
														pt="2px"
													>
														{verse.verse}
													</Text>

													{/* Verse text with Strong's tags */}
													<Box flex={1} lineHeight="1.7">
														<For each={parsedWords()}>
															{(word) => (
																<>
																	{word.isStrongs ? (
																		<span
																			class={css({
																				cursor: "pointer",
																				_hover: {
																					bg: "gray.700",
																				},
																			})}
																			onClick={(e) => {
																				e.stopPropagation();
																				if (word.strongsRef) {
																					handleStrongsClick(word.strongsRef);
																				}
																			}}
																			onDblClick={(e) => {
																				e.stopPropagation();
																				if (word.strongsRef) {
																					handleStrongsDoubleClick(
																						word.strongsRef,
																					);
																				}
																			}}
																		>
																			<span class={css({ color: "gray.200" })}>
																				{word.text}
																			</span>
																			<span
																				class={css({
																					fontSize: "10px",
																					color: word.strongsRef?.startsWith(
																						"H",
																					)
																						? "blue.400"
																						: "green.400",
																					verticalAlign: "super",
																					ml: "1px",
																					fontFamily: "mono",
																					fontWeight: "bold",
																					padding: "1px 3px",
																					borderRadius: "sm",
																					bg: word.strongsRef?.startsWith("H")
																						? "blue.900/50"
																						: "green.900/50",
																					_hover: {
																						bg: word.strongsRef?.startsWith("H")
																							? "blue.800"
																							: "green.800",
																					},
																				})}
																			>
																				{word.strongsRef}
																			</span>
																		</span>
																	) : (
																		<span class={css({ color: "gray.300" })}>
																			{word.text}
																		</span>
																	)}
																</>
															)}
														</For>
													</Box>
												</HStack>
											</Box>
										);
									}}
								</For>
							</Match>

							{/* DICTIONARY VIEW */}
							<Match
								when={
									controls.viewMode === "dictionary" && dictResults().length > 0
								}
							>
								<For each={dictResults()}>
									{(entry, index) => {
										const isSelected = () =>
											selectedEntry()?.word === entry.word;
										const isFocused = () => fluidFocusId() === index();

										return (
											<Box
												px={4}
												py={3}
												cursor="pointer"
												bg={
													isSelected()
														? `${defaultPalette}.800`
														: isFocused()
															? "gray.800"
															: "transparent"
												}
												borderBottom="1px solid"
												borderBottomColor="gray.800"
												_hover={{
													bg: isSelected()
														? `${defaultPalette}.700`
														: "gray.800/70",
												}}
												onClick={() => {
													setSelectedEntry(entry);
													changeFluidFocus(index());
												}}
												onDblClick={() => {
													setAppStore("liveItem", {
														metadata: {
															title: `Strong's ${entry.word}`,
															id: `strongs-${entry.word}`,
														},
														type: "strongs",
														data: [entry],
														index: 0,
													});
												}}
											>
												<HStack gap={3}>
													<Box
														px={2}
														py={1}
														bg={isHebrew(entry.word) ? "blue.800" : "green.800"}
														borderRadius="md"
														fontFamily="mono"
														fontWeight="bold"
														fontSize="sm"
														minW="60px"
														textAlign="center"
													>
														{entry.word}
													</Box>
													<Text
														flex={1}
														fontSize="sm"
														color={isSelected() ? "gray.100" : "gray.400"}
														truncate
														innerHTML={
															entry.data
																.replace(/<[^>]+>/g, " ")
																.replace(/\s+/g, " ")
																.trim()
																.slice(0, 100) + "..."
														}
													/>
												</HStack>
											</Box>
										);
									}}
								</For>
							</Match>

							{/* EMPTY STATES */}
							<Match
								when={
									controls.viewMode === "scripture" &&
									scriptureVerses().length === 0 &&
									!loading()
								}
							>
								<VStack
									gap={4}
									w="full"
									h="full"
									justifyContent="center"
									px={6}
								>
									<Box color="gray.600">
										<TbBook2 size={48} />
									</Box>
									<VStack gap={2}>
										<Text textStyle="lg" fontWeight="medium" color="gray.200">
											Strong's Tagged Bible
										</Text>
										<Text
											fontSize="13px"
											color="gray.500"
											textAlign="center"
											maxW="300px"
										>
											Navigate to a scripture reference to view verses with
											Strong's numbers
										</Text>
									</VStack>

									<Show when={dataStatus()}>
										<DataStatusDisplay status={dataStatus()!} />
									</Show>
								</VStack>
							</Match>

							<Match
								when={
									controls.viewMode === "dictionary" &&
									dictResults().length === 0 &&
									!loading()
								}
							>
								<VStack
									gap={4}
									w="full"
									h="full"
									justifyContent="center"
									px={6}
								>
									<Box color="gray.600">
										<TbSearch size={48} />
									</Box>
									<VStack gap={2}>
										<Text textStyle="lg" fontWeight="medium" color="gray.200">
											Search Strong's Dictionary
										</Text>
										<Text
											fontSize="13px"
											color="gray.500"
											textAlign="center"
											maxW="300px"
										>
											Search by Strong's number (e.g., H430, G2316) or by
											keyword
										</Text>
									</VStack>
								</VStack>
							</Match>
						</Switch>
					</Box>
				</Flex>
			</ControlTabDisplay>
		</Flex>
	);
}

// Data status display component
function DataStatusDisplay(props: { status: StrongsDataStatus }) {
	return (
		<VStack gap={2} mt={6} p={3} bg="gray.800/50" borderRadius="md">
			<Text fontSize="xs" color="gray.500" textTransform="uppercase">
				Database Status
			</Text>
			<HStack gap={4}>
				<HStack gap={1}>
					<Show
						when={props.status.hasDictionary}
						fallback={<TbAlertCircle color="var(--colors-red-400)" />}
					>
						<TbCheck color="var(--colors-green-400)" />
					</Show>
					<Text
						fontSize="xs"
						color={props.status.hasDictionary ? "green.400" : "red.400"}
					>
						Dictionary
					</Text>
				</HStack>
				<HStack gap={1}>
					<Show
						when={props.status.hasBible}
						fallback={<TbAlertCircle color="var(--colors-red-400)" />}
					>
						<TbCheck color="var(--colors-green-400)" />
					</Show>
					<Text
						fontSize="xs"
						color={props.status.hasBible ? "green.400" : "red.400"}
					>
						Tagged Bible
					</Text>
				</HStack>
			</HStack>
		</VStack>
	);
}
