import Database from "better-sqlite3";
import { join as pathJoin } from "path";
import { DB_PATH } from "../constants.js";

const dbPath = pathJoin(DB_PATH, "app.sqlite");
const db = new Database(dbPath);

db.prepare(
	`
CREATE TABLE IF NOT EXISTS themes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT UNIQUE NOT NULL,
    author TEXT,
    type TEXT CHECK(type IN ('song', 'scripture', 'presentation')) NOT NULL DEFAULT 'song',
    theme_data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
);

db.prepare(
	`
  CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    path TEXT NOT NULL,
    last_used DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
).run();
// CREATE TABLE IF NOT EXISTS crater (
//   key TEXT PRIMARY KEY,
//   value TEXT
// )

console.log("App & Themes database initialized successfully!");

export default db;
