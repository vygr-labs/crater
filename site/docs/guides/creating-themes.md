---
title: Designing Themes
description: Design song, scripture and presentation themes in Crater's visual theme editor, import fonts, and have an AI assistant draft a theme for you.
---

# Designing Themes

Crater's theme editor is a visual design tool, a little like a simple slide designer. You build a theme from **layers** (text boxes and containers), see the result as you work, and save it for every service.

For what themes are and how defaults work, see [Themes](../features/themes.md).

## Opening the editor

On the **Themes** tab:

- Click **New theme** and choose **Song theme**, **Scripture theme** or **Presentation theme**. A new theme starts with a dark background and one text box.
- Or double-click an existing theme, or right-click it and choose **Edit**.

Built-in themes can't be edited. Right-click one and choose **Duplicate** to get your own copy to change.

## The editor at a glance

```text
┌───────────────────────────────────────────────────────────────────────┐
│ Theme Editor  [Song]  Unsaved          Design with AI     Save Theme  │  Header
├───────────────────────────────────────────────────────────────────────┤
│ + Text  + Container  Undo Redo  Copy Delete  Align  Front/Back  Zoom  │  Toolbar
├────────────┬──────────────────────────────────────────┬───────────────┤
│  LAYERS    │                                          │  PROPERTIES   │
│            │               Canvas                     │               │
│            │     (sample verse or lyric text)         │               │
├────────────┴──────────────────────────────────────────┴───────────────┤
│ Name: [Sunday Morning]                          Cancel    Save Theme  │  Footer
└───────────────────────────────────────────────────────────────────────┘
```

- **Layers** (left) lists every element. The top of the list is in front.
- **Canvas** (centre) shows the theme with sample text, such as John 3:16 or a verse of Amazing Grace, drawn exactly as it will look on screen.
- **Properties** (right) shows the settings of the selected layer.
- **Name** (bottom) is the theme's name.

## Building a theme step by step

A typical theme is a background container with one or two text boxes on top.

### 1. Set the background

1. Click **Container** in the toolbar.
2. Drag its handles to fill the canvas.
3. In **Properties > Background**, choose **Solid** and pick a colour, or **Gradient** (see below).
4. To use a picture or video from your Media library, pick it under **Media** and set its **Opacity**.
5. Drag the container to the bottom of the Layers list so it sits behind everything else.

### 2. Add the text

1. Click **Text** in the toolbar.
2. In **Properties > Content**, choose what this box shows:
    - **Verse text** or **Lyric** for the main words
    - **Reference / title** for the verse reference or song title
    - **Slide title**, **Slide subtitle**, **Slide body** or **Slide right column** on presentation themes
    - **Custom text** for fixed words, like your church name
3. Drag and resize the box to where the words should go.

### 3. Style the text

- **Typography.** Pick a font (each name is shown in its own typeface), size, weight from Thin to Black, line spacing and letter spacing.
- **Colour.** The text colour.
- **Shadow.** Turn on **Drop shadow** and set its offset, blur and colour. A soft shadow keeps text readable over busy backgrounds.
- **Alignment.** Left, centre or right, top, middle or bottom, and text case (as typed, UPPER, lower or Title Case).
- **Auto-fit.** Shrinks long verses and lyrics to fit the box, up to the **Max** size you set.
- **Auto-layout.** Keeps a box **above** or **below** another one with a set **gap**, so a reference line always sits just under the verse however long the verse is. This takes effect on the live screen.

### 4. Save

Type a name in the footer and click **Save Theme** (or press **Ctrl + S**, which saves and closes the editor).

!!! warning "Keep layers inside the canvas"
    You can drag a layer partly off the edge while you work, but Crater only saves a theme when every layer's **X** and **Y** position is between 0% and 100%. If saving shows an error about a position, move that layer back onto the canvas.

## Working on the canvas

| To... | Do this |
|-------|---------|
| Move a layer | Drag it, or press the arrow keys (1% steps, **Shift** for 5%) |
| Resize | Drag any of the eight handles |
| Rotate | Drag the handle above the layer. Hold **Shift** to snap to 15° steps. |
| Skew | Drag the handle to the left of the layer. Hold **Shift** to keep to one direction. |
| Measure the gap between two layers | Select one, then hold **Alt** and point at the other |
| Duplicate / delete | **Ctrl + D** / **Delete** |
| Undo / redo | **Ctrl + Z** / **Ctrl + Y** (50 steps) |
| Zoom | The toolbar buttons (10% to 400%), or **Ctrl + 0** to reset |
| Deselect | **Esc**. Press **Esc** again to leave the editor. |

