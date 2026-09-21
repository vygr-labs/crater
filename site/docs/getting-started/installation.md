---
title: Installation
description: Install Crater on Windows or macOS and keep it up to date.
---

# Installation

Crater takes a couple of minutes to install. Get the right file from the [Downloads](../downloads.md) page first.

## Windows

### Using the installer (recommended)

1. **Run the installer.** Double-click the installer in your Downloads folder. It's named after the version, like `Crater-Setup-0.7.2.exe`.
2. **Get past SmartScreen.** Crater isn't code-signed yet, so Windows may show *"Windows protected your PC"*. Click **More info**, then **Run anyway**.
3. **Allow the installer to make changes.** Crater installs for every user on the computer, so Windows asks for permission. Click **Yes**.
4. **Follow the wizard.** Crater installs to `C:\Program Files\Crater`. Leave **Create a desktop shortcut** ticked if you want one.
5. **Launch Crater** from the last page of the wizard, the Start menu or the desktop shortcut.

The installer also sets up the Microsoft Visual C++ runtime if your computer doesn't already have it.

### Using the portable zip

1. Unzip the portable zip (like `Crater-0.7.2-win64.zip`) to any folder, for example on a USB drive.
2. Run `crater.exe` from that folder.
3. If Windows reports a missing `VCRUNTIME140.dll` or `MSVCP140.dll`, run `vc_redist.x64.exe` from the same folder once, then start Crater again.

!!! info
    The in-app updater always installs the Windows installer version. If you use the portable zip, download new versions from the [Downloads](../downloads.md) page instead.

## macOS

1. Open the disk image you downloaded (like `Crater-0.7.2-macos.dmg`).
2. Drag **crater** onto the **Applications** shortcut in the window that appears.
3. Eject the disk image.
4. Open Crater from Applications.

### Opening Crater the first time

Crater isn't signed with an Apple Developer ID yet, so macOS blocks it on the first launch. You only need to do this once.

=== "macOS 15 Sequoia and later"

    1. Try to open Crater. When macOS says it can't be opened, click **Done**.
    2. Open **System Settings > Privacy & Security**.
    3. Scroll down to the message about Crater and click **Open Anyway**.
    4. Confirm with your password or Touch ID, then click **Open**.

=== "macOS 14 Sonoma"

    1. In Finder, open **Applications**.
    2. Hold **Control** and click **crater**, then choose **Open**.
    3. Click **Open** in the warning dialog.

## The first launch

The first time Crater starts, it sets up its Bible library. This takes a few seconds and happens once. Then the console appears. Continue with [First Launch](first-launch.md) to choose your projection screen.

## Updating Crater

Crater checks for a new version once a day, shortly after it opens. When one is available, a small dot appears on the **Settings** gear in the top bar.

1. Open **Settings > Updates**. You'll see what's new in the release.
2. Click **Download**. Crater checks the download against the release's published SHA-256 checksum and deletes it if it doesn't match.
3. Install it:
    - **Windows:** click **Install and restart**, then **Close and install**. Windows asks for permission to run the installer, and Crater reopens by itself when it's done. The projection screen goes dark while this happens, so don't update in the middle of a service.
    - **macOS:** click **Open the disk image** and drag Crater onto Applications, replacing the copy already there.

You can also click **Check now** at any time, or turn off **Check for updates automatically**. Nothing downloads or installs without you clicking.

Your songs, themes, schedules, media and settings are kept when you update.

## Uninstalling

- **Windows:** use **Settings > Apps > Installed apps > Crater > Uninstall**, or **Uninstall Crater** in the Start menu.
- **macOS:** drag Crater from Applications to the Trash.

Uninstalling leaves your data behind so that a reinstall picks up where you left off. To remove it as well, delete the data folder listed under [Where Crater keeps your data](../reference/troubleshooting.md#where-crater-keeps-your-data).

---

**Next:** [First Launch](first-launch.md)
