import path from "path";
import { SCHEDULE_ITEMS_PATH } from "../constants.js";
import { SavedSchedule } from "../types.js";
import appDB from "./app-db.js";

export const saveScheduleToDB = (path: string, name: string) => {
	try {
		const insertThemeStmt = appDB.prepare(
			`
      INSERT INTO schedules (path, name, last_used)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      `,
		);
		const info = insertThemeStmt.run(path, name);

		return { success: true, message: "Schedule saved successfully." };
	} catch (error) {
		console.log("Error occurred while adding schedule", error);
		return { success: false, message: "Failed to save schedule." };
	}
};

export const getSavedSchedules = () => {
	try {
		const insertThemeStmt = appDB.prepare(
			`
      SELECT * FROM schedules ORDER BY last_used
      `,
		);
		const schedules = insertThemeStmt.all() as SavedSchedule[];

		console.log("SAVED: ", schedules);
		return schedules;
	} catch (error) {
		console.log("Error occurred while adding schedule", error);
		return { success: false, message: "Failed to get all schedule." };
	}
};

export const updateSchedule = (id: number, timestamp: Date) => {
	try {
		const insertThemeStmt = appDB.prepare(
			`
      UPDATE themes
    SET last_used = CURRENT_TIMESTAMP
    WHERE id = ?
      `,
		);
		const info = insertThemeStmt.run(id, timestamp);

		return { success: true, message: "Schedule saved successfully." };
	} catch (error) {
		console.log("Error occurred while adding schedule", error);
		return { success: false, message: "Failed to save schedule." };
	}
};
