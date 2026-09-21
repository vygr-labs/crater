---
title: Outputs and Stage Display
description: Send Crater to several screens at once, with a stage monitor for speakers and musicians, mirror screens with their own themes, transitions, and casting to a TV browser.
---

# Outputs and Stage Display

Crater can drive more than one screen at a time. Besides the main projection, you can add:

- A **stage monitor** facing the platform, showing the words, speaker notes, what's next and a clock.
- **Mirror screens**, such as a lobby TV or overflow room, each with its own theme and on its own display.
- An **NDI stream** for OBS, vMix and other streaming software. See [NDI Streaming](ndi-streaming.md).

## The main projection

The main projection (called **Primary Output**) is the screen the congregation watches. You choose its display from the arrow next to **Go Live**, or in **Settings > Projection**:

- **Output display.** Which screen shows the projection. Crater remembers it by name, so it finds the projector again even if you use a different port.
- **Projection mode.** **Fullscreen** covers the whole screen. **Windowed** shows a movable window, useful for testing.
- **Show projection in Alt-Tab.** When on, the projection window has a taskbar button and appears in Alt-Tab. Turn it off to keep it out of the way.
- **Single display: full-size projection behind the console.** For one-screen setups. See [First Launch](../getting-started/first-launch.md#using-crater-with-only-one-screen).

**Go Live** opens the main projection window and **End Live** closes it.

### If a screen gets unplugged

If the projector's cable is knocked out mid-service, Crater drops the projection to a small preview window and brings the console to the front. When the projector is plugged back in, Crater puts the projection back on it, full screen, with the same content.

## Adding more outputs

Go to **Settings > Projection > Multiple Outputs**.

- A **Stage Monitor** output is already there, switched off.
- Click **Add output** for more. New outputs are called *Output 1*, *Output 2* and so on. Click the name to rename one, for example *Lobby TV*.

For each output, set:

1. **Mode.** **Mirror** shows the same content as the main projection, with its own theme and transition. **Stage** shows the presenter view described below.
2. **Display.** Which screen it goes to.
3. **On/off.** Turn the output on.

An output appears as soon as it's switched on and has a display, whether or not the main projection is live. To stop it, switch it off here, or click its window and press **Esc**.

Crater warns you in the list when:

- An output's display isn't connected. The output stays dark until it comes back.
- No display is chosen yet.
- The display is the one the console is on. The output stays behind the console instead of covering it.
- Two outputs share one display.

With only one screen connected, extra outputs appear as small preview windows in the bottom-left corner until you plug in more screens.

To remove an added output, click its trash button. The built-in Stage Monitor can be switched off but not removed.

## Stage monitor

An output in **Stage** mode is a confidence monitor for the people on the platform. It uses a fixed high-contrast layout designed to be read from a distance, whatever theme the audience sees:

- The **current slide's words**, large.
- **NOTES:** the speaker notes for the current [presentation](presentations.md) slide.
- **NEXT:** what's coming up.
- The item's title, the slide number (for example *3 / 8*) and a **clock**.
- A banner when the audience screen is cleared or showing the logo, so the speaker knows what the room sees.

Set it up by switching on the **Stage Monitor** output (or any output in **Stage** mode) and choosing the screen that faces the platform.

## Themes for each screen

Mirror outputs can each have their own theme. For example, a lobby TV can show lyrics in a smaller, lighter theme. On the **Themes** tab, right-click a theme, open **Set as default … theme**, and choose the output. See [Themes](themes.md#default-themes-for-each-screen).

The stage monitor always uses its own layout.

## Transitions

**Settings > Projection > Transitions** controls how the main projection changes from one slide to the next:

- **Primary output style:** **Cut** (instant), **Crossfade** (the default), or **Fade through black**.
- **Primary output duration:** **Instant**, **Fast** (150 ms), **Normal** (280 ms, the default), **Slow** (500 ms) or **Very slow** (1 second).

When [Dual output mode](ndi-streaming.md#giving-the-stream-its-own-look) is on, the NDI stream gets its own transition settings too.

**Settings > Appearance > Reduce motion** turns every transition into a cut, on every screen.

## Casting to a TV browser

If a TV or phone has a web browser and is on the same network, it can show the live projection without a cable.

1. Go to **Settings > Remote Control** and turn on **Cast to TV browser**.
2. Crater shows an address like `http://192.168.1.20:7373`.
3. Type that address into the browser on the TV or phone. **CONNECTED** lights up while a browser is watching.

A few things to know:

- The browser shows a live picture of the projection at about 12 frames a second, up to 1280×720. That's fine for lyrics and scripture. When a video is live, the browser plays the video itself, with sound.
- It's view-only. The browser can't control Crater.
- Anyone on the same network who knows the address can watch, and there's no password. Use it on your church's own network.
- It switches off each time Crater closes.
- The first time, Windows may ask whether to allow Crater through the firewall. Allow it on **private** networks.
- If the address doesn't open, your computer may have several network adapters (for example a VPN) and Crater may have picked the wrong one. Try disconnecting the VPN.

!!! info "Phone remote control"
    Controlling Crater from a phone or tablet is planned for a future version. The settings for it are already visible in **Settings > Remote Control**, but they're switched off for now.
