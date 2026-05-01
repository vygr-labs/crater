/**
 * NDI Settings Component
 *
 * Lets the user start/stop NDI streaming, name the source, set the output
 * frame rate, and observe live diagnostics (frames sent, errors, connected
 * receivers, full source name as it appears on the network).
 *
 * NDI in Crater is independent of Live: starting NDI here will spawn a
 * hidden projection window if Live is off so receivers always have a
 * frame to consume.
 */

import {
	createEffect,
	createSignal,
	onCleanup,
	onMount,
	Show,
} from "solid-js";
import { unwrap } from "solid-js/store";
import { Box, Divider, HStack, Stack, VStack } from "styled-system/jsx";
import { Button } from "../ui/button";
import { Text } from "../ui/text";
import { Input } from "../ui/input";
import { GenericField } from "../ui/field";
import {
	TbBroadcast,
	TbBroadcastOff,
	TbAlertTriangle,
	TbDeviceTv,
	TbActivity,
} from "solid-icons/tb";
import { defaultPalette } from "~/utils/constants";
import { css } from "styled-system/css";
import { useAppContext } from "~/layouts/AppContext";

interface NDIStatus {
	isStreaming: boolean;
	name: string;
	frameRate: number;
	resolution: { width: number; height: number };
	framesSent: number;
	errors: number;
	error?: string;
	sourceName?: string | null;
	connections?: number;
}

const FRAME_RATE_OPTIONS = [24, 25, 30, 50, 60];

