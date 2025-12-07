import songsDB, {
	ftsTableName,
	rebuildSongFtsIndex,
	rebuildAllSongsFtsIndex,
	initializeSongsFtsIndexIfEmpty,
	deleteSongFromFtsIndex,
} from "./songs-db.js";

// Define types for songs and lyrics
type Song = {
	id: number;
	title: string;
	author: string;
	copyright: string;
	created_at: string;
	updated_at: string;
};

type Lyric = {
	label: string;
	text: string;
};

type DBLyric = {
	label: string;
	lyrics: string;
	order: number;
};

type UpdateLyric = {
	label: string;
	text: string;
};

type SongUpdateParams = {
	songId: number;
	newTitle: string;
	newLyrics: UpdateLyric[];
};

// Fetch all songs
const fetchAllSongs = (): Song[] => {
	const response = songsDB
		.prepare(
			`
    SELECT id, title, author, copyright, created_at, updated_at
    FROM songs
    ORDER BY title ASC
    `,
		)
		.all() as Song[];

	return response;
};

// Fetch the lyrics of a particular song by song ID
const fetchSongLyrics = (songId: number): Lyric[] => {
	const lyrics = songsDB
		.prepare(
			`
    SELECT label, lyrics, "order"
    FROM song_lyrics
    WHERE song_id = ?
    ORDER BY "order" ASC
    `,
		)
		.all(songId) as DBLyric[];

	return lyrics.map(
		(lyric: { label: string; lyrics: string; order: number }) => ({
			label: lyric.label,
			text: JSON.parse(lyric.lyrics),
		}),
	);
};

// Update the lyrics and name of a particular song
const updateSong = ({
	songId,
	newTitle,
	newLyrics,
}: SongUpdateParams): { success: boolean; message: string } => {
	const updateSongTitle = songsDB.prepare(
		`
    UPDATE songs
    SET title = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    `,
	);

	const deleteOldLyrics = songsDB.prepare(
		`
    DELETE FROM song_lyrics
    WHERE song_id = ?
    `,
	);

	// Transaction to ensure atomic updates
	const transaction = songsDB.transaction(() => {
		// Update the song title
		updateSongTitle.run(newTitle, songId);

		// Remove old lyrics
		deleteOldLyrics.run(songId);

		// Batch insert all lyrics in a single statement for better performance
		if (newLyrics.length > 0) {
			const placeholders = newLyrics.map(() => "(?, ?, ?, ?)").join(", ");
			const values = newLyrics.flatMap((lyric, index) => [
				songId,
				lyric.label,
				JSON.stringify(lyric.text),
				index + 1,
			]);
			
			const insertAllLyrics = songsDB.prepare(
				`INSERT INTO song_lyrics (song_id, label, lyrics, "order") VALUES ${placeholders}`
			);
			insertAllLyrics.run(...values);
		}
	});

	transaction();

	// Rebuild FTS index for the updated song
	rebuildSongFtsIndex(songId);

	return { success: true, message: "Song updated successfully." };
};

// Search songs by phrase using FTS5 trigram (typo-tolerant)
const searchSongs = (query: string): Song[] => {
	const trimmedQuery = query.trim();
	if (!trimmedQuery) return [];

	console.log("SEARCHING SONGS: ", trimmedQuery);

	// Trigram requires at least 3 characters for effective matching
	if (trimmedQuery.length < 3) {
		console.log("Query too short for trigram search (need 3+ chars)");
		return [];
	}

	// For trigram tokenizer, escape quotes and wrap in quotes for substring matching
	const escapedQuery = trimmedQuery.replace(/"/g, '""');

	try {
		// FTS5 trigram search - handles typos naturally
		// We search across title, author, and lyrics
		const response = songsDB
			.prepare(
				`
				SELECT s.id, s.title, s.author, s.copyright, s.created_at, s.updated_at
				FROM ${ftsTableName} fts
				JOIN songs s ON fts.rowid = s.id
				WHERE ${ftsTableName} MATCH '"${escapedQuery}"'
				ORDER BY rank
				LIMIT 50
				`,
			)
			.all() as Song[];

		console.log("SEARCH RESPONSE: ", response.length, "results");
		return response;
	} catch (error) {
		console.error("Song search error:", error);
		return [];
	}
};

// Legacy function name for compatibility
const filterSongsByPhrase = (phrase: string): Song[] => {
	return searchSongs(phrase);
};

const deleteSongById = (
	songId: number,
): { success: boolean; message: string } => {
	// Get song data first for FTS delete (contentless FTS5 requires original values)
	const song = songsDB
		.prepare(`SELECT id, title, author FROM songs WHERE id = ?`)
		.get(songId) as { id: number; title: string; author: string } | undefined;

	if (!song) {
		return { success: false, message: "Song not found." };
	}

	// Get lyrics text for FTS delete
	const lyrics = songsDB
		.prepare(
			`SELECT lyrics FROM song_lyrics WHERE song_id = ? ORDER BY "order" ASC`,
		)
		.all(songId) as { lyrics: string }[];
	const lyricsText = lyrics
		.map((l) => {
			try {
				const parsed = JSON.parse(l.lyrics);
				return Array.isArray(parsed) ? parsed.join(" ") : String(parsed);
			} catch {
				return l.lyrics;
			}
		})
		.join(" ");

	// Delete from FTS index first (using special contentless delete syntax)
	try {
		deleteSongFromFtsIndex(songId, song.title, song.author, lyricsText);
	} catch (e) {
		console.error("Error deleting from FTS index:", e);
	}

	const deleteSong = songsDB.prepare(
		`
    DELETE FROM songs
    WHERE id = ?
    `,
	);

	const result = deleteSong.run(songId);

	if (result.changes > 0) {
		return { success: true, message: "Song deleted successfully." };
	} else {
		return { success: false, message: "Song not found." };
	}
};

const createSong = ({
	title,
	author,
	lyrics,
}: {
	title: string;
	author?: string;
	lyrics: Lyric[];
}): { success: boolean; message: string; songId?: number } => {
	const insertSong = songsDB.prepare(
		`
	INSERT INTO songs (title, author, copyright, created_at, updated_at)
	VALUES (?, ?, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
	`,
	);
	const result = insertSong.run(title, author || "");
	if (result.changes > 0) {
		const songId = result.lastInsertRowid as number;

		const insertLyrics = songsDB.prepare(
			`
		INSERT INTO song_lyrics (song_id, label, lyrics, "order")
		VALUES (?, ?, ?, ?)
		`,
		);

		lyrics.forEach((lyric, index) => {
			insertLyrics.run(
				songId,
				lyric.label,
				JSON.stringify(lyric.text),
				index + 1,
			);
		});

		// Build FTS index for the new song
		rebuildSongFtsIndex(songId);

		return { success: true, message: "Song created successfully.", songId };
	} else {
		return { success: false, message: "Failed to create song." };
	}
};

export {
	fetchAllSongs,
	fetchSongLyrics,
	updateSong,
	searchSongs,
	filterSongsByPhrase,
	deleteSongById,
	createSong,
	rebuildAllSongsFtsIndex,
	initializeSongsFtsIndexIfEmpty,
};
