import type { Database } from "better-sqlite3";

export const songsTableName = "songs";
export const lyricsTableName = "song_lyrics";
export const ftsTableName = "song_fts5";

// Helper function to extract plain text from JSON lyrics
export const extractLyricsText = (songId: number, database: Database): string => {
	const lyrics = database
		.prepare(
			`
    SELECT lyrics FROM ${lyricsTableName} 
    WHERE song_id = ? 
    ORDER BY "order" ASC
  `,
		)
		.all(songId) as { lyrics: string }[];

	return lyrics
		.map((l) => {
			try {
				const parsed = JSON.parse(l.lyrics);
				return Array.isArray(parsed) ? parsed.join(" ") : String(parsed);
			} catch {
				return l.lyrics;
			}
		})
		.join(" ");
};

// Function to rebuild the FTS5 index for a song
export const rebuildSongFtsIndex = (songId: number, database: Database) => {
	const song = database
		.prepare(`SELECT id, title, author FROM ${songsTableName} WHERE id = ?`)
		.get(songId) as { id: number; title: string; author: string } | undefined;
	if (!song) return;

	const lyricsText = extractLyricsText(songId, database);

	// For contentless FTS5 tables, we need to use INSERT OR REPLACE
	// or delete with special syntax. Using INSERT OR REPLACE is simpler.
	database.prepare(
		`INSERT OR REPLACE INTO ${ftsTableName}(rowid, title, author, lyrics) VALUES(?, ?, ?, ?)`,
	).run(songId, song.title || "", song.author || "", lyricsText);
};

// Function to rebuild entire FTS5 index
export const rebuildAllSongsFtsIndex = (database: Database) => {
	// For contentless FTS5, we need to drop and recreate the table
	database.exec(`DROP TABLE IF EXISTS ${ftsTableName}`);
	database.exec(`
		CREATE VIRTUAL TABLE ${ftsTableName} USING fts5(
			title, 
			author,
			lyrics,
			content='',
			tokenize='trigram'
		);
	`);

	// Get all songs
	const songs = database.prepare(`SELECT id FROM ${songsTableName}`).all() as {
		id: number;
	}[];

	// Rebuild index for each song
	for (const song of songs) {
		rebuildSongFtsIndex(song.id, database);
	}

	console.log(`Rebuilt FTS5 index for ${songs.length} songs`);
};
