# Troubleshooting

This guide helps you solve common issues with Crater. Find your problem below and follow the solution steps.

## Display Issues

### Projection window doesn't appear

**Symptoms:**
- Clicked the projection button but nothing shows
- Window opens on wrong screen

**Solutions:**

1. **Check display connection**
   - Verify cable is connected
   - Make sure projector/monitor is turned on
   
2. **Check Windows display settings**
   - Press `Windows + P`
   - Select "Extend"
   - Both screens should show different content

3. **Select the correct display**
   - Open Crater Settings
   - Choose your projector from the display dropdown
   - Close and reopen the projection window

4. **Restart Crater**
   - Close Crater completely
   - Reopen the application
   - Try opening the projection window again

### Content not appearing on projection

**Symptoms:**
- Projection window is open but shows nothing
- Black screen on projector

**Solutions:**

1. **Check if content is live**
   - Make sure you double-clicked to send content live
   - Check the Live Panel shows your content

2. **Check Logo/Clear status**
   - If Logo is active, content is hidden
   - Click the Logo button to toggle off

3. **Check theme settings**
   - Ensure you have a theme selected for the content type
   - Go to Themes and set a default theme

### Text looks fuzzy or hard to read

**Symptoms:**
- Text is blurry on projection
- Edges look soft

**Solutions:**

1. **Check projector focus**
   - Physically adjust the projector lens
   - Use the projector's focus control

2. **Match resolutions**
   - Set Windows to your projector's native resolution
   - Common: 1920x1080, 1280x720

3. **Adjust theme text size**
   - Edit your theme
   - Increase font size
   - Use a clearer font

## Content Issues

### Scripture not found

**Symptoms:**
- Search returns no results
- Can't find a specific verse

**Solutions:**

1. **Check search format**
   - Use: `Book Chapter:Verse` (e.g., John 3:16)
   - Include space between book and chapter
   - Use colon between chapter and verse

2. **Check spelling**
   - Verify book name is spelled correctly
   - Try common abbreviations (Jn, Matt, Rom)

3. **Check translation**
   - Make sure you're using the right Bible version
   - Some verses may be numbered differently between translations

### Song lyrics are wrong

**Symptoms:**
- Incorrect words displayed
- Typos in lyrics

**Solutions:**

1. **Edit the song**
   - Right-click on the song
   - Select Edit
   - Fix the lyrics
   - Save changes

2. **Verify source**
   - Check against a reliable lyrics source
   - Correct any differences

### Theme not applying

**Symptoms:**
- Content displays with wrong styling
- Theme changes not showing

**Solutions:**

1. **Set as default theme**
   - Right-click the theme
   - Select "Set as Scripture/Song Theme"

2. **Refresh the display**
   - Clear the display
   - Re-select and display the content

## Application Issues

### Crater won't start

**Symptoms:**
- Nothing happens when launching
- Crash on startup

**Solutions:**

1. **Wait a moment**
   - First launch can take time to set up database

2. **Run as administrator**
   - Right-click Crater icon
   - Select "Run as administrator"

3. **Check antivirus**
   - Some antivirus may block Crater
   - Add Crater to your antivirus exceptions

4. **Reinstall**
   - Uninstall Crater
   - Download the latest version
   - Install fresh

### Application running slowly

**Symptoms:**
- Laggy interface
- Slow response to clicks
- Delayed content display

**Solutions:**

1. **Close other applications**
   - Free up system memory
   - Close unused browser tabs

2. **Optimize media**
   - Use appropriately sized images
   - Don't import unnecessarily large files

3. **Restart Crater**
   - Close and reopen the application
   - This clears temporary memory

### Crashes during use

**Symptoms:**
- Application closes unexpectedly
- Error messages appear

**Solutions:**

1. **Note what you were doing**
   - What action caused the crash?
   - Can you reproduce it?

2. **Restart Crater**
   - Reopen the application
   - Try the action again

3. **Report the issue**
   - If crashes persist, report on GitHub
   - Include steps to reproduce

## Setup Issues

### Can't detect external display

**Symptoms:**
- Projector not listed in Settings
- Only one display option available

**Solutions:**

1. **Check physical connection**
   - Verify cable is firmly connected
   - Try a different cable if available
   - Try a different port on your computer

2. **Check in Windows**
   - Open Windows Display Settings
   - Click "Detect" button
   - Verify the display appears

3. **Restart after connecting**
   - Connect the display
   - Restart your computer
   - Open Crater

### Display appears on wrong screen

**Symptoms:**
- Projection shows on laptop instead of projector
- Content visible to operator only

**Solutions:**

1. **Check Windows display arrangement**
   - Open Windows Display Settings
   - Ensure displays are arranged correctly
   - Identify which is display 1 vs 2

2. **Select correct display in Crater**
   - Open Settings
   - Choose the correct display
   - Test by opening projection window

## Before Seeking Help

### Information to gather

When reporting issues, collect:

1. **What happened**
   - Describe the problem clearly
   - What did you expect vs. what occurred?

2. **Steps to reproduce**
   - What were you doing when the issue occurred?
   - Can you make it happen again?

3. **System information**
   - Windows version
   - Crater version
   - Computer specifications

### Getting Help

If you can't solve your issue:

1. **Check FAQ**
   - See the [FAQ page](../faq.md) for common questions

2. **GitHub Issues**
   - [Open an issue](https://github.com/CodeKing12/crater/issues)
   - Describe your problem in detail

3. **Contact Developer**
   - Email: eyetukingsley330@gmail.com

---

**Related Topics:**
- [First Launch Setup](../getting-started/first-launch.md)
- [Application Settings](settings.md)
- [FAQ](../faq.md)
