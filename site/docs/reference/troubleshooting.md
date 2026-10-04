---
title: Troubleshooting
description: Fixes for common Crater problems with installing, displays, content, themes, updates and data.
---

# Troubleshooting

## Installing and starting

### Windows says "Windows protected your PC"

Crater isn't code-signed yet, so SmartScreen doesn't recognise it. Click **More info**, then **Run anyway**. If you downloaded Crater from this site or the [GitHub releases page](https://github.com/vygr-labs/crater-v2/releases), it's safe. You can [check the download's checksum](../downloads.md#checking-your-download) to be sure.

### macOS says Crater can't be opened

Crater isn't signed with an Apple Developer ID yet. Follow [Opening Crater the first time](../getting-started/installation.md#opening-crater-the-first-time).

### The portable version complains about a missing DLL

If Windows mentions `VCRUNTIME140.dll` or `MSVCP140.dll`, run `vc_redist.x64.exe` from the Crater folder once, then start Crater again. The installer version sets this up for you.

### The first start takes a few seconds

On its very first start, Crater sets up its Bible library before the window appears. This happens once. Later starts are quicker.

### Crater closes straight away after I installed an older version

Crater's data is upgraded when a new version first runs, and an older version can't open upgraded data. It closes to protect your library. Install the [latest version](../downloads.md) again.

## The projection screen

### Nothing appears on the projector

Work through these in order:

1. **Is the projection window open?** The top-right button should say **End Live**. If it says **Go Live**, click it.
2. **Is Clear on?** If the **Clear** button is lit, the text is hidden. Click it (or press **Ctrl + C**).
3. **Is Logo on?** If the **Logo** button is lit, click it to go back to the content.
4. **Is anything live?** The Live panel should show a red **LIVE** badge. Double-click an item to send it live.
5. **Is it on the right screen?** See the next question.

### The projection is on the wrong screen

Click the arrow next to **Go Live** and choose the right screen, or set **Settings > Projection > Output display**. Crater remembers the screen by name for next time.

### I only see a small window in the bottom-right corner

Crater only sees one screen, so it shows the projection as a corner preview.

- Check the projector is on and connected, and that the computer is set to **extend** the desktop (**Win + P** > **Extend** on Windows, **System Settings > Displays** on a Mac).
- To use a single screen on purpose, turn on **Settings > Projection > Single display: full-size projection behind the console**.

### My projector isn't in the list of screens

Crater lists the screens the operating system reports. If the computer itself doesn't show the projector in its display settings, check the cable, the adapter and the projector's input source. Crater updates its list as soon as the screen appears.

### The projector was unplugged during the service

Plug it back in. Crater finds it by name and puts the projection back, full screen, with the same content. Meanwhile the projection shows as a small preview on the console screen.

### The screen says "Default scripture theme has not been set"

Crater couldn't find a theme for that kind of content. On the **Themes** tab, right-click a scripture theme (such as **Classic Dark**), open **Set as default scripture theme** and choose **Set for Primary HDMI**. Use the same steps for songs or presentations.

### Text is too small or too big

Text size comes from the theme. Edit the theme and change the text box's **Size**, or turn on **Auto-fit** and set a **Max** size so long verses shrink and short ones stay large. Making the text box bigger also helps. See [Designing Themes](../guides/creating-themes.md).

### My changes don't show on screen

Crater shows the version of an item from the moment it went live. Click a slide in the Live panel or send the item live again to pick up changes. Media edits (fit, crop, loop) show the next time the item goes live.

## Scripture and songs

### A verse reference isn't found

- Check the **Interpreted:** line under the search box to see how Crater read your typing.
- Make sure the search box is in **reference mode** (book icon). Press **Ctrl + F** to switch.
- Use a colon or space between chapter and verse (`John 3:16` or `John 3 16`), not a dot.
- Ranges only work within one chapter (`John 3:16-18`).
- Some translations don't include every book. The Passion Translation (TPT) is missing several Old Testament books.

### A word search finds nothing

- Make sure the search box is in **search mode** (magnifier icon).
- Words shorter than three letters are ignored. Add a longer word from the verse.
- Search only covers the selected translation. Click the library icon beside the search box to search them all.

### Ctrl + C cleared the screen instead of copying

In Crater's console, **Ctrl + C** toggles **Clear**. Press it again to bring the text back. To copy a verse, use the copy button above the Scripture list or in the Preview panel.

### Songs from EasyWorship lost their formatting

Crater imports EasyWorship lyrics as plain text. Add bold, italic or colour in the [song editor](../guides/managing-songs.md#formatting-lyrics).

## Media

### A PDF won't import

Crater can't open encrypted or password-protected PDFs. Save an unprotected copy. Also, bring PDFs in by dragging them onto the Media tab.

### A video has no sound

- Open the video's **Edit…** dialog and check **Mute audio** is off.
- Check the computer's sound output is set to your speakers or mixer.

## Themes

### My theme won't save

- **Built-in themes** can't be changed. Right-click the theme and choose **Duplicate**, then edit the copy.
- If Crater shows an error about a layer's **x** or **y**, a layer is partly off the canvas. Select it and move it back so its **X** and **Y** are between 0% and 100%.

### A shared theme looks different on another computer

Fonts installed on the computer (not imported into Crater) aren't included in exported themes. Install the same fonts on the other computer, or import the font into Crater and bundle it when you export. See [Sharing themes](../features/themes.md#sharing-themes).

## Updates

### The update was deleted after downloading

Crater checks every update against its published checksum and deletes it if they don't match, usually after a download was interrupted. Click **Download** to try again.

### Settings > Updates says I'm up to date, but there's a newer version on GitHub

The updater only offers finished releases. If you want a version that's still being tested, download it from the [releases page](https://github.com/vygr-labs/crater-v2/releases) yourself.

## Where Crater keeps your data

All your songs, schedules, themes, imported media and fonts are in one folder:

| System | Folder |
|--------|--------|
| Windows | `%APPDATA%\Voyager Labs\Crater` (paste this into File Explorer's address bar) |
| macOS | `~/Library/Application Support/Voyager Labs/Crater` |
| Linux | `~/.local/share/Voyager Labs/Crater` |

Inside it:

- `songs.sqlite` holds your songs and collections.
- `app.sqlite` holds themes, saved schedules and presentations.
- `bibles.sqlite` holds the Bible translations.
- `media` holds Crater's copies of your pictures, videos and PDFs.
- `fonts` holds imported fonts.
- `crater.log` is Crater's log file.

On Windows, settings like your console theme and output screens are stored in the registry under `HKEY_CURRENT_USER\Software\Voyager Labs\Crater`.

### Backing up

1. Close Crater.
2. Copy the whole data folder to a USB drive or cloud storage.

To restore, close Crater and copy the folder back to the same place, on the same computer and user account.

!!! warning "Moving to a different computer"
    Crater records exactly where each media file is stored. Restoring the folder under a different user name or on a Mac instead of a PC (or the reverse) isn't supported yet, and your pictures and videos may be lost. Keep the original files so you can import them again.

## Still stuck?

1. Go to **Settings > Diagnostics**, describe what happened in **What went wrong?**, and click **Send logs to developer**.
2. Or [open an issue on GitHub](https://github.com/vygr-labs/crater-v2/issues) with:
    - Your Crater version (shown in **Settings > Updates**)
    - Windows or macOS, and which version
    - What you were doing and what happened
    - Screenshots if you can
