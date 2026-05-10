# Video Playback Flow — Audit

> Captured 2026-05-01 during the post-NDI cleanup pass.
> Local working notes — not for the repo (this folder is gitignored).

## Top-level findings

- **`Video.tsx` is doing six jobs at once.** The same component is mounted in: media browser thumbnails, preview panel rows, live panel rows, the mini-display at the bottom of preview/live, and the projection window. Each context wants different behaviour (controls vs no controls, muted vs audible, autoplay vs paused, low-fidelity thumbnail vs real playback). Today it's one component with sprawling conditional defaults and no per-context strategy — that's the root cause of most of the inconsistencies operators feel.
- **Sync via `BroadcastChannel("sync-video-playback")` is fragile by design.** It works only between same-origin frames in the same Electron session, uses fixed string IDs (`PANEL-LIVE-190293827` / `WINDOW-LIVE-190293827`) for "the panel video" and "the projection video", and a `setTimeout(100)` to break sync loops. Any drift between those clocks (paint stalls, audio device buffer latency, the Live promotion in the NDI work) silently desyncs the panel preview from what's actually on stage.
- **Existing TODO is honest about it.** Line 56 of `TODO`: *"ensure that the live & preview displays don't play videos, but rather show only the thumbnail/first-frame"*. That's the most-loaded bug in the flow and it's been left open.

---

## A. Inconsistencies (architectural / behavioural mismatches)

### A1. Mini-display mounts a full video.js player just to show a thumbnail
`MiniDisplay.tsx:245` instantiates `<Video>` with `preload="metadata"` for the video case. That spins up an entire video.js instance (control bar plugins, plugin registry, event wiring) just to fetch a poster frame. Two of these run simultaneously when both the preview and live panels are open with video items — even though neither is the actual stage. Heavy, and a frequent source of console noise / disposal warnings.

**Fix shape:** replace with a plain `<video>` element with `preload="metadata"`, no controls, paused at frame 0. Or generate an actual thumbnail PNG once at media-import time and cache it. The latter is the EasyWorship/ProPresenter approach and removes runtime cost entirely.

### A2. The live panel ROW is a video player too
`VideoDisplay.tsx` (the row inside the live/preview panels) renders a full `<Video>` with `controls={true}` for non-live panels and `synchronize={[WINDOW_VIDEO_ID]}`. So when you have a video in preview, **the preview row plays its own copy with audio controls**, AND the projection window plays another copy, AND they try to sync via BroadcastChannel. That's three players for one video.

The TODO line acknowledges this. The right model: the panel ROW shows a static frame + transport buttons; only the projection window has real playback.

