---
title: Interface Overview
description: A tour of the Crater console, the top bar, the three live panels and the library tabs.
---

# Interface Overview

Everything in Crater happens in one window, the console. Its top half is for **running** the service and its bottom half is your **library** of content.

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ Crater                                                          ─  □  ✕  │  Title bar
├──────────────────────────────────────────────────────────────────────────┤
│ Schedule ▾  ⚙                                  NDI  Logo  Clear  Go Live ▾│  Top bar
├────────────────┬──────────────────────────────┬──────────────────────────┤
│                │                              │                          │
│   SCHEDULE     │          PREVIEW             │          LIVE            │
│  your order    │   what's lined up next       │   what the room sees     │
│  of service    │                              │                          │
├────────────────┴──────────────────────────────┴──────────────────────────┤
│ Songs   Scripture   Strong's   Media   Presentations   Themes            │  Library tabs
├────────────────┬─────────────────────────────────────────────────────────┤
│  Search box    │                                                         │
│  Groups        │              Library content                            │
│                │                                                         │
└────────────────┴─────────────────────────────────────────────────────────┘
```

## Title bar

Crater draws its own title bar. Drag it to move the window and double-click it to maximize or restore. On Windows, **Win + arrow** snapping works as usual. The minimize, maximize and close buttons sit on the right on Windows and on the left on macOS.

Closing the console ends the live output and quits Crater.

## Top bar

**On the left:**

- **Schedule ▾** opens your saved schedules. Load, save, rename and delete them here. See [Schedules](../features/schedules.md).
- **⚙ Settings** opens the Settings window. A small dot on the gear means an update is available.
- **Hide NDI / Show NDI** blanks and restores your NDI stream without touching the projector. It only appears when the NDI runtime is installed. See [NDI Streaming](../features/ndi-streaming.md).

**On the right:**

- **NDI** starts and stops sending the projection to OBS, vMix and other NDI receivers. It only appears when the NDI runtime is installed.
- **Logo** fades out the content and shows your logo background. Click again to bring the content back.
- **Clear** hides the text but keeps the theme background showing. Click again to bring the text back.
- **Go Live / End Live** opens and closes the projection window. The small arrow beside it picks which screen to project to, switches between **Fullscreen** and **Windowed**, and links to the output settings.

Logo and Clear light up while they're on.

## The three panels

### Schedule (left)

Your order of service for today. Add songs, verses, media and presentations to it from the library, drag rows to reorder them, and double-click a row to send it live. A dot next to the schedule name means there are changes you haven't saved to a named schedule yet. See [Schedules](../features/schedules.md).

### Preview (centre)

What you've lined up next. Clicking an item in the library or the schedule puts it here, split into slides (song sections, verses or pages). The room can't see Preview. Click a slide to select it, then double-click it or press **Enter** to send it live.

### Live (right)

What the room sees right now. A red **LIVE** badge shows when something is live. Click any slide here to put it on the screen straight away, or use the **Up** and **Down** arrows to step through.

## Library tabs

| Tab | What's in it |
|-----|--------------|
| **Songs** | Your song library, favourites and collections. See [Songs](../features/songs.md). |
| **Scripture** | 14 Bible translations with reference lookup and full-text search. See [Scripture](../features/scriptures.md). |
| **Strong's** | Greek and Hebrew dictionary plus a King James reader with Strong's numbers. See [Strong's Concordance](../features/strongs.md). You can hide this tab in Settings. |
| **Media** | Pictures, videos and PDFs. See [Media](../features/media.md). |
| **Presentations** | Sermon slides with speaker notes. See [Presentations](../features/presentations.md). |
| **Themes** | The designs your slides use. See [Themes](../features/themes.md). |

Switch tabs by clicking, with **Ctrl + 1** to **Ctrl + 5**, or with **Ctrl + Tab**.

Each tab has a **search box** at the top of its left sidebar and **groups** underneath it, like All Songs, My Favorites and your collections on the Songs tab, or the list of Bible translations on the Scripture tab.

## Colours tell you what's happening

| Colour | Meaning |
|--------|---------|
| **Gold** | Lined up but not on screen yet. The selected Preview slide, and the slide you're lining up in Live with Ctrl + arrow. |
| **Red** | On the screen right now. The LIVE badge, the active Live slide and the End Live button. |
| **Cyan** | Selected or switched on. The current tab, selected schedule rows and translations, and the Logo, Clear and NDI buttons when active. |

## Which panel do the arrow keys control?

The arrow keys and **Enter** work on whichever part of the console you used last:

- Click in the **library** (or its search box) and the arrows move through the list and load each item into Preview.
- Click a **Preview** slide and the arrows step through Preview.
- Click a **Live** slide and the arrows step through Live, changing the screen as you go.

The highlighted slide in a panel that isn't in charge of the keyboard turns muted, so you can always tell where your key presses will land. See [Keyboard Shortcuts](../reference/keyboard-shortcuts.md) for the full list.

## Right-click menus

Most things have a right-click menu with more options. For example:

- **A song, verse, media item or presentation:** Add to Schedule, Push to Live, favourites and more.
- **A schedule row:** Send to Live, Edit, Rename, Duplicate, pick a different theme for just that row, or Remove.
- **A theme:** Edit, Duplicate, Export, or make it the default for a screen.

## The theme editor

Editing or creating a theme opens the theme editor over the whole console. It has its own toolbar, layers list and properties panel. Save or cancel to return to the console. See [Designing Themes](../guides/creating-themes.md).

---

**Next:** [Running a Service](../guides/displaying-content.md)
