---
title: NDI Streaming
description: Send Crater's projection to OBS, vMix, Streamlabs and other streaming software over your network with NDI, with no capture card.
---

# NDI Streaming

Crater can send what's on your projection screen straight into your streaming software (OBS Studio, vMix, Streamlabs, Wirecast and anything else that receives **NDI**) over your church network. You don't need a capture card or an extra cable.

The stream works whether or not the projection window is open, so you can stream lyrics and scripture even from a laptop with no projector attached.

!!! info "Windows only for now"
    NDI output is available in the Windows version of Crater.

## Setting up

### 1. Install NDI Tools

Crater uses the free NDI runtime, which comes with NDI Tools.

1. Download and install **NDI Tools** from [ndi.video/tools](https://ndi.video/tools/).
2. **Restart Crater.** It looks for NDI when it starts.

Once Crater finds NDI, the **NDI** button appears in the top bar and **Settings > NDI** says *NDI runtime ready*.

### 2. Start the stream

Click **NDI** in the top bar, or turn on **Settings > NDI > Enable NDI output**. The status line in Settings changes to *Broadcasting on local network as "Crater Live"*.

The NDI button's icon shows the stream's state:

| Colour | Meaning |
|--------|---------|
| Grey | Not sending |
| Cyan | Sending |
| Gold | A receiver has Crater in its **preview** |
| Red | A receiver has Crater on **program** (on air) |

### 3. Add Crater in your streaming software

In OBS Studio, add a new **NDI Source** (this needs the obs-ndi / DistroAV plugin) and pick the source named after your computer, like **CHURCH-PC (Crater Live)**. vMix, Streamlabs and other programs have their own NDI input. Look for the same name.

The receiving computer needs to be on the same network as the Crater computer.

## Stream settings

In **Settings > NDI**:

- **Stream name.** What receivers see. The default is *Crater Live*. Crater goes back to *Crater Live* each time it starts, so rename it again after a restart if you use a different name.
- **Pixel format.** **BGRA** (full colour, the default), **BGRX** (opaque) or **UYVY** (half the network bandwidth, useful on a busy or wireless network). Takes effect the next time you start the stream.
- **Resolution.** **Native (1080p)** or **720p**. Takes effect the next time you start the stream.
- **Hide pictures and video.** Sends a blank frame whenever a picture or video is live, while lyrics and scripture still go out. Useful when your camera feed already shows the screen, or for video you don't have rights to stream.

## Hiding the stream quickly

Click **Hide NDI** in the top bar to blank the stream without touching the projector, for example during a private prayer time. Click **Show NDI** to bring it back.

After the stream has been showing content for five minutes, a reminder appears in the top bar saying how long NDI has been on. Click it to blank the stream, or ignore it.

## Giving the stream its own look

Full-screen lyrics look great on a projector but often cover the camera on a live stream. **Dual output mode** lets the stream use a different theme, such as a lower third:

1. Turn on **Settings > NDI > Dual output mode**.
2. On the **Themes** tab, right-click the theme you want on the stream, open **Set as default … theme** and choose **Set for NDI Broadcast**. Do this for a song theme and a scripture theme.
3. Optionally, set a separate NDI transition in **Settings > Projection > Transitions**.

Dual output mode uses a little more graphics power while the stream is running.

## Performance options

Under **Settings > NDI > Rendering**:

- **Headless renderer** (on by default) captures frames straight from the graphics card, which is smoother and lighter on the processor. **Hide pictures and video** needs it on.
- **On-demand rendering (low CPU)** only sends a new frame when something changes, up to 30 frames per second. It's ideal for a slow laptop streaming mostly still lyrics.

## Troubleshooting

**There's no NDI button.** Crater didn't find the NDI runtime. Install NDI Tools and restart Crater. **Settings > NDI** shows the exact message.

**My streaming software doesn't list Crater.** Check the NDI button is on (cyan), both computers are on the same network, and your firewall allows NDI. Some networks separate wired and wireless devices. Try connecting both computers by cable.

**The stream is choppy.** Try **UYVY** or **720p**, or turn on **On-demand rendering**.

---

*NDI® is a registered trademark of Vizrt NDI AB.*
