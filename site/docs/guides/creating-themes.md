# Creating Custom Themes

The Theme Editor allows you to create beautiful, custom themes for your projection display. This guide walks you through the process step by step.

## Opening the Theme Editor

1. Go to the **Themes** tab
2. Click the **Add (+)** button
3. Select the theme type:
   - **Song** - For displaying lyrics
   - **Scripture** - For displaying Bible verses
   - **Presentation** - For general content
4. The Theme Editor opens

## Understanding the Theme Editor

The Theme Editor window contains:

### Editor Canvas

The main area where you design your theme. This represents what will appear on the projection screen.

### Toolbox

Contains the elements you can add to your theme:
- **Container** - Background boxes and areas
- **Text** - Text elements for content

### Settings Panel

When you select an element, its settings appear here for customization.

## Adding Elements

### Adding a Container

Containers are background elements that hold other content.

1. Find "Container" in the Toolbox
2. Drag it onto the canvas
3. Position and resize as needed

### Adding Text

Text elements display your content (lyrics, verses).

1. Find "Text" in the Toolbox
2. Drag it onto the canvas
3. Position where you want text to appear

## Customizing Elements

### Selecting an Element

Click on any element in the canvas to select it. The settings panel will show options for that element.

### Moving Elements

- Click and drag to move
- Use arrow keys for fine adjustments
- Watch the position values in settings

### Resizing Elements

- Drag the corners or edges to resize
- Hold Shift to maintain proportions
- Check width/height in settings

## Styling Text

When a text element is selected, you can customize:

### Font Settings

| Setting | Description |
|---------|-------------|
| Font Family | The typeface (e.g., Arial, Open Sans) |
| Font Size | How large the text appears |
| Font Weight | Bold, normal, light |
| Font Style | Italic, normal |

### Color Settings

| Setting | Description |
|---------|-------------|
| Text Color | The color of the text |
| Background Color | Background behind text |
| Opacity | Transparency level |

### Text Layout

| Setting | Description |
|---------|-------------|
| Text Align | Left, center, right, justified |
| Line Height | Space between lines |
| Letter Spacing | Space between letters |

### Text Effects

| Setting | Description |
|---------|-------------|
| Text Shadow | Drop shadow behind text |
| Text Outline | Border around letters |

## Styling Containers

When a container is selected, you can customize:

### Background

- **Solid Color** - Single color background
- **Gradient** - Blended colors
- **Image** - Background picture
- **Transparent** - See-through

### Border

- Border color
- Border width
- Border radius (rounded corners)

### Position

- X and Y coordinates
- Width and height
- Z-index (layer order)

## Theme Layout Tips

### Scripture Theme Layout

Recommended elements:
1. **Main container** - Dark, semi-transparent background
2. **Verse text** - Large, centered text
3. **Reference text** - Smaller text for book/chapter/verse

Example layout:
```
┌─────────────────────────────────────┐
│                                     │
│    "For God so loved the world,     │
│     that he gave his only           │
│     begotten Son..."                │
│                                     │
│              John 3:16 (KJV)        │
│                                     │
└─────────────────────────────────────┘
```

### Song Theme Layout

Recommended elements:
1. **Main container** - Background area
2. **Lyrics text** - Large, easy-to-read text
3. **Section label** - Optional (Verse, Chorus, etc.)

Example layout:
```
┌─────────────────────────────────────┐
│   Verse 1                           │
│                                     │
│     Amazing grace, how sweet        │
│     the sound,                      │
│     That saved a wretch like me     │
│                                     │
└─────────────────────────────────────┘
```

## Saving Your Theme

1. Enter a name for your theme in the name field
2. Click **Save**
3. Your theme appears in the Themes list

## Editing Existing Themes

1. Go to the Themes tab
2. Right-click on the theme you want to edit
3. Select "Edit"
4. Make your changes
5. Click Save

## Best Practices

### Readability

- **High contrast**: Light text on dark backgrounds
- **Large text**: At least 48pt for main content
- **Simple fonts**: Avoid decorative or thin fonts
- **Generous margins**: Don't crowd the edges

### Visual Design

- **Consistency**: Match your church's brand colors
- **Simplicity**: Less is more for projection
- **Test on projector**: Colors look different on screen vs monitor

### Performance

- **Optimize images**: Large images can slow display
- **Limit effects**: Too many shadows/effects can impact performance

## Common Theme Mistakes

| Mistake | Solution |
|---------|----------|
| Text too small | Increase font size to 48pt+ |
| Low contrast | Use light text on dark or vice versa |
| Busy background | Use solid colors or simple gradients |
| Text near edges | Add padding/margins |
| Thin fonts | Use regular or bold weight |

## Quick Theme Recipes

### Simple Scripture Theme

1. Add a Container (dark, semi-transparent)
2. Add Text for verse (white, 56pt, centered)
3. Add Text for reference (white, 28pt, bottom-right)

### Simple Song Theme

1. Add a Container (dark background)
2. Add Text for lyrics (white, 52pt, centered)
3. Optional: Add Text for section label (smaller, top-left)

### Minimalist Theme

1. No container (transparent background)
2. Add Text with shadow (white, 60pt, centered)
3. Text shadow provides readability on any background

---

**Related Topics:**
- [Working with Themes](../features/themes.md)
- [Displaying Content](displaying-content.md)
