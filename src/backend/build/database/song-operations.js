import songsDB from './songs-db.js';
// Fetch all songs
const fetchAllSongs = () => {
    const response = songsDB
        .prepare(`
    SELECT id, title, author, copyright, created_at, updated_at
    FROM songs
    ORDER BY title ASC
    `)
        .all();
    return response;
};
// Fetch the lyrics of a particular song by song ID
const fetchSongLyrics = (songId) => {
    const lyrics = songsDB
        .prepare(`
    SELECT label, lyrics, "order"
    FROM song_lyrics
    WHERE song_id = ?
    ORDER BY "order" ASC
    `)
        .all(songId);
    return lyrics.map((lyric) => ({
        label: lyric.label,
        text: JSON.parse(lyric.lyrics),
    }));
};
// Update the lyrics and name of a particular song
const updateSong = ({ songId, newTitle, newLyrics, }) => {
    const updateSongTitle = songsDB.prepare(`
    UPDATE songs
    SET title = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    `);
    const deleteOldLyrics = songsDB.prepare(`
    DELETE FROM song_lyrics
    WHERE song_id = ?
    `);
    const insertNewLyrics = songsDB.prepare(`
    INSERT INTO song_lyrics (song_id, label, lyrics, "order")
    VALUES (?, ?, ?, ?)
    `);
    // Transaction to ensure atomic updates
    const transaction = songsDB.transaction(() => {
        // Update the song title
        updateSongTitle.run(newTitle, songId);
        // Remove old lyrics
        deleteOldLyrics.run(songId);
        // Insert new lyrics
        newLyrics.forEach((lyric, index) => {
            insertNewLyrics.run(songId, lyric.label, JSON.stringify(lyric.text), index + 1);
        });
    });
    transaction();
    return { success: true, message: 'Song updated successfully.' };
};
// Filter songs by a phrase in their lyrics
const filterSongsByPhrase = (phrase) => {
    const response = songsDB
        .prepare(`
    SELECT DISTINCT s.id, s.title, s.author, s.copyright
    FROM songs s
    JOIN song_lyrics sl ON s.id = sl.song_id
    WHERE sl.lyrics LIKE ?
    ORDER BY s.title ASC
    `)
        .all(`%${phrase}%`);
    return response;
};
const deleteSongById = (songId) => {
    const deleteSong = songsDB.prepare(`
    DELETE FROM songs
    WHERE id = ?
    `);
    const result = deleteSong.run(songId);
    if (result.changes > 0) {
        return { success: true, message: 'Song deleted successfully.' };
    }
    else {
        return { success: false, message: 'Song not found.' };
    }
};
const createSong = ({ title, author, lyrics, }) => {
    const insertSong = songsDB.prepare(`
	INSERT INTO songs (title, author, copyright, created_at, updated_at)
	VALUES (?, ?, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
	`);
    const result = insertSong.run(title, author || '');
    if (result.changes > 0) {
        const songId = result.lastInsertRowid;
        const insertLyrics = songsDB.prepare(`
		INSERT INTO song_lyrics (song_id, label, lyrics, "order")
		VALUES (?, ?, ?, ?)
		`);
        lyrics.forEach((lyric, index) => {
            insertLyrics.run(songId, lyric.label, JSON.stringify(lyric.text), index + 1);
        });
        return { success: true, message: 'Song created successfully.', songId };
    }
    else {
        return { success: false, message: 'Failed to create song.' };
    }
};
export { fetchAllSongs, fetchSongLyrics, updateSong, filterSongsByPhrase, deleteSongById, createSong, };
