import Database from "better-sqlite3";
import { SONGS_DB_PATH } from "../constants.js";
import path from "node:path";
import { getAssetPath } from "../constants.js";

const db = new Database(SONGS_DB_PATH);
// db.loadExtension(path.join(getAssetPath(), "./extensions/spellfix.dll"));

// Create Tables
db.prepare(
	`
CREATE TABLE IF NOT EXISTS songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT,
    copyright TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`,
).run();

db.prepare(
	`
CREATE TABLE IF NOT EXISTS song_lyrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    song_id INTEGER NOT NULL,
    label TEXT NOT NULL,
    lyrics TEXT NOT NULL, -- JSON array to store the lines
    "order" INTEGER NOT NULL,
    FOREIGN KEY (song_id) REFERENCES songs (id) ON DELETE CASCADE
)`,
).run();

// INSERT INTO songs_search(word) SELECT word FROM big_vocabulary;
// INSERT INTO songs_search(word) SELECT term FROM search_aux WHERE col='*';
// db.exec(
// 	`
//   CREATE VIRTUAL TABLE IF NOT EXISTS lyrics_search USING spellfix1;
//   CREATE VIRTUAL TABLE IF NOT EXISTS lyrics_ft USING fts4(lyrics);
//   CREATE VIRTUAL TABLE IF NOT EXISTS lyrics_ft_terms USING fts4aux(lyrics_ft);
//   INSERT INTO lyrics_search(word,rank)
//     SELECT term, documents FROM lyrics_ft_terms WHERE col='*';
//   `,
// );

db.prepare(
	`
CREATE INDEX IF NOT EXISTS idx_song_lyrics_song_order
ON song_lyrics (song_id, "order");
`,
).run();

console.log("Songs database initialized successfully!");

export default db;
