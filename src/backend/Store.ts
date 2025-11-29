import { app } from "electron";
import path from "node:path";
import fs from "node:fs";
import logger from "./logger.js";

export class Store {
	data: Record<string, any> = {};

	constructor() {
		const file = path.join(app.getPath("userData"), "store.json");
		if (fs.existsSync(file)) {
			fs.readFile(file, (err, contents) => {
				if (err) {
					logger.error("Error reading store config", err);
					return;
				}
				this.data = contents.toJSON();
			});
		} else {
			fs.writeFile(file, JSON.stringify(this.data), (err) => {
				if (err) {
					logger.error("Failed to create store file", err);
				}
			});
		}
	}

	get(...paths: string[]) {
		let current = {};
		for (let i = 0; i < paths.length; i++) {
			current = this.data[paths[i]];
		}
		return current;
	}

	set(paths: string[], value: any) {
		let current = {};
		for (let i = 0; i < paths.length; i++) {
			current = this.data[paths[i]];
		}
		return current;
	}
}
