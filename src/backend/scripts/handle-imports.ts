import { parentPort, workerData } from "node:worker_threads";
import processSongs from "./songs-importer/index.js";
import Database from "better-sqlite3";
import { rebuildAllSongsFtsIndex } from "../database/fts-logic.js";

const db = new Database(workerData.songsDbPath);

const results = await processSongs(workerData.paths, db, (progress) => {
	parentPort?.postMessage({
		type: "progress",
		current: progress.current,
		total: progress.total,
	});
});

if (results.success) {
	parentPort?.postMessage({
		type: "progress",
		message: "Rebuilding search index...",
	});
	rebuildAllSongsFtsIndex(db);
}

parentPort?.postMessage({ isComplete: results.success, count: results.count });
