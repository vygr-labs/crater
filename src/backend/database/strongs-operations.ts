import {
	strongsBibleDB,
	strongsDictDB,
	isStrongsBibleFallback,
	isStrongsDictFallback,
} from "./strongs-db.js";

// ============================================
// TYPES
// ============================================

// Interface for Strong's dictionary entry
export interface StrongsEntry {
	id: number;
	relativeOrder: number;
	word: string; // e.g., "H120", "G5315"
	data: string; // HTML content with definition
}

// Interface for Bible verse with Strong's tags
export interface StrongsBibleVerse {
	id?: number;
	book: number;
	chapter: number;
	verse: number;
	text: string; // Contains <WH####>/<WG####> tags
}

// Interface for fetching parameters
export interface FetchStrongsBibleParams {
	book: number;
	chapter: number;
	verse?: number;
}

// ============================================
// STRONG'S DICTIONARY OPERATIONS
// ============================================

/**
 * Fetch a Strong's definition by its reference number
 * @param reference - Strong's number (e.g., "H120", "G5315")
 */
export const fetchStrongsDefinition = (
	reference: string,
): StrongsEntry | null => {
	try {
		const result = strongsDictDB
			.prepare(`SELECT * FROM dictionary WHERE word = ?`)
			.get(reference.toUpperCase()) as StrongsEntry | undefined;

		return result ?? null;
	} catch (error) {
		console.error("Error fetching Strong's definition:", error);
		return null;
	}
};

/**
 * Fetch multiple Strong's definitions at once
 * @param references - Array of Strong's numbers
 */
export const fetchMultipleStrongsDefinitions = (
	references: string[],
): StrongsEntry[] => {
	try {
		if (references.length === 0) return [];

		const placeholders = references.map(() => "?").join(", ");
		const upperRefs = references.map((r) => r.toUpperCase());

		const results = strongsDictDB
			.prepare(`SELECT * FROM dictionary WHERE word IN (${placeholders})`)
			.all(...upperRefs) as StrongsEntry[];

		return results;
	} catch (error) {
		console.error("Error fetching multiple Strong's definitions:", error);
		return [];
	}
};

/**
 * Search Strong's definitions by keyword
 * @param keyword - Search term to find in definitions
 */
export const searchStrongsDefinitions = (keyword: string): StrongsEntry[] => {
	try {
		const results = strongsDictDB
			.prepare(
				`SELECT * FROM dictionary WHERE data LIKE ? OR word LIKE ? LIMIT 100`,
			)
			.all(`%${keyword}%`, `%${keyword}%`) as StrongsEntry[];

		return results;
	} catch (error) {
		console.error("Error searching Strong's definitions:", error);
		return [];
	}
};

/**
 * Get all Strong's entries (with optional pagination)
 */
export const getAllStrongsEntries = (
	limit = 100,
	offset = 0,
): StrongsEntry[] => {
	try {
		const results = strongsDictDB
			.prepare(
				`SELECT * FROM dictionary ORDER BY relativeOrder LIMIT ? OFFSET ?`,
			)
			.all(limit, offset) as StrongsEntry[];

		return results;
	} catch (error) {
		console.error("Error fetching all Strong's entries:", error);
		return [];
	}
};

// ============================================
// STRONG'S BIBLE OPERATIONS
// ============================================

/**
 * Fetch a single verse from the Strong's Bible
 */
export const fetchStrongsBibleVerse = (
	params: FetchStrongsBibleParams,
): StrongsBibleVerse | null => {
	try {
		const { book, chapter, verse } = params;

		if (verse !== undefined) {
			const result = strongsBibleDB
				.prepare(
					`SELECT * FROM Bible WHERE book = ? AND chapter = ? AND verse = ?`,
				)
				.get(book, chapter, verse) as StrongsBibleVerse | undefined;
			return result ?? null;
		}

		return null;
	} catch (error) {
		console.error("Error fetching Strong's Bible verse:", error);
		return null;
	}
};

/**
 * Fetch all verses for a chapter from the Strong's Bible
 */
export const fetchStrongsBibleChapter = (
	params: FetchStrongsBibleParams,
): StrongsBibleVerse[] => {
	try {
		const { book, chapter } = params;

		const results = strongsBibleDB
			.prepare(
				`SELECT * FROM Bible WHERE book = ? AND chapter = ? ORDER BY verse`,
			)
			.all(book, chapter) as StrongsBibleVerse[];

		return results;
	} catch (error) {
		console.error("Error fetching Strong's Bible chapter:", error);
		return [];
	}
};

/**
 * Fetch verse with its Strong's definitions resolved
 * Returns the verse text along with all referenced Strong's definitions
 */
export const fetchVerseWithDefinitions = (
	params: FetchStrongsBibleParams,
): {
	verse: StrongsBibleVerse | null;
	definitions: StrongsEntry[];
} => {
	const verse = fetchStrongsBibleVerse(params);

	if (!verse) {
		return { verse: null, definitions: [] };
	}

	// Extract Strong's references from the verse text
	const strongsPattern = /<W([HG])(\d+)>/g;
	const references: string[] = [];
	let match: RegExpExecArray | null;

	while ((match = strongsPattern.exec(verse.text)) !== null) {
		const ref = `${match[1]}${match[2]}`;
		if (!references.includes(ref)) {
			references.push(ref);
		}
	}

	// Fetch all definitions
	const definitions = fetchMultipleStrongsDefinitions(references);

	return { verse, definitions };
};

/**
 * Check if Strong's Bible database has data
 */
export const hasStrongsBibleData = (): boolean => {
	try {
		if (isStrongsBibleFallback()) {
			return false;
		}
		const result = strongsBibleDB
			.prepare(`SELECT COUNT(*) as count FROM Bible`)
			.get() as { count: number };
		return result.count > 0;
	} catch (error) {
		console.error("Error checking Strong's Bible data:", error);
		return false;
	}
};

/**
 * Check if Strong's Dictionary database has data
 */
export const hasStrongsDictData = (): boolean => {
	try {
		if (isStrongsDictFallback()) {
			return false;
		}
		const result = strongsDictDB
			.prepare(`SELECT COUNT(*) as count FROM dictionary`)
			.get() as { count: number };
		return result.count > 0;
	} catch (error) {
		console.error("Error checking Strong's Dictionary data:", error);
		return false;
	}
};

// Named exports for convenience
export {
	fetchStrongsDefinition as fetchStrongs,
	fetchMultipleStrongsDefinitions as fetchMultipleStrongs,
	searchStrongsDefinitions as searchStrongs,
};
