// process.ts
import Database from 'better-sqlite3'
import { PATHS, Song, TEST_MODE, TEST_SINGLE_SONG_ID } from './config.js'
import {
	processEwLyrics,
	processEwTitle,
	saveSongToDatabase,
} from './functions.js'
import { SONG_DB_PATHS } from '../../types.js'

// Initialize databases
console.log(PATHS)

async function processSongs(PATHS: SONG_DB_PATHS) {
	const songsDB = new Database(PATHS.SONG_DB, { readonly: true })
	const songWordsDB = new Database(PATHS.SONG_WORDS_DB, { readonly: true })

	try {
		// Build base query
		let query = 'SELECT rowid as id, title, author, copyright FROM song'
		// ccli_no
		const params: (string | number)[] = []

		if (TEST_SINGLE_SONG_ID) {
			query += ' WHERE rowid = ?'
			params.push(TEST_SINGLE_SONG_ID)
		} else if (TEST_MODE) {
			query += ' LIMIT 30'
		}

		// Get songs
		const songsStmt = songsDB.prepare(query)
		const songs = songsStmt.all(...params) as Song[]

		// Process each song
		let counter = 0
		for (const song of songs) {
			try {
				// Get lyrics
				const lyricsQuery = songWordsDB.prepare(
					'SELECT words FROM word WHERE song_id = ?'
				)
				const lyricsRow = lyricsQuery.get(song.id) as { words: string }

				if (!lyricsRow?.words) {
					console.warn(`No lyrics found for song ${song.id}`)
					continue
				}

				// Process lyrics
				const processedLyrics = await processEwLyrics(lyricsRow.words)
				song.title = processEwTitle(song.title)
				song.text = processedLyrics
				console.log(song.title, song.text)
				// FILE_EXPORT_TYPE === 'propresenter6'
				// 	? generateProp6FileContents(song, processedLyrics)

				// Save file
				saveSongToDatabase(song, song.text)

				// Test mode early exit
				if (TEST_MODE && counter >= 9) break
				counter++
			} catch (error) {
				console.error(`Error processing song ${song.id}:`, error)
			}
		}

		return true
	} catch (error) {
		console.error('Database error:', error)
		return false
	} finally {
		songsDB.close()
		songWordsDB.close()
	}
}

// Start processing
// processSongs()
// console.log('Processing complete')
export default processSongs
