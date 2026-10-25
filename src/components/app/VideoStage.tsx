/**
 * VideoStage — the authoritative video player.
 *
 * Mounted only in the projection window. This is the only component in the
 * app that actually plays video (audio + advancing timeline). Everywhere
 * else uses VideoThumbnail, which is a paused first-frame.
 *
 * The stage is bidirectional with the controls window via a BroadcastChannel:
 *
 *   stage  →  transport :  state events (currentTime, duration, paused, ...)
 *   stage  ←  transport :  command events (play, pause, seek, mute, ...)
 *
 * Operators control playback from the controls window's transport bar; the
 * stage just executes commands and reports back. There is no panel-side
 * playback to keep in sync anymore — the only player IS the projection.
 */

import { createEffect, onCleanup, onMount } from "solid-js";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import type Player from "video.js/dist/types/player";
import { logger } from "~/utils";
import {
	VIDEO_TRANSPORT_CHANNEL,
	type VideoTransportCommand,
	type VideoTransportState,
} from "~/utils/video-transport";

interface Props {
	src: string;
	about?: string;
	autoplay?: boolean;
	loop?: boolean;
	/** Seek to this time on mount (seconds). Useful for resume-on-remount. */
	initialTime?: number;
	onEnded?: () => void;
}

let elementCounter = 0;

export default function VideoStage(props: Props) {
	let videoEl: HTMLVideoElement | undefined;
	let player: Player | undefined;
	let channel: BroadcastChannel | undefined;
	let stateInterval: ReturnType<typeof setInterval> | undefined;
	const elementId = `video-stage-${++elementCounter}`;

	const emitState = () => {
		if (!player || !channel) return;
		try {
			const state: VideoTransportState = {
				kind: "state",
				src: props.src,
				about: props.about,
				currentTime: Number(player.currentTime() ?? 0),
				duration: Number(player.duration() ?? 0),
				paused: Boolean(player.paused() ?? true),
				ended: Boolean(player.ended() ?? false),
				volume: Number(player.volume() ?? 1),
				muted: Boolean(player.muted() ?? false),
			};
			channel.postMessage(state);
		} catch (err) {
			logger.warn(["VideoStage emitState failed", err]);
		}
	};

	const emitOffline = () => {
		if (!channel) return;
		channel.postMessage({ kind: "offline" } satisfies VideoTransportState);
	};

	const handleCommand = (data: VideoTransportCommand) => {
		if (!player) return;
		switch (data.event) {
			case "play":
				player.play();
				break;
			case "pause":
				player.pause();
				break;
			case "toggle":
				if (player.paused()) player.play();
				else player.pause();
				break;
			case "restart":
				player.currentTime(0);
				player.play();
				break;
			case "skip-to-end": {
				const dur = player.duration();
				if (dur && Number.isFinite(dur)) {
					player.currentTime(dur);
				}
				break;
			}
			case "seek":
				player.currentTime(Math.max(0, data.time));
				break;
			case "volume":
				player.volume(Math.min(1, Math.max(0, data.volume)));
				break;
			case "mute":
				player.muted(data.muted);
				break;
		}
	};

	onMount(() => {
		if (!videoEl) return;

		player = videojs(videoEl, {
			controls: false,
			fluid: true,
			aspectRatio: "16:9",
			autoplay: props.autoplay !== false,
			loop: props.loop === true,
			muted: false,
			preload: "auto",
		});

		channel = new BroadcastChannel(VIDEO_TRANSPORT_CHANNEL);
		channel.onmessage = (msg) => {
			const data = msg.data;
			if (!data || typeof data !== "object" || data.kind !== "command") return;
			handleCommand(data as VideoTransportCommand);
		};

		player.ready(() => {
			if (!player) return;
			if (props.initialTime && props.initialTime > 0) {
				player.currentTime(props.initialTime);
			}
			if (props.autoplay !== false) {
				player.play();
			}
			emitState();
		});

		// Emit on every player state change so the transport's UI updates
		// immediately without polling. The 250ms tick below covers smooth
		// scrubber motion during continuous playback.
		const stateEvents = [
			"play",
			"pause",
			"seeked",
			"volumechange",
			"loadedmetadata",
			"durationchange",
		];
		stateEvents.forEach((evt) => player!.on(evt, emitState));
		player.on("ended", () => {
			emitState();
			props.onEnded?.();
		});

		stateInterval = setInterval(() => {
			if (player && !player.paused() && !player.ended()) emitState();
		}, 250);
	});

	// Re-emit state when src changes mid-mount (rare, but RenderProjection
	// could swap to a new video without unmounting in some edge cases).
	createEffect(() => {
		props.src;
		// Hint: handled by player loadedmetadata via the source attribute below.
	});

	onCleanup(() => {
		emitOffline();
		if (stateInterval) clearInterval(stateInterval);
		if (channel) channel.close();
		if (player && !player.isDisposed()) {
			try {
				player.dispose();
			} catch (err) {
				logger.warn(["VideoStage dispose failed", err]);
			}
		}
	});

	return (
		<div data-vjs-player>
			<video
				ref={(el) => (videoEl = el)}
				id={elementId}
				class="video-js vjs-crater"
				src={"video://" + props.src}
				about={props.about}
				preload="auto"
			/>
		</div>
	);
}
