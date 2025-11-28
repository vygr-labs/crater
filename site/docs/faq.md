# Frequently Asked Questions

Find answers to common questions about using Crater for church projection.

## General Questions

### What is Crater?

Crater is a free, open-source scripture projection software designed for churches. It allows you to display Bible verses, song lyrics, images, and videos on a projector or secondary screen during worship services.

### Is Crater really free?

Yes! Crater is 100% free to download, install, and use. There are no subscription fees, no premium features behind a paywall, and no hidden costs. It's open-source software built for the church community.

### What operating systems does Crater support?

Currently, Crater is available for Windows (Windows 10 and later). Future versions may support macOS and Linux.

### Do I need an internet connection to use Crater?

No, Crater works completely offline. Once installed, you don't need an internet connection to use it during services.

---

## Setup Questions

### How do I connect to my projector?

1. Connect your projector to your computer using HDMI, VGA, or another display cable
2. Set Windows to "Extend" mode (press Windows + P)
3. Open Crater Settings and select the projector from the display list
4. Click the projection button to open the projection window

See [First Launch Setup](getting-started/first-launch.md) for detailed instructions.

### Can I use Crater with one screen?

While Crater is designed for dual-screen setups (control + projection), you can technically run it on one screen. However, you'd see the control window and projection window overlapping, which isn't ideal for services.

### How do I know which display is which?

In Windows Display Settings, you can identify displays by clicking the "Identify" button. Numbers will appear on each screen showing their ID.

---

## Scripture Questions

### What Bible translations are included?

Crater comes with several popular translations including NKJV and KJV. The available translations are shown in the Scripture tab's translation selector.

### Can I add more Bible translations?

Currently, you use the translations that come with Crater. Future updates may include additional translations.

### How do I search for a specific verse?

Use the quick search feature:

1. Go to the Scripture tab
2. Make sure quick search mode is active (tree icon)
3. Type the reference (e.g., "John 3:16")
4. Press Enter

See [Quick Scripture Search](guides/quick-search.md) for more details.

---

## Song Questions

### How do I add songs to the library?

1. Go to the Songs tab
2. Click the Add (+) button
3. Enter the song title
4. Add each section (verse, chorus, etc.) with lyrics
5. Click Save

See [Managing Songs](guides/managing-songs.md) for detailed instructions.

### Can I import songs from other software?

Currently, songs need to be entered manually. Copy/paste from lyrics websites works well.

### How should I format song sections?

Use clear labels like:

- Verse 1, Verse 2, Verse 3
- Chorus
- Bridge
- Pre-Chorus
- Tag

Keep lines short enough to fit on the projection screen comfortably.

---

## Theme Questions

### What's the difference between a song theme and scripture theme?

**Song themes** are designed to display lyrics with section labels.
**Scripture themes** are designed to display verses with book/chapter/verse references.

Each type is optimized for its content.

### How do I create a custom theme?

1. Go to the Themes tab
2. Click the Add (+) button
3. Choose the theme type
4. Design using the Theme Editor
5. Save with a name

See [Creating Themes](guides/creating-themes.md) for the complete guide.

### Why does my text look small on the projection?

Edit your theme and increase the font size. For projection, text should typically be 48pt or larger. Test from the back of your room to ensure readability.

---

## During Service Questions

### How do I advance to the next verse/slide?

Once content is in the Live Panel:

- Press the **Down Arrow** key to advance
- Press the **Up Arrow** key to go back

### How do I quickly clear the screen?

Click the **Clear** button in the menu bar. Click again to restore the content.

### What if the worship leader repeats a section?

Press the **Up Arrow** key to go back to previous sections. You can repeat any section as many times as needed.

### What if someone calls out an unplanned scripture?

1. Quickly go to the Scripture tab
2. Use quick search to type the reference
3. Double-click to display immediately

---

## Technical Questions

### Where does Crater store my data?

Crater stores songs, themes, and settings in a local database on your computer. This data persists between sessions and updates.

### Will updates delete my songs and settings?

No, updates preserve your data. However, it's always good practice to note your important songs and settings.

### How do I backup my data?

Currently, manual backup involves copying the app data folder. Look for the Crater folder in your AppData directory.

### Crater is running slowly. What can I do?

1. Close other applications
2. Restart Crater
3. Avoid importing very large media files
4. Ensure your computer meets the minimum requirements

---

## Troubleshooting Questions

### The projection window won't open

1. Check your display connection
2. Verify the display is selected in Settings
3. Restart Crater
4. Try pressing Windows + P and selecting "Extend"

### Songs/scripture won't display

1. Make sure you double-clicked (not single-clicked)
2. Check that the Logo mode isn't active
3. Ensure a theme is set for that content type
4. Verify the projection window is open

### I can't find a verse

1. Check your spelling
2. Try abbreviations (Jn for John, Matt for Matthew)
3. Verify the format: `Book Chapter:Verse`
4. Make sure you're using the right translation

See [Troubleshooting](reference/troubleshooting.md) for more solutions.

---

## Getting More Help

### Where can I report bugs?

Open an issue on the [GitHub repository](https://github.com/CodeKing12/crater/issues). Include:

- What you were doing
- What happened
- Steps to reproduce the issue

### How can I suggest features?

Feature suggestions are welcome! Open an issue on GitHub and describe your idea.

### How can I contact the developer?

Email: eyetukingsley330@gmail.com

### How can I support this project?

- Star the repository on GitHub
- Report bugs and suggest improvements
- Share Crater with other churches
- Contribute to the code if you're a developer

---

## Quick Reference

| Task | How To |
|------|--------|
| Display content | Double-click |
| Preview content | Single-click |
| Next verse/section | Arrow Down |
| Previous verse/section | Arrow Up |
| Clear screen | Click Clear button |
| Show logo | Click Logo button |
| Quick scripture search | Type "John 3:16" format |

---

*Have a question not answered here? [Open an issue](https://github.com/CodeKing12/crater/issues) or email eyetukingsley330@gmail.com*
