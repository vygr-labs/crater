import path from "node:path";
import { PREVIEW_IMG_PATH } from "../constants.js";
import appDB from "./app-db.js";
import fs from "node:fs";
import { saveThemePreview } from "../utils.js";
const attachPreviewPath = (theme) => ({
	...theme,
	preview_path: path.join(PREVIEW_IMG_PATH, `theme-${theme.id}.png`),
});
// Fetch all themes
const fetchAllThemes = () => {
	const response = appDB
		.prepare(
			`
    SELECT id, title, author, created_at, updated_at, type
    FROM themes
    ORDER BY created_at DESC
    `,
		)
		.all();
	// return response
	return response.map((theme) => attachPreviewPath(theme));
};
// Add theme
const addTheme = ({ title, author, preview, type, theme_data }) => {
	try {
		const insertThemeStmt = appDB.prepare(`
      INSERT INTO themes (title, author, type, theme_data)
      VALUES (?, ?, ?, ?)
      `);
		const info = insertThemeStmt.run(title, author, type, theme_data);
		saveThemePreview(preview, info.lastInsertRowid);
		console.log(`Preview image saved as theme-${info.lastInsertRowid}.png`);
		return { success: true, message: "Theme added successfully." };
	} catch (error) {
		console.log("Error occurred while adding theme", error);
		return { success: false, message: "Failed to add theme." };
	}
};
// Update an existing theme
const updateTheme = (id, { title, author, theme_data, preview }) => {
	try {
		const result = appDB
			.prepare(
				`
    UPDATE themes
    SET title = ?, author = ?, theme_data = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    `,
			)
			.run(title, author, theme_data, id);
		if (result.changes === 0) {
			return {
				success: false,
				message: "No theme found with the given ID",
			};
		}
		saveThemePreview(preview, id);
		const updatedTheme = appDB
			.prepare("SELECT * FROM themes WHERE id = ?")
			.get(id);
		return {
			success: true,
			message: "Theme updated successfully.",
			updatedTheme: attachPreviewPath(updatedTheme),
		};
	} catch (error) {
		console.log("Error occured while updating theme", error);
		return {
			success: false,
			message: "Failed to update theme",
		};
	}
};
// Delete a theme by ID
const deleteTheme = (id) => {
	try {
		appDB
			.prepare(
				`
    DELETE FROM themes
    WHERE id = ?
    `,
			)
			.run(id);
		const preview_img = `${PREVIEW_IMG_PATH}/theme-${id}.png`;
		console.log("DELETING PREVIEW IMG: ", preview_img);
		if (fs.existsSync(preview_img)) {
			console.log("EXISTS PREVIEW IMG: ", preview_img);
			fs.unlink(preview_img, (err) => {
				if (err) throw err;
				console.log(`${preview_img} was deleted`);
			});
		}
		return { success: true, message: "Theme deleted successfully." };
	} catch (error) {
		console.log("Error occured while deleting theme", error);
		return {
			success: false,
			message: "Failed to delete theme",
		};
	}
};
// Fetch a specific theme by ID
const fetchThemeById = (id) => {
	const theme = appDB
		.prepare(
			`
    SELECT *
    FROM themes
    WHERE id = ?
    `,
		)
		.get(id);
	if (theme) {
		return {
			...theme,
			// theme_data: JSON.parse(theme.theme_data), // Parse JSON theme data
			preview_path: path.join(PREVIEW_IMG_PATH, `theme-${theme.id}.png`),
		};
	}
	return null;
};
const filterThemes = (type) => {
	let query = `SELECT id, title, author, type, created_at, updated_at FROM themes`;
	const params = [];
	if (type) {
		query += ` WHERE type = ?`;
		params.push(type);
	}
	query += ` ORDER BY created_at DESC`;
	const response = appDB.prepare(query).all(...params);
	return response.map((theme) => ({
		...theme,
		preview_path: path.join(PREVIEW_IMG_PATH, `theme-${theme.id}.png`),
	}));
};
export {
	fetchAllThemes,
	addTheme,
	updateTheme,
	deleteTheme,
	fetchThemeById,
	filterThemes,
};
