import electronIsDev from "electron-is-dev";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "node:path";
import fs from "node:fs";
import { app } from "electron";

export const appBackground = "#18181B";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const RESOURCES_PATH = electronIsDev
	? path.join(__dirname, "../../assets")
	: process.resourcesPath;
const userData = electronIsDev
	? path.join(RESOURCES_PATH, "store")
	: app.getPath("userData");

const APP = "crater-bible-project";
const DB_PATH = path.join(userData, "databases");
const SONGS_DB_PATH = path.join(DB_PATH, "songs.sqlite");

const MEDIA_PATH = path.join(userData, "media");
const SCHEDULE_ITEMS_PATH = path.join(userData, "schedules");
const MEDIA_IMAGES = path.join(MEDIA_PATH, "images");
const MEDIA_VIDEOS = path.join(MEDIA_PATH, "videos");
const TEMP_FOLDER = path.join(app.getPath("temp"), APP);
const DB_IMPORT_TEMP_DIR = path.join(TEMP_FOLDER, "import-databases");

function createAppPaths(paths: string[]) {
	paths.map((path) => {
		if (!fs.existsSync(path)) {
			fs.mkdir(path, { recursive: true }, (err) => {
				if (err) throw err;
				console.log(`Path --${path}-- Created Successfuly`);
			});
		}
	});
}

const getAssetPath = (...paths: string[]): string => {
	return path.join(RESOURCES_PATH, ...paths);
};

export {
	__dirname,
	RESOURCES_PATH,
	DB_PATH,
	SONGS_DB_PATH,
	MEDIA_PATH,
	MEDIA_IMAGES,
	MEDIA_VIDEOS,
	TEMP_FOLDER,
	DB_IMPORT_TEMP_DIR,
	userData,
	SCHEDULE_ITEMS_PATH,
	getAssetPath,
	createAppPaths,
};
