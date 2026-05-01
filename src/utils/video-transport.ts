/**
 * Video transport protocol.
 *
 * Shared types + channel name for the BroadcastChannel between VideoStage
 * (in the projection window) and VideoTransport (in the controls window).
 *
 * The channel is unidirectional in two senses simultaneously:
 *   - State flows OUT of VideoStage and INTO VideoTransport.
 *   - Commands flow OUT of VideoTransport and INTO VideoStage.
 *
 * VideoStage is authoritative — its state is the source of truth. The
 * transport's UI mirrors that state and never mutates anything locally
 * without first emitting a command and waiting for the resulting state.
 *
 * Why same-origin BroadcastChannel works across BrowserWindows:
 * controls and projection both load from the same origin (`localhost:7241`
 * in dev, `file://` in prod), and Electron groups same-origin renderers in
 * a way that lets BroadcastChannel route messages between them. This is
 * the same mechanism the previous (now-removed) sync-video-playback channel
 * used between the panel-side video and the projection-side video.
 */

export const VIDEO_TRANSPORT_CHANNEL = "crater-video-transport";

export type VideoTransportCommand =
	| { kind: "command"; event: "play" }
	| { kind: "command"; event: "pause" }
	| { kind: "command"; event: "toggle" }
	| { kind: "command"; event: "restart" }
	| { kind: "command"; event: "skip-to-end" }
	| { kind: "command"; event: "seek"; time: number }
	| { kind: "command"; event: "volume"; volume: number }
	| { kind: "command"; event: "mute"; muted: boolean };

export type VideoTransportState =
	| {
			kind: "state";
			src: string;
			about?: string;
			currentTime: number;
			duration: number;
			paused: boolean;
			ended: boolean;
			volume: number;
			muted: boolean;
	  }
	// Sent when the projection-side stage unmounts (e.g. content type changed
	// away from video, or projection window closed). Lets the transport hide
	// itself or render a neutral state instead of stale numbers.
	| { kind: "offline" };
