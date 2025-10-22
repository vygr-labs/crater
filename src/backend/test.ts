import path from "node:path";
import fs from "fs-extra";

export function moveFiles(sourceDir: string, targetDir: string): Promise<void> {
	return new Promise((resolve, reject) => {
		fs.readdir(sourceDir, (err, files) => {
			console.log("");
			if (err) {
				reject(err);
				return;
			}

			files.forEach((file) => {
				const oldPath = path.join(sourceDir, file);
				const newPath = path.join(targetDir, file);
				const stat = fs.lstatSync(oldPath);

				if (stat.isDirectory()) {
					console.log("RECURSING DIRECTORY: ", oldPath, newPath, stat);
					fs.mkdir(newPath, { recursive: true }, (err) => {
						console.error("AN ERROR OCCURED", err);
					});
					moveFiles(oldPath, newPath)
						.then(() => {
							if (files.indexOf(file) === files.length - 1) {
								resolve();
							}
						})
						.catch((err) => reject(err));
				} else if (stat.isFile()) {
					console.log("RENAMING FILE: ", oldPath, newPath, stat);
					fs.rename(oldPath, newPath, (err) => {
						if (err) {
							reject(err);
							return;
						}

						if (files.indexOf(file) === files.length - 1) {
							resolve();
						}
					});
				}
			});
		});
	});
}

console.log("Setting up application");
const resources = path.join("../assets", "store");
// await moveFiles(resources, path.join("../assets", "userData"))
// 	.then(() => console.log("Finished Migrating Files"))
// 	.catch((err) => console.error("An Error Occured during setup: ", err));

fs.move(resources, path.join("../assets", "userData"));
