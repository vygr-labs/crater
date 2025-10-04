import electronIsDev from 'electron-is-dev';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'node:path';
import fs from 'node:fs';
import { app } from 'electron';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const RESOURCES_PATH = electronIsDev
    ? path.join(__dirname, '../../assets')
    : path.join(process.resourcesPath, 'assets');
const userData = app.getPath('userData');
const APP = 'crater-bible-project';
const DB_PATH = path.join(userData, 'databases');
const PREVIEW_IMG_PATH = path.join(userData, 'themes', 'preview');
const MEDIA_PATH = path.join(userData, 'media');
const MEDIA_IMAGES = path.join(MEDIA_PATH, 'images');
const MEDIA_VIDEOS = path.join(MEDIA_PATH, 'videos');
const TEMP_FOLDER = path.join(app.getPath('temp'), APP);
const DB_IMPORT_TEMP_DIR = path.join(TEMP_FOLDER, 'import-databases');
function createAppPaths(paths) {
    paths.map(path => {
        if (!fs.existsSync(path)) {
            fs.mkdir(path, { recursive: true }, err => {
                if (err)
                    throw err;
                console.log(`Path --${path}-- Created Successfuly`);
            });
        }
    });
}
createAppPaths([
    DB_PATH,
    PREVIEW_IMG_PATH,
    RESOURCES_PATH,
    MEDIA_PATH,
    MEDIA_IMAGES,
    MEDIA_VIDEOS,
    TEMP_FOLDER,
    DB_IMPORT_TEMP_DIR,
]);
export { __dirname, RESOURCES_PATH, DB_PATH, PREVIEW_IMG_PATH, MEDIA_PATH, MEDIA_IMAGES, MEDIA_VIDEOS, TEMP_FOLDER, DB_IMPORT_TEMP_DIR, };
