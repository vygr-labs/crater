// Strong's Concordance Database Initialization for SQLite
// This handles TWO databases:
// 1. Bible with Strong's tags (book, chapter, verse, text) - text contains <WH####>/<WG####> tags
// 2. Strong's Dictionary (relativeOrder, word, data) - word definitions

import Database from "better-sqlite3";
import { join as pathJoin } from "path";
import { existsSync } from "fs";
import { DB_PATH } from "../constants.js";

// Database 1: Bible with Strong's tagged text
const strongsBiblePath = pathJoin(DB_PATH, "strongs-bible.sqlite");
// Database 2: Strong's Dictionary/Lexicon
const strongsDictPath = pathJoin(DB_PATH, "strongs-dictionary.sqlite");

let strongsBibleDB: Database.Database;
let strongsDictDB: Database.Database;
let strongsBibleUsingFallback = false;
let strongsDictUsingFallback = false;

// Initialize Strong's Bible database
try {
	if (existsSync(strongsBiblePath)) {
		strongsBibleDB = new Database(strongsBiblePath);
		console.log("[Strong's DB] Successfully opened Bible database");
	} else {
		console.warn(
			"[Strong's DB] Bible database file not found, using in-memory fallback",
		);
		strongsBibleDB = new Database(":memory:");
		strongsBibleUsingFallback = true;
	}
} catch (error) {
	console.error("[Strong's DB] Failed to open Strong's Bible database:", error);
	strongsBibleDB = new Database(":memory:");
	strongsBibleUsingFallback = true;
}

// Initialize Strong's Dictionary database
try {
	if (existsSync(strongsDictPath)) {
		strongsDictDB = new Database(strongsDictPath);
		console.log("[Strong's DB] Successfully opened Dictionary database");
	} else {
		console.warn(
			"[Strong's DB] Dictionary database file not found, using in-memory fallback",
		);
		strongsDictDB = new Database(":memory:");
		strongsDictUsingFallback = true;
	}
} catch (error) {
	console.error(
		"[Strong's DB] Failed to open Strong's Dictionary database:",
		error,
	);
	strongsDictDB = new Database(":memory:");
	strongsDictUsingFallback = true;
}

export const isStrongsBibleFallback = () => strongsBibleUsingFallback;
export const isStrongsDictFallback = () => strongsDictUsingFallback;

// Create tables if they don't exist (for development/fallback)

// Bible table with Strong's tagged text
strongsBibleDB
	.prepare(
		`
CREATE TABLE IF NOT EXISTS Bible (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book INTEGER NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    text TEXT NOT NULL
)`,
	)
	.run();

// Create index for faster lookups
strongsBibleDB
	.prepare(
		`CREATE INDEX IF NOT EXISTS idx_bible_ref ON Bible (book, chapter, verse)`,
	)
	.run();

// Dictionary table
strongsDictDB
	.prepare(
		`
CREATE TABLE IF NOT EXISTS dictionary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    relativeOrder INTEGER,
    word TEXT NOT NULL,
    data TEXT NOT NULL
)`,
	)
	.run();

// Create index on word for faster lookups
strongsDictDB
	.prepare(
		`CREATE INDEX IF NOT EXISTS idx_dictionary_word ON dictionary (word)`,
	)
	.run();

export { strongsBibleDB, strongsDictDB };
export default strongsDictDB; // Default export for backward compatibility
