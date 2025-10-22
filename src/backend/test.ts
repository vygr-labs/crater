import path from "node:path";
import fs from "fs-extra";

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
						if (err) {
							console.error("AN ERROR OCCURED", err);
						}
						moveFiles(oldPath, newPath)
							.then(() => {
								fs.rmdir(oldPath, (err) => {
									if (err) {
										console.error("Failed to MOVE SUBDIR: ", oldPath, err);
									}
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

console.log("Setting up application");
const resources = path.join("../assets", "store");

try {
	const hasSetup = await moveFiles(
		resources,
		path.join("../assets", "userData"),
	);
	if (hasSetup) {
		console.log("Finished Migrating Files");
		const completeSetup = new Promise((resolve, reject) => {
			fs.readdir(resources, (err, files) => {
				console.log("RESOURCES FOLDER CONTENT: ", files);
				if (!files.length) {
					fs.rmdir(resources, (err) => {
						console.error(err);
						console.log("Setup complete, continuing application");
						resolve(true);
					});
				} else {
					console.error("Failed to initialize application");
					reject();
				}
			});
		});
		await completeSetup;
	}
} catch (err) {
	console.error("An Error Occured during setup: ", err);
}

console.log("HAS ALREADY RUN APPLICATION CODE.");