### A3. `muted` default flip-flops between contexts
- `Video.tsx:161` defaults to **`muted={true}`** if not specified.
- `RenderVideo.tsx:25` (the projection — the *only* place sound should come from) explicitly sets **`muted={false}`**.
- `VideoDisplay.tsx:30` (the preview row that shouldn't have sound) leaves it **unset → defaults to `true`**.
- `MiniDisplay.tsx:250` (the tiny stage preview) explicitly **`muted`**.

This *happens* to work today, but inverting the default — defaulting to `muted={false}` and explicitly muting the previews — would match the user's mental model: "the projection is the loud one." It also makes accidental misuse safer: a stray `<Video>` in a new component will be silent until you opt in.

### A4. Both panels assume `liveData()` is an array of slides; for video it's always `[oneItem]`
In `LivePanel.tsx:65–79`, ArrowDown / ArrowUp navigate within `liveData()`. For songs and scriptures that's a list of slides. For video, `MediaSelection.tsx:220` sets `data: [metadata]` — a single-element array. So:
- Pressing ↓/↑ on a live video does nothing visible but increments/decrements `fluidFocusId`, which fires `displayLiveItem` → `setAppStore("displayData", ...)` with the same item every time.
- The "1/1" item appears as a list with one entry, and the row renders a video player you can't navigate past — but it *looks* like a list.

This is a category bug: **media items should not flow through the same "indexed slides" abstraction as songs/scriptures.** They have one frame of content and a continuous timeline.

### A5. Going Live re-creates the projection's video element from scratch
`RenderProjection.tsx` uses a `<Switch>` over `displayContent.type`. When you switch from a video to a scripture and back to the same video, the `<Match when="video">` branch unmounts and remounts `RenderVideo`, which means a brand-new `<video>` element, brand-new video.js player, brand-new HTTP range request to `video://`, brand-new fetch through your custom protocol handler. The video starts from `00:00`, every time.

Operators expect "go back to that video" to resume where it was, not restart. At minimum, current playback time should be preserved across re-mounts of the same source.

### A6. `video://` custom protocol leaks debug logs to stdout
`protocols.ts:147,152,154` have `console.log(request)`, `console.log("\n----", url, ...)`, and `console.log(pathname, ...)` running on every byte-range fetch. With a single 4-minute video at 30fps with seeks, that's hundreds of log lines per playback. They'll quietly inflate the production log file shipped via `electron-log` and make real errors hard to spot. Also each `console.log` blocks the event loop while it serializes the Request — small but free perf to recover.

### A7. `Video.tsx:46–48` autoplays unconditionally
```ts
player.ready(() => {
  player.play();
});
```

Every place `<Video>` mounts plays. There's no way to instantiate a paused video. So the mini-display poster, the row preview, the live row, and the projection all start playing on mount. The only thing keeping the panels from generating audio is the muted default in A3 — remove that and the room hears two simultaneous videos.

The autoplay should be a prop (`autoplay={true}` only on `RenderVideo`), not a baked-in behaviour.

### A8. No transport controls anywhere visible to the operator
There's nowhere to pause the projection video, scrub, restart, or skip to end. The preview row in `VideoDisplay.tsx` has `controls` enabled, but those control the **preview's player**, which is then synchronised to the projection via BroadcastChannel — a fragile indirection. The operator should be able to pause/scrub the *projection* directly, ideally from the live panel header.

### A9. `onEnded` sync logic is inverted
`Video.tsx:73-81` posts an `ended` message when the panel video ends → projection video pauses and seeks to `duration()`. This means **the projection ends when the preview ends**. If the preview was muted at low quality and ended a few hundred ms before the live (unlikely but possible if frame rates differ), the live would cut off early. Conversely, if the projection is the ground truth (which it should be — that's what the audience sees), the propagation should go projection → panels, not the other way around.

### A10. `MediaSelection.tsx` lumps images and videos under one `mediaControls.group`
A user filtering "videos" then switching to "images" rebuilds the entire virtual list, the focus state resets, and any in-flight thumbnail loads abandon. This isn't strictly a video bug, but it's where most operators *find* a video, and it's annoying enough to mention.

---

## B. UX annoyances (what actually trips operators)

### B1. Workflow to project a video is too many double-clicks
Today: media browser → double-click → arrives in **preview** with autoplaying-but-muted video → double-click in preview → moves to **live**, *restarts from frame 0* with audio. Three clicks, surprise audio, restart. Compare to ProPresenter: single click "Go Live" pushes directly without the preview-and-restart dance.

Add a "send to live" action (Enter when video is focused in media tab, or a button) that skips the preview hop.

### B2. No "what happens when video ends" choice
Once the video finishes, the projection just sits on the last frame. There's no:
- "Hold last frame"
- "Loop"
- "Auto-advance to next schedule item"
- "Fade to logo / black"

`RenderVideo.tsx` has commented-out `loop` and `autoplay` props at lines 23–24, suggesting someone half-thought about this. A simple per-video schedule-item setting "On end → [hold | loop | next item | logo]" would close the most common operator complaint with church A/V.

### B3. No visible playback feedback in the operator UI
- No progress bar in the preview row.
- No remaining-time indicator.
- No "currently at 1:23 of 4:00" anywhere.
- The `MiniDisplay` shows the video but nothing else.

The operator running the service needs to know "is this video about to end so I should ready the next slide?" Right now they have to guess from the audience reaction or from the muted preview row.

### B4. Volume control is buried
`Video.tsx` syncs volume across BroadcastChannel — meaning if you adjust the preview's volume slider, the live's volume changes too. There's no master volume in the controls window or settings. If the church's audio is too loud mid-service, the operator's only path is: open the preview row's video controls → unmute → hover over volume → drag → realize it's tiny.

### B5. "Clear Display" doesn't pause the video
When you click Clear (`appStore.hideLive`), the projection just hides via CSS (`.clear-display` class on `RenderProjection.tsx:62`). The video keeps playing — its audio keeps coming through, its position advances, and when you uncleared, the video has progressed in time. Ushers turn off the projector's mute and hear half a video.

### B6. Logo overlay doesn't pause the video either
Same root cause as B5. `appStore.showLogo` toggles opacity/visibility on the content box but the video plays on. Memory + CPU + audio leak.

### B7. Going Live with NDI already streaming + a video in preview doesn't transfer the video correctly
You just decoupled NDI from Live. But if the operator had a video in preview while NDI was already running (showing scripture, say), then went Live and double-clicked the video → the Live panel renders the new video, RenderProjection unmounts the scripture and mounts RenderVideo, and NDI's frame-subscription continues from the projection window's compositor — but for ~1–2 frames during the swap, NDI viewers see a flash. Not catastrophic, but noticeable.

### B8. No keyboard shortcut for play/pause
Most projection software has spacebar = pause/play live video. Crater has no such shortcut. The focus system in `MenuBar.tsx` registers shortcuts for save/etc. but nothing for media transport.

---

## C. Recommended order of attack

1. **Split `Video.tsx` into two components**: `<VideoThumbnail>` (paused, no audio, plain `<video>` tag, optionally seek-to-frame) and `<VideoStage>` (full video.js, autoplay, audio, controls). Use `VideoThumbnail` everywhere except `RenderVideo`. Solves A1, A2, A3, A7 in one pass.
2. **Make the projection the source of truth.** Move BroadcastChannel sync emission to `VideoStage` only; receivers (panel thumbnails, mini-displays) are just consumers. Solves A9 and reduces the surface of B7.
3. **Pause the underlying `<video>` element when `hideLive` or `showLogo` is true.** One-line fix in `RenderVideo.tsx`, but it's the single biggest operator-experience win on the list. Fixes B5, B6.
4. **Add transport controls to the live panel header**: play/pause toggle, scrubber, remaining time. Bind spacebar. Fixes B3, B8.
5. **Per-item "On end" setting** in the schedule. Default: hold last frame. Options: loop, next, blank, logo. Fixes B2.
6. **Persist playback time across re-mount** by storing `currentTime` in `appStore.displayData` keyed by video path; `RenderVideo` seeks to it on mount. Fixes A5.
7. **Strip the debug `console.log`s** from `protocols.ts`. 30-second fix, real perf and log-noise win. Fixes A6.

---

## Status

- [x] **#1 — Video split** (in progress as of this commit pass)
- [ ] #2 — Projection as source of truth (will fall out of #1)
- [ ] #3 — Pause on clear/logo
- [ ] #4 — Transport controls + spacebar
- [ ] #5 — Per-item "On end" setting
- [ ] #6 — Persist playback time
- [ ] #7 — Strip protocol logs
