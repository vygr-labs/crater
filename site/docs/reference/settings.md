---
title: Settings
description: Every option in Crater's Settings window, section by section.
---

# Settings

Open Settings with the **gear** button in the top bar or **Ctrl + ,**. Sections are listed on the left.

Changes take effect straight away and are saved automatically. Close the window with **Done**, **Esc** or the **×**. Options marked **Soon** are planned for a later version and can't be switched on yet.

## Appearance

How the console looks. None of these change what the congregation sees, except **Reduce motion**.

| Option | What it does | Default |
|--------|--------------|---------|
| **Theme** | Console colours. Dark, Light, Midnight and Auto (follows your computer's light or dark mode) are shown first. **More themes** adds High Contrast, Dusk, Sepia, Nord, Solarized Dark, Solarized Light, Gruvbox, Dracula, Royal Purple, Amber and Ecclesial Blue. | Dark |
| **Font size** | Console text and icon size: S, M or L | M |
| **Show CCLI badges** | Shows each song's CCLI number in the Songs list | On |
| **Reduce motion** | Turns off console animations, and makes every projection transition an instant cut | Off |
| **Language** | The console's language. Changes immediately, no restart needed. | Your computer's language, if available |

Available languages: English, Español, Português (Brasil), Français, Deutsch, Italiano, Nederlands, Русский, Українська, Polski, Română, 简体中文, 繁體中文, 한국어, 日本語, Bahasa Indonesia, Filipino, Kiswahili, हिन्दी, Tiếng Việt and العربية.

Translations are AI- and community-assisted, with English as the source. Any text that isn't translated yet shows in English. In Arabic the text reads right to left, but the console layout isn't mirrored yet.

## Projection

### Output

| Option | What it does | Default |
|--------|--------------|---------|
| **Output display** | The screen the main projection goes to | Your first screen that isn't the main one |
| **Projection mode** | **Fullscreen**, or **Windowed** for a movable window | Fullscreen with two screens, Windowed with one |
| **Show projection in Alt-Tab** | Gives the projection window a taskbar button and an Alt-Tab entry | On |
| **Single display: full-size projection behind the console** | With one screen, shows the projection full size behind all other windows instead of as a small corner preview | Off |

### Transitions

| Option | Choices | Default |
|--------|---------|---------|
| **Primary output style** | Cut, Crossfade, Fade through black | Crossfade |
| **Primary output duration** | Instant, Fast (150 ms), Normal (280 ms), Slow (500 ms), Very slow (1000 ms) | Normal |
| **NDI output style** and **duration** | As above, for the NDI stream. Only shown when **Dual output mode** is on. | Crossfade, Normal |

### Multiple Outputs

Add and manage extra screens such as a stage monitor or lobby TV. Each has a name, a **Mirror** or **Stage** mode, a display and an on/off switch. See [Outputs and Stage Display](../features/outputs.md).

### Defaults

| Option | What it does | Default |
|--------|--------------|---------|
| **Show logo by default** | Shows the logo on the projection when Crater starts | Off |
| **Clear output when idle** | *Soon* | |

### Fonts

Import `.ttf` and `.otf` fonts for your themes with **Import font…**, and remove them with the trash button. See [Designing Themes](../guides/creating-themes.md#fonts).

## Scripture

| Option | What it does | Default |
|--------|--------------|---------|
| **Default version** | The translation the Scripture tab opens with | KJV |
| **Show verse numbers** | Shows the verse number in each reference in the Scripture list | On |
| **Highlight current verse** | Shows a multi-verse passage one verse at a time, with the rest dimmed | Off |
| **Show book:chapter in footer** | Adds a reference line at the bottom of scripture slides | Off |
| **Show Strong's tab** | Shows the Strong's tab and Strong's results in global search | On |

## Song

| Option | What it does | Default |
|--------|--------------|---------|
| **Show author** | Shows the author under songs in the schedule | On |
| **Show CCLI number** | Shows the CCLI number under songs in the schedule | On |
| **Default theme** | The theme for songs that don't have their own | Classic Dark |
| **Auto-advance slides** | Moves to the next slide automatically | Off |
| **Advance after** | 5, 10, 15, 20, 30, 45 or 60 seconds | 20 seconds |
| **Loop at end** | Goes back to the first slide after the last one | Off |

Auto-advance works for anything live with more than one slide. It pauses while **Clear** is on.

## Search

### Command palette

**Default action by type** sets what **Enter** does on a [global search](../guides/quick-search.md) result: **Stage to Preview**, **Reveal in tab** or **Go Live**.

| Kind | Default |
|------|---------|
| Scripture, Songs, Media | Stage to Preview |
| Strong's | Reveal in tab |
| Themes | Always Reveal in tab |

### Songs, Scripture and Strong's

| Option | What it does | Default |
|--------|--------------|---------|
| Songs: **Show matched lyric** | Shows the matching line of lyrics under each song while searching | On |
| Songs: **Highlight matches** | Colours the matching words in song results | On |
| Scripture: **Highlight matches** | Colours the matching words in verse results | On |
| Strong's: **Highlight matches** | Colours the matching words in dictionary results | On |

## Media

| Option | What it does | Default |
|--------|--------------|---------|
| **Default fit** | How pictures and videos fill the screen when their own fit is **Default**: Contain, Cover or Stretch | Contain |

Individual items can override this. See [Media](../features/media.md#fit-how-media-fills-the-screen).

## Remote Control

| Option | What it does | Default |
|--------|--------------|---------|
| **Cast to TV browser** | Shows the live projection in any web browser on your network. See [Casting to a TV browser](../features/outputs.md#casting-to-a-tv-browser). | Off each time Crater starts |

The **Connection** options (Enable remote control, Port and Require password) are a preview of phone remote control, which is coming in a later version. They can't be switched on yet.

## NDI

This section shows whether the NDI runtime was found and, while streaming, whether a receiver has Crater on preview (PVW) or program (PGM). See [NDI Streaming](../features/ndi-streaming.md).

### Broadcast

| Option | What it does | Default |
|--------|--------------|---------|
| **Enable NDI output** | Starts or stops the stream | Off |
| **Stream name** | The name receivers see | Crater Live (resets each launch) |
| **Pixel format** | BGRA (full colour), BGRX (opaque) or UYVY (low bandwidth) | BGRA |
| **Resolution** | Native (1080p) or 720p | Native |
| **Hide pictures and video** | Sends a blank frame while a picture or video is live | Off |
| **Include audio** | *Soon* | |

Pixel format and resolution take effect the next time the stream starts.

### Rendering

| Option | What it does | Default |
|--------|--------------|---------|
| **Dual output mode** | Lets the stream use its own themes and transition | Off |
| **Headless renderer** | Captures frames straight from the graphics card, which is smoother and uses less CPU | On |
| **On-demand rendering (low CPU)** | Only sends a frame when the picture changes, up to 30 per second | Off |

## Updates

Shows your version and whether a newer one is available.

- **Check now** checks straight away.
- When an update is available you'll see **What's new**, plus **Download**, **Release page** and **Skip this version**.
- After downloading: **Install and restart** on Windows, or **Open the disk image** on a Mac.
- **Check for updates automatically** looks once a day, shortly after Crater opens. It never downloads or installs anything by itself. On by default.

See [Updating Crater](../getting-started/installation.md#updating-crater).

## Diagnostics

**Send logs to developer** sends Crater's recent log to the developer when something has gone wrong. Add a note in **What went wrong?** to explain what happened.

The log lists file names and paths from your media library and a record of recent activity in the app. It doesn't contain passwords. Nothing is sent unless you click the button.
