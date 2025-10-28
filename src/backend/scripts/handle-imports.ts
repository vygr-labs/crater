import { parentPort, workerData } from "node:worker_threads";
import processSongs from "./songs-importer/index.js";
import Database from "better-sqlite3";

const db = new Database(workerData.songsDbPath);
const results = await processSongs(workerData.paths, db);

parentPort?.postMessage({ isComplete: results.success, count: results.count });
