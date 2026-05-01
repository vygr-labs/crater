/**
 * VideoThumbnail — a paused, silent, low-overhead preview of a video file.
 *
 * Used for visual feedback in panels and mini-displays. Never plays. Never
 * produces audio. Never instantiates video.js.
 *
 * **Lazy by default.** Each `<video>` element with `preload="metadata"` spins
 * up a native demuxer + decoder thread + GPU surface even though it never
 * plays. With ~10 of these visible at once (media library + panel rows +
 * mini-displays), low-end Windows hardware grinds. We solve that with an
 * IntersectionObserver: the element holds `preload="none"` and shows nothing
 * until it scrolls into view, then promotes to `preload="metadata"` to
 * fetch the first frame. When it scrolls out, we drop back so the decoder
 * is released. Worst-case decoder count == visible thumbnails, not total.
 *
 * Counterpart to VideoStage — the only component that actually plays video
 * (in the projection window).
 */

import { onCleanup, onMount, splitProps } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";

interface Props
	extends Omit<
		JSX.VideoHTMLAttributes<HTMLVideoElement>,
		"controls" | "autoplay" | "muted" | "preload"
	> {
	src: string;
}

export default function VideoThumbnail(_props: Props) {
	const [props, rest] = splitProps(_props, ["src"]);
	let videoEl: HTMLVideoElement | undefined;
	let observer: IntersectionObserver | undefined;

	const promote = () => {
		if (!videoEl || videoEl.preload === "metadata") return;
		videoEl.preload = "metadata";
		// Setting preload alone doesn't always trigger a fetch on Chromium —
		// load() forces the resource selection algorithm to run.
		videoEl.load();
	};

	const demote = () => {
		if (!videoEl || videoEl.preload === "none") return;
		videoEl.preload = "none";
		// Clear the buffer so the decoder/demuxer thread can be released.
		videoEl.removeAttribute("src");
		videoEl.load();
		// Re-attach src so promote() works next time without losing the path.
		videoEl.src = "video://" + props.src;
	};

	onMount(() => {
		if (!videoEl) return;
		// Belt-and-braces: even if a future caller passes through props that try
		// to enable playback or audio, we explicitly clamp them off here.
		videoEl.muted = true;
		videoEl.controls = false;
		videoEl.autoplay = false;

		observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) promote();
					else demote();
				}
			},
			{ rootMargin: "100px" }, // small prefetch margin so frames appear just before they scroll in
		);
		observer.observe(videoEl);
	});

	onCleanup(() => {
		if (observer) observer.disconnect();
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
			preload="none"
			muted
			playsinline
			disablePictureInPicture
			style={{
				width: "100%",
				height: "100%",
				"object-fit": "contain",
				background: "black",
			}}
			{...rest}
		/>
	);
}
