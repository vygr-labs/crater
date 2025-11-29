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
				// Try to remove the source directory, but don't fail if we can't (e.g., in Program Files)
				try {
					fs.rmdirSync(oldPath);
				} catch (rmErr) {
					logger.warn(
						"Could not remove source directory (may be in protected location)",
						{ oldPath },
					);
				}
			} else if (stat.isFile()) {
				logger.debug("Copying file", { oldPath, newPath });
				// Use copy instead of rename to handle cross-device moves and permission issues
				fsExtra.copySync(oldPath, newPath, { overwrite: false });
				// Try to remove the source file, but don't fail if we can't
				try {
					fs.unlinkSync(oldPath);
				} catch (unlinkErr) {
					logger.warn(
						"Could not remove source file (may be in protected location)",
						{ oldPath },
					);
				}
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
			// Try to clean up source directory, but don't fail if we can't (e.g., in Program Files)
			try {
				const files = fs.readdirSync(resources);
				if (files.length === 0) {
					fs.rmdirSync(resources);
					logger.info("Cleaned up source directory", { resources });
				} else {
					logger.warn(
						"Source directory not empty after migration (files may be locked)",
						{ files },
					);
				}
			} catch (cleanupErr) {
				logger.warn(
					"Could not clean up source directory (may be in protected location)",
					{ resources },
				);
			}
			return true;
		}
		return false;
	} catch (err) {
		logger.error("Setup application error", err);
		return false;
	}
};
