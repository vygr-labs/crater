import songsDB from "./songs-db.js";

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

	const insertNewLyrics = songsDB.prepare(
		`
    INSERT INTO song_lyrics (song_id, label, lyrics, "order")
    VALUES (?, ?, ?, ?)
    `,
	);

	// Transaction to ensure atomic updates
	const transaction = songsDB.transaction(() => {
		// Update the song title
		updateSongTitle.run(newTitle, songId);

		// Remove old lyrics
		deleteOldLyrics.run(songId);

		// Insert new lyrics
		newLyrics.forEach((lyric, index) => {
			insertNewLyrics.run(
				songId,
				lyric.label,
				JSON.stringify(lyric.text),
				index + 1,
			);
		});
	});

	transaction();
	return { success: true, message: "Song updated successfully." };
};

// Filter songs by a phrase in their lyrics
const filterSongsByPhrase = (phrase: string): Song[] => {
	const response = songsDB
		.prepare(
			`
    SELECT DISTINCT s.id, s.title, s.author, s.copyright
    FROM songs s
    JOIN song_lyrics sl ON s.id = sl.song_id
    WHERE sl.lyrics LIKE ?
    ORDER BY s.title ASC
    `,
		)
		.all(`%${phrase}%`) as Song[];

	return response;
};

const deleteSongById = (
	songId: number,
): { success: boolean; message: string } => {
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

		return { success: true, message: "Song created successfully.", songId };
	} else {
		return { success: false, message: "Failed to create song." };
	}
};

export {
	fetchAllSongs,
	fetchSongLyrics,
	updateSong,
	filterSongsByPhrase,
	deleteSongById,
	createSong,
};
