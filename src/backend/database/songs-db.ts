import Database from "better-sqlite3";
import { SONGS_DB_PATH } from "../constants.js";
import {
	rebuildAllSongsFtsIndex as rebuildAllFts,
	rebuildSongFtsIndex as rebuildSongFts,
	songsTableName,
	lyricsTableName,
	ftsTableName,
} from "./fts-logic.js";

const db = new Database(SONGS_DB_PATH);
// Removed spellfix extension - using FTS5 trigram instead
export { songsTableName, lyricsTableName, ftsTableName };

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

// Function to rebuild the FTS5 index for a song
export const rebuildSongFtsIndex = (songId: number) => {
	rebuildSongFts(songId, db);
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
	rebuildAllFts(db);
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
