/**
 * VideoTransport — playback controls for the operator.
 *
 * Lives in the controls window. Receives state from VideoStage (in the
 * projection window) and posts commands back. Spacebar toggles play/pause
 * while mounted; the keybinding is owned here rather than in MenuBar so
 * it only intercepts keys when the transport is actually visible (i.e.
 * a video is the live item).
 */

import {
	createSignal,
	onCleanup,
	onMount,
	Show,
} from "solid-js";
import { Box, HStack } from "styled-system/jsx";
import { Text } from "../ui/text";
import {
	TbPlayerPlay,
	TbPlayerPause,
	TbPlayerTrackPrev,
	TbPlayerTrackNext,
	TbVolume,
	TbVolumeOff,
} from "solid-icons/tb";
import {
	VIDEO_TRANSPORT_CHANNEL,
	type VideoTransportCommand,
	type VideoTransportState,
} from "~/utils/video-transport";
import { css } from "styled-system/css";

function formatTime(seconds: number): string {
	if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
	const total = Math.floor(seconds);
	const m = Math.floor(total / 60);
	const s = total % 60;
	return `${m}:${s.toString().padStart(2, "0")}`;
}

interface PlayingState {
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

export default function VideoTransport() {
	const [state, setState] = createSignal<PlayingState | null>(null);
	const [scrubbing, setScrubbing] = createSignal(false);
	const [scrubValue, setScrubValue] = createSignal(0);
	let channel: BroadcastChannel | undefined;

	const send = (command: Omit<VideoTransportCommand, "kind">) => {
		if (!channel) return;
		channel.postMessage({ kind: "command", ...command } as VideoTransportCommand);
	};

	const onKeyDown = (e: KeyboardEvent) => {
		// Don't hijack space when a text input is focused — the operator might
		// be naming a schedule, editing lyrics, etc. Stage commands only fire
		// when the controls window has no editable element in focus.
		const target = e.target as HTMLElement | null;
		if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;
		if (target && target.isContentEditable) return;

		if (e.code === "Space") {
			e.preventDefault();
			send({ event: "toggle" });
		} else if (e.code === "ArrowLeft" && e.shiftKey) {
			const s = state();
			if (s) send({ event: "seek", time: Math.max(0, s.currentTime - 5) });
		} else if (e.code === "ArrowRight" && e.shiftKey) {
			const s = state();
			if (s) send({ event: "seek", time: Math.min(s.duration, s.currentTime + 5) });
		}
	};

	onMount(() => {
		channel = new BroadcastChannel(VIDEO_TRANSPORT_CHANNEL);
		channel.onmessage = (msg) => {
			const data = msg.data as VideoTransportState | undefined;
			if (!data) return;
			if (data.kind === "offline") {
				setState(null);
				return;
			}
			if (data.kind !== "state") return;
			// Suppress upstream updates while the user is dragging the scrubber
			// — otherwise the slider thumb yanks back to the current playback
			// position on every state tick.
			if (scrubbing()) return;
			setState(data);
		};
		window.addEventListener("keydown", onKeyDown);
	});

	onCleanup(() => {
		window.removeEventListener("keydown", onKeyDown);
		if (channel) channel.close();
	});

	const displayedTime = () => {
		const s = state();
		if (!s) return 0;
		return scrubbing() ? scrubValue() : s.currentTime;
	};

	return (
		<Show when={state()}>
			{(s) => (
				<HStack
					gap={3}
					px={3}
					py={2}
					bg="gray.900"
					borderRadius="md"
					border="1px solid"
					borderColor="gray.800"
					alignItems="center"
				>
					<Box
						as="button"
						type="button"
						cursor="pointer"
						color="gray.200"
						_hover={{ color: "white" }}
						title="Restart"
						onClick={() => send({ event: "restart" })}
					>
						<TbPlayerTrackPrev size={16} />
					</Box>

					<Box
						as="button"
						type="button"
						cursor="pointer"
						color="gray.100"
						p={1}
						borderRadius="sm"
						_hover={{ bg: "gray.800" }}
						title={s().paused ? "Play (Space)" : "Pause (Space)"}
						onClick={() => send({ event: "toggle" })}
					>
						<Show
							when={s().paused}
							fallback={<TbPlayerPause size={20} />}
						>
							<TbPlayerPlay size={20} />
						</Show>
					</Box>

					<Box
						as="button"
						type="button"
						cursor="pointer"
						color="gray.200"
						_hover={{ color: "white" }}
						title="Skip to end"
						onClick={() => send({ event: "skip-to-end" })}
					>
						<TbPlayerTrackNext size={16} />
					</Box>

					<Text
						fontSize="xs"
						color="gray.400"
						minW="3rem"
						textAlign="right"
						class={css({ fontFamily: "mono" })}
					>
						{formatTime(displayedTime())}
					</Text>

					<Box flex={1}>
						<input
							type="range"
							min={0}
							max={s().duration || 0}
							step={0.1}
							value={displayedTime()}
							class={css({
								w: "full",
								h: 1,
								appearance: "none",
								bg: "gray.700",
								borderRadius: "full",
								cursor: "pointer",
								"&::-webkit-slider-thumb": {
									appearance: "none",
									w: 3,
									h: 3,
									bg: "blue.400",
									borderRadius: "full",
								},
							})}
							onPointerDown={() => {
								setScrubValue(s().currentTime);
								setScrubbing(true);
							}}
							onPointerUp={() => {
								send({ event: "seek", time: scrubValue() });
								// Small delay before resuming state updates so we
								// don't briefly flash the pre-seek time.
								setTimeout(() => setScrubbing(false), 50);
							}}
							onInput={(e) => {
								setScrubValue(parseFloat(e.currentTarget.value));
							}}
						/>
					</Box>

					<Text
						fontSize="xs"
						color="gray.400"
						minW="3rem"
						class={css({ fontFamily: "mono" })}
					>
						{formatTime(s().duration)}
					</Text>

					<Box
						as="button"
						type="button"
						cursor="pointer"
						color={s().muted ? "red.300" : "gray.200"}
						_hover={{ color: "white" }}
						title={s().muted ? "Unmute" : "Mute"}
						onClick={() => send({ event: "mute", muted: !s().muted })}
					>
						<Show when={s().muted} fallback={<TbVolume size={16} />}>
							<TbVolumeOff size={16} />
						</Show>
					</Box>
				</HStack>
			)}
		</Show>
	);
}
