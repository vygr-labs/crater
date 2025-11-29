import path from "node:path";
import { MEDIA_IMAGES, MEDIA_VIDEOS } from "./constants.js";
import mime from "mime";
import fs from "node:fs";
import fsExtra from "fs-extra";
import logger from "./logger.js";

export function getMediaDestination(filePath: string) {
	let destination = "";
	const fileName = path.basename(filePath);
	const fileType = mime.getType(filePath) ?? "";
	logger.debug("Getting media destination", { filePath, fileType });

	if (fileType.startsWith("image/")) {
		destination = path.join(MEDIA_IMAGES, fileName);
	} else if (fileType.startsWith("video/")) {
		destination = path.join(MEDIA_VIDEOS, fileName);
	} else {
		logger.warn("Unsupported file type", { filePath, fileType });
		return;
	}

	return destination;
}

export function moveFiles(sourceDir: string, targetDir: string): boolean {
	try {
		const files = fs.readdirSync(sourceDir);

		files.forEach((file) => {
			const oldPath = path.join(sourceDir, file);
			const newPath = path.join(targetDir, file);
			const stat = fs.lstatSync(oldPath);

			if (stat.isDirectory()) {
				logger.debug("Recursing into directory", { oldPath, newPath });
				fs.mkdirSync(newPath, { recursive: true });
				moveFiles(oldPath, newPath);
				fs.rmdirSync(oldPath);
			} else if (stat.isFile()) {
				logger.debug("Moving file", { oldPath, newPath });
				fs.renameSync(oldPath, newPath);
			}
		});
		return true;
	} catch (err) {
		logger.error("Error moving files", { sourceDir, targetDir, error: err });
		return false;
	}
}

export const handleErr: fs.NoParamCallback = (err) => {
	if (err) {
		logger.error("File operation error", err);
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

export const setupApplication = (resources: string, userData: string) => {
	logger.info("Setting up application", { resources, userData });

	try {
		const initialized = moveFiles(resources, userData);
		logger.info("Finished migrating files", { success: initialized });
		if (initialized) {
			const files = fs.readdirSync(resources);
			if (files.length) {
				logger.error("Failed to initialize application - files remaining", {
					files,
				});
			} else {
				fs.rmdirSync(resources);
				return true;
			}
		}
		return false;
	} catch (err) {
		logger.error("Setup application error", err);
		return false;
	}
};
