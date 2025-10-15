// Bible Database Initialization for SQLite
import Database from "better-sqlite3";
// import { fileURLToPath } from 'url'
import { join as pathJoin } from "path";
// import { app } from 'electron'
// import electronIsDev from 'electron-is-dev'
import { DB_PATH } from "../constants.js";

// const __dirname = dirname(fileURLToPath(import.meta.url))
// const dbPath = resolve(__dirname, 'bibles.sqlite')
// const interMediaries = electronIsDev ? 'backend/database' : ''
const dbPath = pathJoin(DB_PATH, "bibles.sqlite");
const db = new Database(dbPath);

// Create Tables
db.prepare(
	`
CREATE TABLE IF NOT EXISTS bibles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version TEXT UNIQUE NOT NULL,
    description TEXT
)`,
).run();

db.prepare(
	`
CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_name TEXT UNIQUE NOT NULL
)`,
).run();

db.prepare(
	`
CREATE TABLE IF NOT EXISTS scriptures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bible_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    book_name TEXT NOT NULL,
    version TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    text TEXT NOT NULL,
    UNIQUE(bible_id, book_id, chapter, verse),
    FOREIGN KEY (bible_id) REFERENCES bibles (id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE
)`,
).run();

db.prepare(
	`CREATE INDEX IF NOT EXISTS idx_scriptures_book_chapter_version 
  ON scriptures (book_name, chapter, version);`,
);

db.prepare(
	`CREATE INDEX IF NOT EXISTS idx_scriptures_book_chapter_verse_version 
  ON scriptures (book_name, chapter, verse, version);`,
);

// console.log("Scripture Database initialized successfully!");
export default db;
