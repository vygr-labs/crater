import path from "node:path";
import { MEDIA_IMAGES, MEDIA_VIDEOS, PREVIEW_IMG_PATH } from "./constants.js";
import mime from "mime";
import fs from "node:fs";

export function getMediaDestination(filePath: string) {
	let destination = "";
	const fileName = path.basename(filePath);
	const fileType = mime.getType(filePath) ?? "";
	console.log("File Type: ", fileType);

	if (fileType.startsWith("image/")) {
		destination = path.join(MEDIA_IMAGES, fileName);
	} else if (fileType.startsWith("video/")) {
		destination = path.join(MEDIA_VIDEOS, fileName);
	} else {
		console.warn("Unsupported file type:", filePath);
		return;
	}

	return destination;
}

export function saveThemePreview(preview: ArrayBuffer, id: number | bigint) {
	const buffer = Buffer.from(preview);
	fs.writeFile(`${PREVIEW_IMG_PATH}/theme-${id}.png`, buffer, (err) => {
		if (err) throw err;
		console.log("File Saved Successfully");
	});
}

export function moveFiles(
	sourceDir: string,
	targetDir: string,
): Promise<boolean> {
	return new Promise((resolve, reject) => {
		fs.readdir(sourceDir, (err, files) => {
			console.log("");
			if (err) {
				reject(err);
				return;
			}

			if (!files.length) {
				fs.mkdir(targetDir, () => {
					fs.rmdir(sourceDir, () => resolve(true));
				});
			}
			files.forEach((file) => {
				const oldPath = path.join(sourceDir, file);
				const newPath = path.join(targetDir, file);
				const stat = fs.lstatSync(oldPath);

				if (stat.isDirectory()) {
					console.log("RECURSING DIRECTORY: ", oldPath, newPath, stat);
					fs.mkdir(newPath, { recursive: true }, (err) => {
						console.error("AN ERROR OCCURED", err);
						moveFiles(oldPath, newPath)
							.then(() => {
								fs.rmdir(oldPath, () => {
									if (files.indexOf(file) === files.length - 1) {
										resolve(true);
									}
								});
							})
							.catch((err) => reject(err));
					});
				} else if (stat.isFile()) {
					console.log("RENAMING FILE: ", oldPath, newPath, stat);
					fs.rename(oldPath, newPath, (err) => {
						if (err) {
							reject(err);
							return;
						}

						if (files.indexOf(file) === files.length - 1) {
							resolve(true);
						}
					});
				}
			});
		});
	});
}

export const handleErr: fs.NoParamCallback = (err) => {
	if (err) {
		console.error("Error Occured: ", err);
	}
};

export function getMimeType(filePath: string) {
	const ext = path.extname(filePath).toLowerCase();
	switch (ext) {
		case ".wav":
			return "audio/wav";
		case ".ogg":
			return "audio/ogg";
		case ".mp3":
			return "audio/mpeg";
		case ".mp4":
			return "video/mp4";
		case ".jpg":
		case ".jpeg":
			return "image/jpeg";
		case ".png":
			return "image/png";
		case ".gif":
			return "image/gif";
		default:
			return "application/octet-stream";
	}
}
