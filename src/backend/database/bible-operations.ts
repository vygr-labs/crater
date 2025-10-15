import bibleDB from "./bible-db.js";

// Define the database interface and utility types
interface ScriptureTranslation {
	id: number;
	version: string;
	description: string;
}

interface BaseText {
	text: string;
}

interface Scripture extends BaseText {
	verse: number;
}

type BookChapterCount = {
	book_name: string;
	number_of_chapters: number;
};

type ChapterCount = {
	[bookName: string]: number;
};

type FetchChapterParams = {
	book: string;
	chapter: number;
	version: string;
};

type FetchScriptureParams = {
	book: string;
	chapter: number;
	verse: number;
	version: string;
};

const fetchTranslations = (): ScriptureTranslation[] => {
	// Query to get all the translations
	const result = bibleDB
		.prepare(
			`
      SELECT *
      FROM bibles
    `,
		)
		.all() as ScriptureTranslation[];

	return result;
};

// Function to load books and chapters into memory
const fetchChapterCounts = (): ChapterCount => {
	const result: ChapterCount = {};

	// Query to get the maximum chapter number for each book
	const rows = bibleDB
		.prepare(
			`
      SELECT book_name, MAX(chapter) AS number_of_chapters
      FROM scriptures
      GROUP BY book_name
    `,
		)
		.all() as BookChapterCount[];

	// Build the result object with book_name as keys and number_of_chapters as values
	rows.forEach((row: { book_name: string; number_of_chapters: number }) => {
		result[row.book_name] = row.number_of_chapters;
	});

	return result;
};

const fetchChapter = ({
	book,
	chapter,
	version,
}: FetchChapterParams): Scripture[] => {
	const response = bibleDB
		.prepare(
			`
      SELECT verse, text
      FROM scriptures
      WHERE book_name = ?
        AND chapter = ?
        AND version = ?
      ORDER BY verse ASC
    `,
		)
		.all(book, chapter, version) as Scripture[];
	// console.log('Chapter Fetched: ', response)

	return response;
};

const fetchScripture = ({
	book,
	chapter,
	verse,
	version,
}: FetchScriptureParams): BaseText => {
	const response = bibleDB
		.prepare(
			`
      SELECT text
      FROM scriptures
      WHERE book_name = ?
        AND chapter = ?
        AND verse = ?
        AND version = ?
    `,
		)
		.get(book, chapter, verse, version) as BaseText;

	console.log("Scripture Fetched: ", response);

	return response ?? { text: "" };
};

const fetchAllScripture = (version: string) => {
	try {
		const query = `
					SELECT 
							s.id AS scripture_id,
							s.bible_id,
							s.book_id,
							s.book_name,
							s.chapter,
							s.verse,
							s.text,
							b.version AS version
					FROM scriptures s
					JOIN bibles b ON s.bible_id = b.id
					WHERE b.version = ?
					ORDER BY s.book_id, s.chapter, s.verse
			`;

		const rows = bibleDB.prepare(query).all(version);
		return rows;
	} catch (error) {
		console.error("Error fetching verses by version:", error);
		throw error;
	}
};

export {
	fetchTranslations,
	fetchChapterCounts,
	fetchChapter,
	fetchScripture,
	fetchAllScripture,
};