The toolbar also aligns the selected layer to the left, centre, right, top, middle or bottom of the canvas, and brings it to the front or sends it to the back.

Right-click a layer on the canvas for the same actions plus **Bring forward**, **Send backward**, **Lock** and **Hide**. Right-click empty canvas to add a text box or container.

## The Layers panel

- Drag rows to change which layer is in front.
- Hover a row for **show/hide**, **lock**, **duplicate** and **delete** buttons. Locked layers can't be moved by accident.
- Double-click a row (or right-click > **Rename layer**) to give it a name like *Verse* or *Background*.

## Transform settings

Every layer has a **Transform** section with exact values:

- **X** and **Y**: position, as a percentage of the canvas.
- **W** and **H**: width and height, as a percentage of the canvas.
- **Rot**: rotation in degrees.
- **SkX** and **SkY**: skew in degrees.
- **Opacity**.

Using percentages means a theme looks the same on any screen resolution.

## Containers

Containers are coloured boxes, picture frames and backgrounds.

- **Background.** **Solid** fill, or **Gradient** with **Linear**, **Radial**, **Conic** or **Mesh** styles and 2 to 6 colour stops. Linear and conic gradients have an **Angle**. Conic and mesh gradients can **Animate** slowly, at a **Speed** you choose, for a gently moving background.
- **Media.** A picture or video from your Media library, with its own **Opacity**. On presentation themes, **Use the slide's picture** shows whatever picture each slide chooses.
- **Corner Radius.** Rounds the corners.
- **Card / Group.** Stacks other layers inside the container from top to bottom, with padding and gaps, so the box grows to fit its text. Add layers under **Members**. This is how lower-thirds and caption cards are built. Card layout takes effect on the live screen. The editor canvas shows the members where you placed them.

## Designs for presentation themes

A presentation theme holds several **designs**, one for each kind of slide. The **Designs** rail in the editor shows them as thumbnails.

- Click **Add design** to add one of the standard designs (**Title slide**, **Section divider**, **Title + content**, **Two columns**, **Quote**, **Picture**, **Blank**) or **Custom design…** with your own name.
- A new design starts from the default design's background and styling, so they all match.
- Each design's menu has **Rename…**, **Duplicate**, **Set as default**, **Move left**, **Move right** and **Delete design**. The default design has a star.

In the [presentation editor](../features/presentations.md#slide-designs), each slide picks one of these designs.

## Fonts

Any font installed on your computer is available. To use a font that isn't installed:

1. On the **Themes** tab, click **Import > Import font…** (or go to **Settings > Projection > Fonts > Import font…**).
2. Choose a `.ttf` or `.otf` file.

Imported fonts appear in every theme's font list, marked *imported*, and can be bundled into exported themes. Remove them in **Settings > Projection > Fonts**.

## Designing with AI

Crater can hand the design work to an AI chat assistant such as Claude or ChatGPT. Crater itself doesn't connect to any AI service. You copy a prompt out and paste the reply back in.

1. In the theme editor, click **Design with AI**.
2. **Describe what you want**, for example *"Warm, candle-lit, serif type. Something for a carol service."* Or leave it blank to let the AI choose.
3. Tick **Send my current design too, and evolve it** if you want changes to what's already on the canvas.
4. Click **Copy prompt** and paste it into your AI assistant.
5. Copy the whole reply and paste it into **Paste the reply back**. Crater checks it as you paste and tells you when it's ready. Extra chatter around the design is fine.
6. Click **Load into editor**. The design appears on the canvas as one step you can undo.
7. Adjust anything you like, then click **Save Theme**.

AI-made designs use fonts already on your computer and don't include pictures or videos. Add those yourself afterwards.

You can also save an AI reply as a `.json` file and bring it in with **Import > Import theme JSON…** on the Themes tab.

## Leaving the editor

**Cancel** (or **Esc** with nothing selected) closes the editor. If you have unsaved changes, Crater asks before discarding them.
