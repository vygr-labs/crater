import Database from "better-sqlite3";
import { DB_EXTENSIONS_PATH, SONGS_DB_PATH } from "../constants.js";
import path from "node:path";

const db = new Database(SONGS_DB_PATH);
db.loadExtension(path.join(DB_EXTENSIONS_PATH, "spellfix.dll"));
export const songsTableName = "songs";
export const lyricsTableName = "song_lyrics";
export const ftsTableName = "song_ft";
export const spellfixTableName = "songs_search";
export const ftsAuxTableName = "songs_ft_aux";

// Create Tables
db.prepare(
	`
CREATE TABLE IF NOT EXISTS ${songsTableName} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT,
    copyright TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`,
).run();

db.prepare(
	`
CREATE TABLE IF NOT EXISTS ${lyricsTableName} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    song_id INTEGER NOT NULL,
    label TEXT NOT NULL,
    lyrics TEXT NOT NULL, -- JSON array to store the lines
    "order" INTEGER NOT NULL,
    FOREIGN KEY (song_id) REFERENCES songs (id) ON DELETE CASCADE
)`,
).run();

// INSERT INTO songs_search(word) SELECT word FROM big_vocabulary;
// INSERT INTO songs_search(word) SELECT term FROM search_aux WHERE col='*';
// ftsTableName option: content="${songsTableName}",
db.exec(`
  CREATE VIRTUAL TABLE IF NOT EXISTS ${spellfixTableName} USING spellfix1;
  CREATE VIRTUAL TABLE IF NOT EXISTS ${ftsTableName} USING fts4(title, lyrics);
  CREATE VIRTUAL TABLE IF NOT EXISTS ${ftsAuxTableName} USING fts4aux(${ftsTableName});
  
    CREATE TRIGGER IF NOT EXISTS ${songsTableName}_bu BEFORE UPDATE ON ${songsTableName} BEGIN
        DELETE FROM ${ftsTableName} WHERE docid=old.rowid;
    END;
    CREATE TRIGGER IF NOT EXISTS ${songsTableName}_au AFTER UPDATE ON ${songsTableName} BEGIN
        INSERT INTO ${ftsTableName}(docid, title, lyrics) VALUES(
        new.rowid, (SELECT title from ${songsTableName} where id = new.rowid), 
        (
          SELECT GROUP_CONCAT(
            REPLACE(
              TRIM(
                TRIM(lyrics, '["'), 
                ']"'), '","', ', ')) as lyrics
                      FROM song_lyrics
                      WHERE song_id = new.rowid
                      ORDER BY "order" ASC
          )
        );
    END;
    CREATE TRIGGER IF NOT EXISTS ${songsTableName}_bd BEFORE DELETE ON ${songsTableName} BEGIN
        DELETE FROM ${ftsTableName} WHERE docid=old.rowid;
    END;


    CREATE TRIGGER IF NOT EXISTS ${lyricsTableName}_bd BEFORE DELETE ON ${lyricsTableName} BEGIN
        DELETE FROM ${ftsTableName} WHERE docid=old.song_id;
    END;
    CREATE TRIGGER IF NOT EXISTS ${lyricsTableName}_bu BEFORE UPDATE ON ${lyricsTableName} BEGIN
        DELETE FROM ${ftsTableName} WHERE docid=old.song_id;
    END;
    CREATE TRIGGER IF NOT EXISTS ${lyricsTableName}_au AFTER UPDATE ON ${lyricsTableName} BEGIN
        INSERT INTO ${ftsTableName}(docid, title, lyrics) VALUES(
        new.song_id, (SELECT title from ${songsTableName} where id = new.song_id), 
        (
          SELECT GROUP_CONCAT(
            REPLACE(
              TRIM(
                TRIM(lyrics, '["'), 
                ']"'), '","', ', ')) as lyrics
                      FROM song_lyrics
                      WHERE song_id = new.song_id
                      ORDER BY "order" ASC
          )
        );
    END;

    CREATE TRIGGER IF NOT EXISTS ${lyricsTableName}_bi BEFORE INSERT ON ${lyricsTableName}
      BEGIN
          DELETE FROM ${ftsTableName} WHERE docid=new.song_id;
      END;
    CREATE TRIGGER IF NOT EXISTS ${lyricsTableName}_ai AFTER INSERT ON ${lyricsTableName} 
      BEGIN
          INSERT INTO ${ftsTableName}(docid, title, lyrics) VALUES(
          new.song_id, (SELECT title from ${songsTableName} where id = new.song_id), 
          (
            SELECT GROUP_CONCAT(
              REPLACE(
                TRIM(
                  TRIM(lyrics, '["'), 
                  ']"'), '","', ', ')) as lyrics
                        FROM song_lyrics
                        WHERE song_id = new.song_id
                        ORDER BY "order" ASC
            )
          );
      END;
    `);
// CREATE TRIGGER IF NOT EXISTS ${ftsAuxTableName}_bi BEFORE DELETE ON ${ftsAuxTableName} BEGIN
//     DELETE FROM ${spellfixTableName} WHERE word=new.term;
// END;
// CREATE TRIGGER IF NOT EXISTS ${ftsAuxTableName}_bi BEFORE INSERT ON ${ftsAuxTableName} BEGIN
//     DELETE FROM ${spellfixTableName} WHERE word=new.term;
// END;
// CREATE TRIGGER IF NOT EXISTS ${ftsAuxTableName}_ai AFTER INSERT ON ${ftsAuxTableName} BEGIN
//     INSERT INTO ${spellfixTableName}(word,rank)
//         VALUES (new.term, new.documents);
// END;

db.prepare(
	`
CREATE INDEX IF NOT EXISTS idx_song_lyrics_song_order
ON song_lyrics (song_id, "order");
`,
).run();

console.log("Songs database initialized successfully!");

export default db;
