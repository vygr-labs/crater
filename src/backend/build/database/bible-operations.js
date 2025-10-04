import bibleDB from './bible-db.js';
const fetchTranslations = () => {
    // Query to get all the translations
    const result = bibleDB
        .prepare(`
      SELECT *
      FROM bibles
    `)
        .all();
    return result;
};
// Function to load books and chapters into memory
const fetchChapterCounts = () => {
    const result = {};
    // Query to get the maximum chapter number for each book
    const rows = bibleDB
        .prepare(`
      SELECT book_name, MAX(chapter) AS number_of_chapters
      FROM scriptures
      GROUP BY book_name
    `)
        .all();
    // Build the result object with book_name as keys and number_of_chapters as values
    rows.forEach((row) => {
        result[row.book_name] = row.number_of_chapters;
    });
    return result;
};
const fetchChapter = ({ book, chapter, version, }) => {
    const response = bibleDB
        .prepare(`
      SELECT verse, text
      FROM scriptures
      WHERE book_name = ?
        AND chapter = ?
        AND version = ?
      ORDER BY verse ASC
    `)
        .all(book, chapter, version);
    // console.log('Chapter Fetched: ', response)
    return response;
};
const fetchScripture = ({ book, chapter, verse, version, }) => {
    const response = bibleDB
        .prepare(`
      SELECT text
      FROM scriptures
      WHERE book_name = ?
        AND chapter = ?
        AND verse = ?
        AND version = ?
    `)
        .get(book, chapter, verse, version);
    console.log('Scripture Fetched: ', response);
    return response ?? { text: '' };
};
const fetchAllScripture = (version) => {
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
    }
    catch (error) {
        console.error('Error fetching verses by version:', error);
        throw error;
    }
};
export { fetchTranslations, fetchChapterCounts, fetchChapter, fetchScripture, fetchAllScripture, };
