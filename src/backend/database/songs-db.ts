import Database from "better-sqlite3";
import { SONGS_DB_PATH } from "../constants.js";

const db = new Database(SONGS_DB_PATH);
// Removed spellfix extension - using FTS5 trigram instead
export const songsTableName = "songs";
export const lyricsTableName = "song_lyrics";
export const ftsTableName = "song_fts5"; // New FTS5 table name

// Create Tables
db.prepare(
	`
CREATE TABLE IF NOT EXISTS ${songsTableName} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT,
    copyright TEXT,
    theme_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`,
).run();

// Add theme_id column if it doesn't exist (migration for existing databases)
try {
	db.prepare(`ALTER TABLE ${songsTableName} ADD COLUMN theme_id INTEGER`).run();
} catch (e) {
	// Column already exists, ignore error
}

db.prepare(
	`
CREATE TABLE IF NOT EXISTS ${lyricsTableName} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    song_id INTEGER NOT NULL,
    label TEXT NOT NULL,
    lyrics TEXT NOT NULL, -- JSON array to store the lines
    "order" INTEGER NOT NULL,
    FOREIGN KEY (song_id) REFERENCES songs (id) ON DELETE CASCADE
)`,
).run();

// Create FTS5 virtual table with trigram tokenizer for fuzzy search
// Trigram tokenizer breaks text into 3-character sequences, enabling typo-tolerant search
db.exec(`
  CREATE VIRTUAL TABLE IF NOT EXISTS ${ftsTableName} USING fts5(
    title, 
    author,
    lyrics,
    content='',
    tokenize='trigram'
  );
`);

// Helper function to extract plain text from JSON lyrics
const extractLyricsText = (songId: number): string => {
	const lyrics = db
		.prepare(
			`
    SELECT lyrics FROM ${lyricsTableName} 
    WHERE song_id = ? 
    ORDER BY "order" ASC
  `,
		)
		.all(songId) as { lyrics: string }[];

	return lyrics
		.map((l) => {
			try {
				const parsed = JSON.parse(l.lyrics);
				return Array.isArray(parsed) ? parsed.join(" ") : String(parsed);
			} catch {
				return l.lyrics;
			}
		})
		.join(" ");
};

// Function to rebuild the FTS5 index for a song
export const rebuildSongFtsIndex = (songId: number) => {
	const song = db
		.prepare(`SELECT id, title, author FROM ${songsTableName} WHERE id = ?`)
		.get(songId) as { id: number; title: string; author: string } | undefined;
	if (!song) return;

	const lyricsText = extractLyricsText(songId);

	// For contentless FTS5 tables, we need to use INSERT OR REPLACE
	// or delete with special syntax. Using INSERT OR REPLACE is simpler.
	db.prepare(
		`INSERT OR REPLACE INTO ${ftsTableName}(rowid, title, author, lyrics) VALUES(?, ?, ?, ?)`,
	).run(songId, song.title || "", song.author || "", lyricsText);
};

// Function to delete a song from FTS5 index (for contentless tables)
export const deleteSongFromFtsIndex = (
	songId: number,
	title: string,
	author: string,
	lyricsText: string,
) => {
	// For contentless FTS5 tables, delete requires providing the original values
	db.prepare(
		`INSERT INTO ${ftsTableName}(${ftsTableName}, rowid, title, author, lyrics) VALUES('delete', ?, ?, ?, ?)`,
	).run(songId, title || "", author || "", lyricsText);
};

// Function to rebuild entire FTS5 index
export const rebuildAllSongsFtsIndex = () => {
	// For contentless FTS5, we need to drop and recreate the table
	db.exec(`DROP TABLE IF EXISTS ${ftsTableName}`);
	db.exec(`
		CREATE VIRTUAL TABLE ${ftsTableName} USING fts5(
			title, 
			author,
			lyrics,
			content='',
			tokenize='trigram'
		);
	`);

	// Get all songs
	const songs = db.prepare(`SELECT id FROM ${songsTableName}`).all() as {
		id: number;
	}[];

	// Rebuild index for each song
	for (const song of songs) {
		rebuildSongFtsIndex(song.id);
	}

	console.log(`Rebuilt FTS5 index for ${songs.length} songs`);
};

// Check if FTS index is populated and needs rebuilding
export const isSongsFtsIndexEmpty = (): boolean => {
	const count = db
		.prepare(`SELECT COUNT(*) as count FROM ${ftsTableName}`)
		.get() as { count: number };
	return count.count === 0;
};

// Initialize FTS index if empty (call on app startup)
export const initializeSongsFtsIndexIfEmpty = () => {
	const songsCount = (
		db.prepare(`SELECT COUNT(*) as count FROM ${songsTableName}`).get() as {
			count: number;
		}
	).count;
	if (songsCount > 0 && isSongsFtsIndexEmpty()) {
		console.log("Songs FTS index is empty, rebuilding...");
		rebuildAllSongsFtsIndex();
	}
};

// Create triggers to keep FTS5 index in sync
// Note: We use AFTER triggers and call the rebuild function via application logic
// since SQLite triggers can't call custom functions easily

db.prepare(
	`
CREATE INDEX IF NOT EXISTS idx_song_lyrics_song_order
ON song_lyrics (song_id, "order");
`,
).run();

console.log("Songs database initialized successfully!");

export default db;
