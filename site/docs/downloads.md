---
title: Downloads
description: Download Crater for Windows, macOS and Linux.
---

# Downloads

Crater is free to download and use on as many computers as you like.

Latest version: <span data-crater-version>v0.7.2</span> · [Release notes](https://github.com/vygr-labs/crater-v2/releases/latest){ data-crater-release-page }

## Windows

For Windows 10 and Windows 11, 64-bit.

| Download | Size | Use it when |
|----------|------|-------------|
| [**Windows installer (.exe)**](https://github.com/vygr-labs/crater-v2/releases/download/v0.7.2/Crater-Setup-0.7.2.exe){ data-crater-asset="win-setup" } | <span data-crater-size="win-setup">94 MB</span> | Recommended for most churches. Installs Crater for everyone on the computer, adds Start menu and desktop shortcuts, and supports in-app updates. |
| [Portable zip](https://github.com/vygr-labs/crater-v2/releases/download/v0.7.2/Crater-0.7.2-win64.zip){ data-crater-asset="win-zip" } | <span data-crater-size="win-zip">101 MB</span> | You can't run installers on the computer. Unzip it anywhere and run `crater.exe`. |

## macOS

For macOS 14 Sonoma or later. One download runs natively on both Intel and Apple Silicon Macs.

| Download | Size | Use it when |
|----------|------|-------------|
| [**macOS disk image (.dmg)**](https://github.com/vygr-labs/crater-v2/releases/download/v0.7.2/Crater-0.7.2-macos.dmg){ data-crater-asset="mac-dmg" } | <span data-crater-size="mac-dmg">139 MB</span> | Recommended. Open it and drag Crater into Applications. |
| [macOS zip](https://github.com/vygr-labs/crater-v2/releases/download/v0.7.2/Crater-0.7.2-macos.zip){ data-crater-asset="mac-zip" } | <span data-crater-size="mac-zip">118 MB</span> | You prefer a plain zip of the app. |

!!! warning "First launch on a Mac"
    Crater isn't signed with an Apple Developer ID yet, so macOS will warn you the first time you open it. The [installation guide](getting-started/installation.md#macos) shows how to open it anyway.

## Linux

For 64-bit Linux with glibc 2.35 or newer: Ubuntu 22.04, Debian 12, Fedora 36 and later.

| Download | Size | Use it when |
|----------|------|-------------|
| [**Linux AppImage**](https://github.com/vygr-labs/crater-v2/releases/download/v0.7.4/Crater-0.7.4-x86_64.AppImage){ data-crater-asset="linux-appimage" } | <span data-crater-size="linux-appimage">92 MB</span> | One file that runs on most distributions. Mark it as executable, then double-click it. The [installation guide](getting-started/installation.md#linux) shows how. |

## Checking your download

Every release includes a [`SHA256SUMS.txt`](https://github.com/vygr-labs/crater-v2/releases/latest){ data-crater-asset="checksums" } file listing the SHA-256 checksum of each download. Crater's built-in updater checks this file automatically. To check a manual download yourself:

=== "Windows (PowerShell)"

    ```powershell
    Get-FileHash .\Crater-Setup-0.7.2.exe -Algorithm SHA256
    ```

=== "macOS (Terminal)"

    ```bash
    shasum -a 256 Crater-0.7.2-macos.dmg
    ```

=== "Linux (Terminal)"

    ```bash
    sha256sum Crater-0.7.4-x86_64.AppImage
    ```

The value printed should match the line for that file in `SHA256SUMS.txt`.

## System requirements

| | Minimum |
|---|---|
| **Operating system** | Windows 10 or 11 (64-bit), macOS 14 Sonoma or later, or 64-bit Linux with glibc 2.35 or newer (Ubuntu 22.04, Debian 12, Fedora 36 and later) |
| **Memory** | 4 GB RAM |
| **Graphics** | On Windows, a graphics chip with Direct3D 11 support. Crater is designed for Intel HD 4000-class laptops and newer. |
| **Disk space** | About 1 GB free. The app itself takes about 230 MB on Windows and 320 MB on a Mac, and the Bible library adds about 300 MB after first launch. Media you import is copied into Crater's data folder, so allow extra space for videos. |
| **Displays** | One screen works. A second screen, projector or TV is recommended for the audience. |

## Previous versions

Every release, with its notes, is on the [GitHub releases page](https://github.com/vygr-labs/crater-v2/releases).

## Having trouble?

See [Troubleshooting](reference/troubleshooting.md) or [open an issue on GitHub](https://github.com/vygr-labs/crater-v2/issues).
