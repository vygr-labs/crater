---
title: Scripture
description: Find and project Bible verses in Crater. Reference lookup, full-text search, verse ranges, translations and on-screen options.
---

# Scripture

The **Scripture** tab (**Ctrl + 2**) finds any verse in seconds, whether you know the reference or only remember a few words.

## Included translations

Crater comes with 14 English translations. They're listed by abbreviation in the sidebar.

| Code | Translation |
|------|-------------|
| AMPC | Amplified Bible, Classic Edition |
| ASV | American Standard Version |
| CEV | Contemporary English Version |
| ESV | English Standard Version |
| GNT | Good News Translation |
| KJV | King James Version |
| MSG | The Message |
| NASB2020 | New American Standard Bible (2020) |
| NIV | New International Version |
| NKJV | New King James Version |
| NLT | New Living Translation |
| RSV | Revised Standard Version |
| TLV | Tree of Life Version |
| TPT | The Passion Translation |

The Passion Translation doesn't include every book yet. Exodus to Deuteronomy, 1 and 2 Samuel, 1 and 2 Kings, 1 and 2 Chronicles, Ezra, Nehemiah, Esther, Job and Ecclesiastes are missing from it.

## Two ways to search

The search box at the top of the sidebar has two modes. Switch between them with **Ctrl + F**, by clicking the icon at the left of the box, or from the gear menu above the list.

### Reference mode (book icon)

This is the default. Type a reference and Crater jumps straight to the verse and loads it into Preview.

| You type | Crater finds |
|----------|--------------|
| `John 3:16` or `john 3 16` | John 3:16 |
| `jn 3 16` | John 3:16 |
| `rom 8` | Romans 8:1 |
| `1 cor 13 4`, `1cor 13:4` or `first corinthians 13:4` | 1 Corinthians 13:4 |
| `ps 23` | Psalms 23:1 |
| `John 3:16-18` | John 3:16 to 18, selected together |

A few tips:

- **Abbreviations are flexible.** Common short forms like `gn`, `ex`, `mt`, `mk`, `lk`, `jn`, `rev` all work, and Crater tolerates small spelling mistakes such as `phillipians`.
- **Press Space after a short book name** and Crater completes it. Typing `jn` then Space gives `John `.
- **Check the line under the box.** It shows how Crater read what you typed, for example *Interpreted: John 3 16*.
- **Use a colon or a space** between chapter and verse. Crater doesn't read dots (`John 3.16`).
- **Ranges stay inside one chapter.** `John 3:16-18` works. For verses across chapters, select them with the mouse (see below).
- **Type a translation code** after the reference, like `jn 3:16 niv`, to switch translation as you go.

If you prefer typing into separate book, chapter and verse boxes, choose the *controlled* input style from the gear menu. **Tab** or **Space** moves to the next box and **Backspace** in an empty box moves back.

### Search mode (magnifier icon)

Search the words of every verse in the current translation, for when you remember part of a verse but not where it is.

- Type a few words, like `be still and know`. Results are ranked with the best match first, up to 100 results, with the matching words highlighted.
- Put a phrase in quotes to match it exactly: `"the Lord is my shepherd"`.
- Put `-` in front of a word to leave it out, and use `OR` (in capitals) for either word.
- Apostrophes don't matter. `Gods` finds *God's*.
- Words shorter than three letters are ignored. A search made only of short words, like `I am`, finds nothing.
- Click the **library** icon beside the search box to search **all translations** at once. Each result shows its translation code.

## Showing verses

| Action | Result |
|--------|--------|
| Click a verse | Loads it into Preview |
| **Up** / **Down** | Moves through the verses, loading each into Preview |
| Double-click, or **Enter** | Sends it live |
| Right-click > **Push to Live** | Sends it live |
| Right-click > **Add to Schedule**, or **Ctrl + T** | Adds it to the schedule |

### Selecting several verses

- **Shift + click** selects every verse from the current one to the one you click.
- **Ctrl + click** (**Cmd + click** on a Mac) adds or removes single verses. Gaps and verses from different chapters are fine.
- **Shift + Up/Down** grows or shrinks the selection from the keyboard.
- Typing a range like `John 3:16-18` selects it for you.

Double-click or press **Enter** inside a selection to send the whole passage. It appears on one slide with verse numbers, titled with the reference and translation, for example *John 3:16-18 (KJV)*.

### Copying a verse

Click the copy button above the verse list (or in the Preview panel for a scripture item). Crater copies the text with its reference, ready to paste into a bulletin or message.

## Switching translation

Click a translation code in the sidebar. Crater keeps your place: if you were on John 3:16 in KJV, you'll be on John 3:16 in NIV. **Double-click** a translation code to switch and send the current verse live in that translation at the same time.

To change which translation opens by default, go to **Settings > Scripture > Default version**.

## Scripture display options

Find these in **Settings > Scripture**:

- **Highlight current verse.** Shows a multi-verse passage one verse at a time. Each slide shows the whole passage with the current verse bright and the others dimmed, so the congregation can follow along as you step through.
- **Show book:chapter in footer.** Adds a reference line, like *John 3:16-18*, along the bottom of every scripture slide.
- **Show Strong's tab.** Shows or hides the [Strong's](strongs.md) tab.

How verses look on screen (font, colours, background, where the reference sits) comes from your scripture theme. See [Themes](themes.md).

Search behaviour has its own options in **Settings > Search**, such as whether to highlight matching words. See [Settings](../reference/settings.md#search).

## Recent searches

When the search box is empty, a **Recent** button lists your last few searches in this session. Click one to run it again.

## Related

- [Global Search](../guides/quick-search.md) finds verses from any tab with **Ctrl + K**.
- [Strong's Concordance](strongs.md) has Greek and Hebrew word studies.
