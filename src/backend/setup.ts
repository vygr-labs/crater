import { setupApplication } from "./utils.js";
import {
	__dirname,
	RESOURCES_PATH,
	DB_PATH,
	MEDIA_PATH,
	MEDIA_IMAGES,
	MEDIA_VIDEOS,
	TEMP_FOLDER,
	DB_IMPORT_TEMP_DIR,
	userData,
	SCHEDULE_ITEMS_PATH,
	createAppPaths,
	DB_EXTENSIONS_PATH,
} from "./constants.js";
import electronIsDev from "electron-is-dev";
import ElectronStore from "electron-store";
import path from "node:path";
import fs from "node:fs";

type CraterStoreType = {
	setupCompleted: boolean;
};
const store = new ElectronStore<CraterStoreType>({
	defaults: {
		setupCompleted: false,
	},
});

createAppPaths([
	DB_PATH,
	DB_EXTENSIONS_PATH,
	RESOURCES_PATH,
	MEDIA_PATH,
	MEDIA_IMAGES,
	MEDIA_VIDEOS,
	TEMP_FOLDER,
	DB_IMPORT_TEMP_DIR,
	SCHEDULE_ITEMS_PATH,
]);

const setupFiles = electronIsDev
	? path.join(RESOURCES_PATH, "userData")
	: path.join(process.resourcesPath, "store");
const destination = electronIsDev
	? path.join(RESOURCES_PATH, "store")
	: userData;
console.log("STARTING SETUP: ", fs.existsSync(setupFiles));
let completedSetup = !fs.existsSync(setupFiles);

if (!electronIsDev && !completedSetup) {
	setupApplication(setupFiles, destination);
	console.log("SETUP APPLICATION SUCCESSFUL: ");
	completedSetup = !fs.existsSync(setupFiles);
}

export { completedSetup, __dirname, store, electronIsDev };