export function NDISettings() {
	const { settings } = useAppContext();
	const [status, setStatus] = createSignal<NDIStatus | null>(null);
	const [supported, setSupported] = createSignal<boolean | null>(null);
	const [version, setVersion] = createSignal<string>("…");
	const [name, setName] = createSignal("Crater Bible Projection");
	const [frameRate, setFrameRate] = createSignal(30);
	const [busy, setBusy] = createSignal(false);

	let pollHandle: ReturnType<typeof setInterval> | null = null;

	const refreshStatus = async () => {
		try {
			const s = await window.electronAPI.ndiGetStatus();
			setStatus(s);
			// Only sync the editable fields from main on first load — otherwise
			// the user's in-progress edits would get clobbered every poll.
			if (status() === null) {
				setName(s.name);
				setFrameRate(s.frameRate);
			}
		} catch (err) {
			console.error("NDI status fetch failed:", err);
		}
	};

	onMount(async () => {
		const s = await window.electronAPI.ndiIsSupported();
		setSupported(s);
		try {
			const v = await window.electronAPI.ndiGetVersion();
			setVersion(typeof v === "string" ? v : "Unknown");
		} catch {
			setVersion("Unknown");
		}
		await refreshStatus();
		// Poll while the panel is open so frames-sent / connections feel live.
		pollHandle = setInterval(refreshStatus, 1000);
	});

	onCleanup(() => {
		if (pollHandle) clearInterval(pollHandle);
	});

	const isStreaming = () => status()?.isStreaming ?? false;

	async function applyConfigChange() {
		const current = status();
		if (!current) return;
		// Only push to backend if there's something to change AND we're streaming
		// (when stopped, the next start() will pick up the new config).
		if (!current.isStreaming) return;
		if (current.name === name() && current.frameRate === frameRate()) return;
		setBusy(true);
		try {
			await window.electronAPI.ndiUpdateConfig({
				name: name(),
				frameRate: frameRate(),
			});
			await refreshStatus();
		} finally {
			setBusy(false);
		}
	}

	async function handleStart() {
		setBusy(true);
		try {
			await window.electronAPI.ndiStart({
				name: name(),
				frameRate: frameRate(),
				projectionBounds: {
					...unwrap(settings.projectionBounds),
					useCustomBounds: settings.useCustomProjectionBounds,
				},
			} as any);
			await refreshStatus();
		} finally {
			setBusy(false);
		}
	}

	async function handleStop() {
		setBusy(true);
		try {
			await window.electronAPI.ndiStop();
			await refreshStatus();
		} finally {
			setBusy(false);
		}
	}

	// Whenever the user commits a new name/frame-rate while streaming, apply it.
	createEffect(() => {
		// Touch the signals so the effect re-runs.
		name();
		frameRate();
		// Debounce so each keystroke doesn't restart the sender.
		const timer = setTimeout(applyConfigChange, 600);
		onCleanup(() => clearTimeout(timer));
	});

	return (
		<Stack gap={6}>
			<Show when={supported() === false}>
				<Box
					bg="orange.900/40"
					borderColor="orange.700"
					borderWidth="1px"
					rounded="lg"
					p={4}
				>
					<HStack gap={3} alignItems="flex-start">
						<Box color="orange.400" pt={0.5}>
							<TbAlertTriangle size={20} />
						</Box>
						<VStack alignItems="flex-start" gap={1} flex={1}>
							<Text fontSize="sm" fontWeight="semibold" color="orange.200">
								NDI is not available
							</Text>
							<Text fontSize="xs" color="orange.300/80">
								The NDI runtime could not be initialised. Reinstall Crater or
								confirm your CPU supports SSE4 (required by the NDI SDK).
							</Text>
						</VStack>
					</HStack>
				</Box>
			</Show>

			<Show when={supported() !== false}>
				{/* Status card */}
				<Box bg="gray.900/50" rounded="xl" p={4}>
					<HStack gap={4} alignItems="center" justify="space-between">
						<HStack gap={3}>
							<Box
								p={2.5}
								rounded="lg"
								bg={isStreaming() ? "blue.900/60" : "gray.800/80"}
								color={isStreaming() ? "blue.300" : "gray.400"}
							>
								<Show
									when={isStreaming()}
									fallback={<TbBroadcastOff size={22} />}
								>
									<TbBroadcast size={22} />
								</Show>
							</Box>
							<VStack alignItems="flex-start" gap={0}>
								<Text fontSize="sm" fontWeight="semibold" color="gray.100">
									{isStreaming() ? "Streaming" : "Offline"}
								</Text>
								<Text fontSize="xs" color="gray.500">
									NDI runtime {version()}
								</Text>
							</VStack>
						</HStack>

						<Show
							when={isStreaming()}
							fallback={
								<Button
									colorPalette={defaultPalette}
									onClick={handleStart}
									disabled={busy() || supported() === false}
								>
									<TbBroadcast size={18} />
									<Text>Start NDI</Text>
								</Button>
							}
						>
							<Button
								variant="outline"
								colorPalette="red"
								onClick={handleStop}
								disabled={busy()}
							>
								<TbBroadcastOff size={18} />
								<Text>Stop NDI</Text>
							</Button>
						</Show>
					</HStack>

					<Show when={status()?.error}>
						<Box mt={3} px={3} py={2} bg="red.900/40" rounded="md">
							<Text fontSize="xs" color="red.300">
								{status()?.error}
							</Text>
						</Box>
					</Show>
				</Box>

				{/* Configuration */}
				<Box bg="gray.900/50" rounded="xl" p={4}>
					<HStack gap={3} mb={4}>
						<Box
							p={2}
							bg={`${defaultPalette}.900/50`}
							rounded="lg"
							color={`${defaultPalette}.400`}
						>
							<TbDeviceTv size={18} />
						</Box>
						<Text fontSize="sm" fontWeight="semibold" color="gray.100">
							Source Configuration
						</Text>
					</HStack>

					<Stack gap={4}>
						<GenericField label="Source name">
							<Input
								value={name()}
								onInput={(e) => setName(e.currentTarget.value)}
								placeholder="Crater Bible Projection"
							/>
							<Text fontSize="xs" color="gray.500" mt={1}>
								This is what appears in OBS, vMix, etc. as
								<Box
									as="span"
									ml={1}
									class={css({
										fontFamily: "mono",
										color: "gray.400",
									})}
								>
									{`<computer>`} ({name() || "—"})
								</Box>
							</Text>
						</GenericField>

						<GenericField label="Output frame rate">
							<HStack gap={2} flexWrap="wrap">
								{FRAME_RATE_OPTIONS.map((rate) => (
									<Button
										size="sm"
										variant={frameRate() === rate ? "solid" : "outline"}
										colorPalette={
											frameRate() === rate ? defaultPalette : "gray"
										}
										onClick={() => setFrameRate(rate)}
									>
										{rate} fps
									</Button>
								))}
							</HStack>
							<Text fontSize="xs" color="gray.500" mt={1}>
								Higher rates are smoother but use more CPU. 30 fps is
								recommended for projection content.
							</Text>
						</GenericField>
					</Stack>
				</Box>

				{/* Live diagnostics */}
				<Show when={status()}>
					{(s) => (
						<Box bg="gray.900/50" rounded="xl" p={4}>
							<HStack gap={3} mb={4}>
								<Box
									p={2}
									bg={`${defaultPalette}.900/50`}
									rounded="lg"
									color={`${defaultPalette}.400`}
								>
									<TbActivity size={18} />
								</Box>
								<Text fontSize="sm" fontWeight="semibold" color="gray.100">
									Live Diagnostics
								</Text>
							</HStack>

							<Stack gap={3}>
								<HStack justify="space-between">
									<Text fontSize="xs" color="gray.500">
										Network source name
									</Text>
									<Text
										fontSize="xs"
										color="gray.300"
										class={css({ fontFamily: "mono" })}
									>
										{s().sourceName || "—"}
									</Text>
								</HStack>
								<Divider />
								<HStack justify="space-between">
									<Text fontSize="xs" color="gray.500">
										Connected receivers
									</Text>
									<Text fontSize="xs" color="gray.300">
										{s().connections ?? 0}
									</Text>
								</HStack>
								<Divider />
								<HStack justify="space-between">
									<Text fontSize="xs" color="gray.500">
										Frames sent
									</Text>
									<Text fontSize="xs" color="gray.300">
										{s().framesSent.toLocaleString()}
									</Text>
								</HStack>
								<Divider />
								<HStack justify="space-between">
									<Text fontSize="xs" color="gray.500">
										Errors
									</Text>
									<Text
										fontSize="xs"
										color={s().errors > 0 ? "red.300" : "gray.300"}
									>
										{s().errors}
									</Text>
								</HStack>
								<Divider />
								<HStack justify="space-between">
									<Text fontSize="xs" color="gray.500">
										Resolution
									</Text>
									<Text fontSize="xs" color="gray.300">
										{s().resolution.width}×{s().resolution.height}
									</Text>
								</HStack>
							</Stack>
						</Box>
					)}
				</Show>
			</Show>
		</Stack>
	);
}
