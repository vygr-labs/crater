import path from 'node:path'
import { PREVIEW_IMG_PATH } from '../constants.js'
import appDB from './app-db.js'
import fs from 'node:fs'
import { saveThemePreview } from '../utils.js'

export type ThemeType = 'song' | 'scripture' | 'presentation'

export type ThemeMetadata = {
	id: number
	title: string
	author: string
	type: ThemeType
	created_at: string
	updated_at: string
	preview_path: string
}

export interface Theme extends ThemeMetadata {
	theme_data: string
}

export type ThemeInput = {
	title: string
	author: string
	type?: ThemeType
	preview: ArrayBuffer
	theme_data: string
}

export interface Theme extends ThemeMetadata {
	theme_data: string
}
const attachPreviewPath = (theme: Theme): Theme => ({
	...theme,
	preview_path: path.join(PREVIEW_IMG_PATH, `theme-${theme.id}.png`),
})

// Fetch all themes
const fetchAllThemes = (): ThemeMetadata[] => {
	const response = appDB
		.prepare(
			`
    SELECT id, title, author, created_at, updated_at, type
    FROM themes
    ORDER BY created_at DESC
    `
		)
		.all() as Theme[]

	// return response

	return response.map(theme => attachPreviewPath(theme))
}

// Add theme
const addTheme = ({
	title,
	author,
	preview,
	type,
	theme_data,
}: ThemeInput & { preview: ArrayBuffer }): {
	success: boolean
	message: string
} => {
	try {
		const insertThemeStmt = appDB.prepare(
			`
      INSERT INTO themes (title, author, type, theme_data)
      VALUES (?, ?, ?, ?)
      `
		)

		const info = insertThemeStmt.run(title, author, type, theme_data)
		saveThemePreview(preview, info.lastInsertRowid)

		console.log(`Preview image saved as theme-${info.lastInsertRowid}.png`)

		return { success: true, message: 'Theme added successfully.' }
	} catch (error) {
		console.log('Error occurred while adding theme', error)
		return { success: false, message: 'Failed to add theme.' }
	}
}

// Update an existing theme
const updateTheme = (
	id: number,
	{ title, author, theme_data, preview }: ThemeInput
): { success: boolean; message: string; updatedTheme?: Theme } => {
	try {
		const result = appDB
			.prepare(
				`
    UPDATE themes
    SET title = ?, author = ?, theme_data = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    `
			)
			.run(title, author, theme_data, id)

		if (result.changes === 0) {
			return {
				success: false,
				message: 'No theme found with the given ID',
			}
		}

		saveThemePreview(preview, id)
		const updatedTheme = appDB
			.prepare('SELECT * FROM themes WHERE id = ?')
			.get(id) as Theme

		return {
			success: true,
			message: 'Theme updated successfully.',
			updatedTheme: attachPreviewPath(updatedTheme),
		}
	} catch (error) {
		console.log('Error occured while updating theme', error)
		return {
			success: false,
			message: 'Failed to update theme',
		}
	}
}

// Delete a theme by ID
const deleteTheme = (id: number): { success: boolean; message: string } => {
	try {
		appDB
			.prepare(
				`
    DELETE FROM themes
    WHERE id = ?
    `
			)
			.run(id)

		const preview_img = `${PREVIEW_IMG_PATH}/theme-${id}.png`
		console.log('DELETING PREVIEW IMG: ', preview_img)
		if (fs.existsSync(preview_img)) {
			console.log('EXISTS PREVIEW IMG: ', preview_img)
			fs.unlink(preview_img, err => {
				if (err) throw err
				console.log(`${preview_img} was deleted`)
			})
		}

		return { success: true, message: 'Theme deleted successfully.' }
	} catch (error) {
		console.log('Error occured while deleting theme', error)
		return {
			success: false,
			message: 'Failed to delete theme',
		}
	}
}

// Fetch a specific theme by ID
const fetchThemeById = (id: number): Theme | null => {
	const theme = appDB
		.prepare(
			`
    SELECT *
    FROM themes
    WHERE id = ?
    `
		)
		.get(id) as Theme | undefined

	if (theme) {
		return {
			...theme,
			// theme_data: JSON.parse(theme.theme_data), // Parse JSON theme data
			preview_path: path.join(PREVIEW_IMG_PATH, `theme-${theme.id}.png`),
		}
	}

	return null
}

const filterThemes = (type?: ThemeType): ThemeMetadata[] => {
	let query = `SELECT id, title, author, type, created_at, updated_at FROM themes`
	const params: unknown[] = []

	if (type) {
		query += ` WHERE type = ?`
		params.push(type)
	}

	query += ` ORDER BY created_at DESC`

	const response = appDB.prepare(query).all(...params) as ThemeMetadata[]

	return response.map(theme => ({
		...theme,
		preview_path: path.join(PREVIEW_IMG_PATH, `theme-${theme.id}.png`),
	}))
}

export {
	fetchAllThemes,
	addTheme,
	updateTheme,
	deleteTheme,
	fetchThemeById,
	filterThemes,
}
