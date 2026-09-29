---
title: Importing EasyWorship Media
description: Bring your pictures, backgrounds and videos across from EasyWorship 6 or 7 into Crater.
---

# Importing EasyWorship Media

The [song import](importing-songs.md) doesn't bring media across, but your EasyWorship pictures, backgrounds and videos are ordinary files in a folder. You copy them into Crater's [Media](../features/media.md) tab yourself, and it takes about ten minutes.

## Find your EasyWorship media

On the computer that has EasyWorship installed, pictures and videos are usually in these two folders:

```text
C:\Users\Public\Documents\Softouch\EasyWorship\Default\Resources\Images
```

```text
C:\Users\Public\Documents\Softouch\EasyWorship\Default\Resources\Videos
```

Copy a path, paste it into the address bar at the top of File Explorer and press **Enter** to jump straight there.

These are in **Public Documents**, the folder shared by everyone on the computer, not the Documents folder in your own user profile.

!!! info "Different profile name?"
    `Default` is the name of the EasyWorship profile. If your church set up a profile with another name, go up to the `EasyWorship` folder and open the one that matches.

If Crater is on a different computer, copy both folders across on a USB drive first. EasyWorship doesn't need to be installed on the computer running Crater.

## Convert WMV videos first

Many EasyWorship libraries have videos in **WMV** format, especially older motion backgrounds. Crater can't play WMV, and it leaves those files out of an import without a message, so convert them to MP4 before you start.

To see whether you have any, open the Videos folder, switch File Explorer to **Details** view and click the **Type** column to group the files.

To convert them, use [HandBrake](https://handbrake.fr), a free video converter:

1. Open HandBrake, click **Folder (Batch Scan)** and choose the Videos folder.
2. Choose the **Fast 1080p30** preset and check that **Format** is **MP4**.
3. Under **Save As**, pick a new folder to save into, for example `Documents\Converted videos`.
4. Click **Add to Queue** > **Add All**, then **Start Queue**. Long videos can take a while.

HandBrake converts every video in the folder, not only the WMV ones. You only need the converted WMV files, so you can delete the rest afterwards.

## Import into Crater

1. Open the **Media** tab.
2. In File Explorer, open the EasyWorship **Images** folder and press **Ctrl + A** to select every file.
3. Drag the files onto the Media tab and let go.

    Or click the **+** button in the Media tab, go to the same folder, press **Ctrl + A** and click **Open**.

4. Do the same for the **Videos** folder, and for your folder of converted videos if you made one.

!!! warning "Select the files, not the folder"
    Dragging a whole folder onto the Media tab doesn't import anything. Open the folder and select the files inside it.

Crater copies each file into its own data folder, so your EasyWorship folders are left exactly as they were. You can keep using EasyWorship while you switch.

## Check everything came across

Click **Images**, then **Videos**, in the Media sidebar. The count above the items should match the number of files you imported. Video thumbnails can take a few seconds to appear the first time.

From here, everything in [Media](../features/media.md) works on your imported items: setting the fit, cropping, looping, and choosing your logo background.

## What comes across

| Imported | Not imported |
|----------|--------------|
| Pictures: PNG, JPEG, GIF, BMP, WebP | WMV videos, until converted |
| Videos: MP4, MOV, M4V, WebM, MKV, AVI | Audio files |
| File names, used as item titles | Titles and tags set in EasyWorship |
| | Presentations, schedules and themes |

Files can be up to 4 GB each.

## If something is missing

### Some videos didn't appear

They are most likely WMV files. Convert them to MP4 as shown [above](#convert-wmv-videos-first), then import the converted copies.

### The Resources folder is empty or missing

Check that you're in `C:\Users\Public\Documents` and not your own Documents folder. File Explorer may show it as **Public Documents**.

If the folder really is empty, EasyWorship may have been set to use media from where it already was instead of copying it into its own folder. Your files are then still in the place they were first added from, such as a USB drive, the Downloads folder or a shared church drive. Import them from there.

### Nothing happened when I dropped the files

Make sure you dropped files rather than a folder, and that they're in one of the formats listed above.
