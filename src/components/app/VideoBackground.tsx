/**
 * VideoBackground — silent looping autoplay video for decorative use.
 *
 * Used as a theme's background-image equivalent: a video that loops
 * quietly behind song lyrics, scripture, etc. It's NOT the authoritative
 * projection player — that's VideoStage, which only mounts when the
 * foreground content type is `video`. The two never coexist because
 * RenderProjection's Switch is mutually exclusive across content types.
 *
 * Design intent: just enough video for visual ambience. No audio, no
 * transport state, no video.js. Plays only when explicitly told to via
 * the `autoplay` prop (so the editor's canvas can preview without the
 * mini-display silently spinning up decoders).
 */

import { createEffect, onCleanup, onMount, splitProps } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";

interface Props
	extends Omit<
		JSX.VideoHTMLAttributes<HTMLVideoElement>,
		"controls" | "muted" | "loop" | "autoplay"
	> {
	src: string;
	/** Whether the video should be playing. False renders frame 0 paused. */
	autoplay?: boolean;
	loop?: boolean;
}

export default function VideoBackground(_props: Props) {
	const [props, rest] = splitProps(_props, ["src", "autoplay", "loop"]);
	let videoEl: HTMLVideoElement | undefined;

	onMount(() => {
		if (!videoEl) return;
		// Always silent — backgrounds don't get audio. The projection's audio
		// belongs to the foreground content (VideoStage) when applicable.
		videoEl.muted = true;
		videoEl.controls = false;
	});

	// React to autoplay toggling (e.g. theme being moved between editor-canvas
	// preview and live projection — the editor turns autoplay off).
	createEffect(() => {
		if (!videoEl) return;
		if (props.autoplay) {
			videoEl.play().catch(() => {
				// Browsers can reject auto-play under some autoplay policies.
				// Backgrounds aren't critical, so we swallow the rejection.
			});
		} else {
			videoEl.pause();
		}
	});

	onCleanup(() => {
		if (videoEl) {
			videoEl.pause();
			videoEl.removeAttribute("src");
			videoEl.load();
		}
	});

	return (
		<video
			ref={(el) => (videoEl = el)}
			src={"video://" + props.src}
			muted
			loop={props.loop ?? true}
			autoplay={props.autoplay ?? false}
			playsinline
			disablePictureInPicture
			preload="auto"
			style={{
				width: "100%",
				height: "100%",
				"object-fit": "cover",
				background: "black",
			}}
			{...rest}
		/>
	);
}
