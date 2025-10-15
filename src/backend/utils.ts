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
