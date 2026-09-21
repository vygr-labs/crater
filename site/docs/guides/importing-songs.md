---
title: Importing from EasyWorship
description: Bring your song library across from EasyWorship 6 or 7 into Crater.
---

# Importing from EasyWorship

Crater can import the whole song library from **EasyWorship 6 and 7** in one go, with titles, authors, copyright, CCLI numbers and lyrics split into sections.

## What you need

EasyWorship keeps its songs in two database files, and Crater needs both:

- `Songs.db`
- `SongWords.db`

On a computer that has EasyWorship installed, they're usually in:

```text
C:\Users\Public\Documents\Softouch\EasyWorship\Default\Databases\Data
```

If Crater is on a different computer, copy both files across on a USB drive first. EasyWorship doesn't need to be installed on the computer running Crater.

!!! info
    Close EasyWorship before copying or importing its files, so you get a complete, up-to-date copy.

## Importing

1. Open the **Songs** tab and click the **import** button (the downward arrow) above the song list.
2. Click **Choose files...**.
3. Select **both** `Songs.db` and `SongWords.db` together. Click one, then hold **Ctrl** and click the other. Then click **Open**.

    Tip: copy the folder path above, paste it into the address bar at the top of the file picker and press **Enter** to jump straight there.

4. Crater scans the library and tells you how many songs it found.
5. If some songs have the same title and author as songs already in your Crater library, choose what to do:
    - **Skip duplicates** (the default) leaves your existing songs alone.
    - **Import duplicates anyway** adds a second copy.
6. Click **Import**. A progress bar shows while the songs are added.
7. Click **Done**. Your songs are in the library, ready to search.

## What comes across

| Imported | Not imported |
|----------|--------------|
| Title, author, copyright and CCLI number | Themes and backgrounds |
| Lyrics, as plain text | Bold, italic and other lyric formatting |
| Sections, split at blank lines and at labels like *Verse*, *Chorus*, *Pre-chorus*, *Bridge*, *Tag*, *Intro*, *Outro*, *Ending*, *Interlude* and *Refrain* | Media, schedules and favourites |

The import is all or nothing. If something goes wrong partway, no songs are added and you can try again.

After importing, it's worth opening a few songs in the [song editor](managing-songs.md) to check the sections came through the way you expect.

## If the import fails

### "Select exactly two files"

Select both `Songs.db` and `SongWords.db` in the file picker at the same time.

### "Could not find an EasyWorship Songs.db and SongWords.db"

One of the files is something else, perhaps a different `.db` file from the same folder. Check the names.

### "This does not look like an EasyWorship song database"

The files may come from an older EasyWorship (2009 or earlier), which isn't supported, or they may be damaged. Copy them again from the EasyWorship computer.

## Other programs

EasyWorship 6 and 7 are the only song libraries Crater imports today. For other programs, add songs through the [song editor](managing-songs.md). Its **Raw text** view lets you paste a whole song at once.
