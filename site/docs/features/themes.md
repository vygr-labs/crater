---
title: Themes
description: Themes control how songs, scripture and presentations look on screen. Built-in themes, defaults per screen, sharing and importing.
---

# Themes

A **theme** controls how content looks on screen: the background, fonts, colours, text position, shadows and any pictures or video behind the words. The **Themes** tab lists them all.

## Three kinds of theme

| Kind | Used for |
|------|----------|
| **Song** | Song lyrics |
| **Scripture** | Bible verses and Strong's definitions |
| **Presentation** | Presentation slides. A presentation theme holds several [designs](../guides/creating-themes.md#designs-for-presentation-themes), such as a title slide and a two-column slide. |

Use the **All**, **Songs**, **Scriptures** and **Presentations** buttons at the top of the tab to filter the list.

## Built-in themes

Crater comes with five ready-made themes, marked **PRESET**:

| Theme | Kind |
|-------|------|
| Classic Dark | Song |
| Classic Dark | Scripture |
| Stage Bold | Presentation |
| Clean Light | Presentation |
| Midnight Focus | Presentation |

Built-in themes can't be changed. Right-click one and choose **Duplicate** to get an editable copy.

## Creating and editing themes

- **New theme:** click **New theme** and choose **Song theme**, **Scripture theme** or **Presentation theme**.
- **Edit:** double-click a theme, or right-click it and choose **Edit**.

Both open the theme editor. See [Designing Themes](../guides/creating-themes.md) for a walkthrough, including how to have an AI assistant draft a theme for you.

## Default themes for each screen

Each kind of content has a **default theme**, marked **PRIMARY** on its tile. Anything that doesn't have its own theme uses the default.

Right-click a theme and open **Set as default … theme** to choose where it's the default:

- **Set for Primary HDMI** makes it the default on your main projection screen.
- **Set for NDI Broadcast** gives your live stream a different look, such as a lower third instead of full-screen lyrics. This needs **Settings > NDI > Dual output mode** turned on. See [NDI Streaming](ndi-streaming.md).
- **Set for** *(an extra output)* gives a mirror screen, like a lobby TV, its own look. See [Outputs](outputs.md).

Tiles show which screens use them with badges such as **PRIMARY**, **NDI** or an output's name.

### Which theme wins

When Crater shows an item, it picks the theme in this order:

1. A theme chosen for that item: for one song in the song editor, for one presentation in its editor, or for one schedule row with right-click > **Theme…**.
2. The theme set as default for that screen.
3. The default theme for that kind of content.

You can also set the default song theme in **Settings > Song > Default theme**.

## Sharing themes

### Exporting

Right-click a theme and choose **Export…**. Crater saves a single `.craterheme` file containing the theme plus every picture and video it uses. You can choose which of your imported fonts to bundle in as well. Fonts installed on the computer (like Arial or Segoe UI) are recorded by name only, so the other computer needs them installed too.

!!! warning "Font licences"
    Only bundle fonts whose licence allows you to share them.

### Importing

Click **Import** on the Themes tab:

- **Import theme…** opens a `.craterheme` file from another Crater user. If you already have a theme with the same name, the new one gets *(Import)* added to its name.
- **Import theme JSON…** opens a theme written as a JSON file, for example one saved from an AI assistant. See [Designing Themes](../guides/creating-themes.md#designing-with-ai).
- **Import font…** adds a `.ttf` or `.otf` font for use in any theme.

## Other actions

Right-click a theme to **Duplicate** or **Delete** it. Built-in themes can't be deleted. Deleting a theme happens straight away, so export a copy first if you might want it back.
