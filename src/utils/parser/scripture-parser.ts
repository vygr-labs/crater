/**
 * Scripture Text Parser
 *
 * Parses special formatting in scripture text:
 * - <WH####> / <WG####> - Strong's references (Hebrew/Greek)
 * - <FI>...<Fi> - Italicized (translator-added) words
 * - <RF>...<Rf> - Footnotes
 * - <CM> - End marker
 *
 * Example input:
 * "And the LORD<WH3068> God<WH430> formed<WH3335> man<WH120> <FI>of<Fi> the dust..."
 */

export interface StrongsReference {
	number: string; // e.g., "H3068", "G5315"
	type: "hebrew" | "greek";
	originalTag: string; // e.g., "WH3068", "WG5315"
	position: number; // Position in the original text
	precedingWord?: string; // The word this reference is attached to
}

export interface ParsedScriptureText {
	plainText: string; // Text with all tags removed
	displayText: string; // Text formatted for display (with italics markers)
	strongsReferences: StrongsReference[];
	footnotes: string[];
	hasItalics: boolean;
}

export interface ScriptureWord {
	text: string;
	strongs?: StrongsReference;
	isItalic: boolean;
	isFootnote: boolean;
}

// Regex patterns
const STRONGS_PATTERN = /<W([HG])(\d+)>/g;
const ITALICS_PATTERN = /<FI>(.*?)<Fi>/gi;
const FOOTNOTE_PATTERN = /<RF>(.*?)<Rf>/gi;
const END_MARKER_PATTERN = /<CM>/g;
const ALL_TAGS_PATTERN = /<[^>]+>/g;

/**
 * Extract all Strong's references from scripture text
 */
export function extractStrongsReferences(text: string): StrongsReference[] {
	const references: StrongsReference[] = [];
	let match: RegExpExecArray | null;

	// Reset regex lastIndex
	STRONGS_PATTERN.lastIndex = 0;

	while ((match = STRONGS_PATTERN.exec(text)) !== null) {
		const type = match[1] === "H" ? "hebrew" : "greek";
		const number = `${match[1]}${match[2]}`;

		// Find the preceding word (text before this tag, after any previous tag)
		const textBefore = text.substring(0, match.index);
		const precedingWordMatch = textBefore.match(/(\S+)\s*$/);
		const precedingWord = precedingWordMatch
			? precedingWordMatch[1].replace(ALL_TAGS_PATTERN, "")
			: undefined;

		references.push({
			number,
			type,
			originalTag: `W${match[1]}${match[2]}`,
			position: match.index,
			precedingWord,
		});
	}

	return references;
}

/**
 * Extract footnotes from scripture text
 */
export function extractFootnotes(text: string): string[] {
	const footnotes: string[] = [];
	let match: RegExpExecArray | null;

	FOOTNOTE_PATTERN.lastIndex = 0;

	while ((match = FOOTNOTE_PATTERN.exec(text)) !== null) {
		footnotes.push(match[1]);
	}

	return footnotes;
}

/**
 * Parse scripture text and extract all components
 */
export function parseScriptureText(text: string): ParsedScriptureText {
	const strongsReferences = extractStrongsReferences(text);
	const footnotes = extractFootnotes(text);

	// Check for italics
	const hasItalics = ITALICS_PATTERN.test(text);
	ITALICS_PATTERN.lastIndex = 0;

	// Create display text (with italics converted to markers)
	let displayText = text
		.replace(ITALICS_PATTERN, "_$1_") // Convert italics to markdown-style
		.replace(FOOTNOTE_PATTERN, "") // Remove footnotes
		.replace(END_MARKER_PATTERN, "") // Remove end markers
		.replace(STRONGS_PATTERN, "") // Remove Strong's tags
		.replace(/\s+/g, " ") // Normalize whitespace
		.trim();

	// Create plain text (all tags removed)
	const plainText = text
		.replace(ALL_TAGS_PATTERN, "")
		.replace(/\s+/g, " ")
		.trim();

	return {
		plainText,
		displayText,
		strongsReferences,
		footnotes,
		hasItalics,
	};
}

/**
 * Parse scripture text into individual words with their Strong's references
 */
export function parseScriptureWords(text: string): ScriptureWord[] {
	const words: ScriptureWord[] = [];

	// First, handle italics by marking them
	let processedText = text.replace(ITALICS_PATTERN, "⟨ITALIC⟩$1⟨/ITALIC⟩");

	// Remove footnotes and end markers
	processedText = processedText
		.replace(FOOTNOTE_PATTERN, "")
		.replace(END_MARKER_PATTERN, "");

	// Split into tokens (words and Strong's tags)
	const tokenPattern = /(<W[HG]\d+>)|([^\s<]+)/g;
	let match: RegExpExecArray | null;
	let currentWord: ScriptureWord | null = null;
	let isInItalic = false;

	while ((match = tokenPattern.exec(processedText)) !== null) {
		const [, strongsTag, wordText] = match;

		if (strongsTag) {
			// This is a Strong's reference - attach to previous word
			const strongsMatch = strongsTag.match(/<W([HG])(\d+)>/);
			if (strongsMatch && currentWord) {
				currentWord.strongs = {
					number: `${strongsMatch[1]}${strongsMatch[2]}`,
					type: strongsMatch[1] === "H" ? "hebrew" : "greek",
					originalTag: `W${strongsMatch[1]}${strongsMatch[2]}`,
					position: match.index,
					precedingWord: currentWord.text,
				};
			}
		} else if (wordText) {
			// This is a word
			let cleanWord = wordText;

			// Check for italic markers
			if (cleanWord.includes("⟨ITALIC⟩")) {
				isInItalic = true;
				cleanWord = cleanWord.replace("⟨ITALIC⟩", "");
			}
			if (cleanWord.includes("⟨/ITALIC⟩")) {
				cleanWord = cleanWord.replace("⟨/ITALIC⟩", "");
				// Word is italic
				if (cleanWord) {
					words.push({
						text: cleanWord,
						isItalic: true,
						isFootnote: false,
					});
				}
				isInItalic = false;
				currentWord = null;
				continue;
			}

			if (cleanWord) {
				currentWord = {
					text: cleanWord,
					isItalic: isInItalic,
					isFootnote: false,
				};
				words.push(currentWord);
			}
		}
	}

	return words;
}

/**
 * Convert Strong's tag format from scripture (WH/WG) to lookup format (H/G)
 */
export function convertStrongsTag(tag: string): string {
	// WH3068 -> H3068, WG5315 -> G5315
	return tag.replace(/^W/, "");
}

/**
 * Get unique Strong's numbers from scripture text
 */
export function getUniqueStrongsNumbers(text: string): string[] {
	const refs = extractStrongsReferences(text);
	const unique = [...new Set(refs.map((r) => r.number))];
	return unique;
}

/**
 * Format Strong's reference for display
 */
export function formatStrongsReference(number: string): string {
	const type = number.startsWith("H") ? "Hebrew" : "Greek";
	return `${type} ${number}`;
}
