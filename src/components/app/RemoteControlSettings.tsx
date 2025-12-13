/**
 * Remote Control Settings Component
 * 
 * UI for starting/stopping the remote control server and displaying connection info
 */

import { createEffect, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { Box, HStack, VStack, Stack } from "styled-system/jsx";
import { Button } from "../ui/button";
import { Text } from "../ui/text";
import { Input } from "../ui/input";
import { GenericField } from "../ui/field";
import {
	TbWifi,
	TbWifiOff,
	TbQrcode,
	TbCopy,
	TbCheck,
	TbUsers,
	TbRefresh,
} from "solid-icons/tb";
import { defaultPalette } from "~/utils/constants";
import { css } from "styled-system/css";

interface ClientInfo {
	id: string;
	ip: string;
	userAgent: string;
	connectedAt: number;
}

interface ServerStatus {
	running: boolean;
	port: number;
	addresses: string[];
	clients: ClientInfo[];
}

export function RemoteControlSettings() {
	const [status, setStatus] = createSignal<ServerStatus>({
		running: false,
		port: 3456,
		addresses: [],
		clients: [],
	});
	const [isLoading, setIsLoading] = createSignal(false);
	const [port, setPort] = createSignal(3456);
	const [copied, setCopied] = createSignal(false);
	const [error, setError] = createSignal<string | null>(null);

	// Fetch initial status
	const refreshStatus = async () => {
		try {
			const result = await window.electronAPI.remoteServerStatus();
			setStatus(result);
			if (result.port) {
				setPort(result.port);
			}
		} catch (err) {
			console.error("Failed to get server status:", err);
		}
	};

	onMount(() => {
		refreshStatus();

		// Listen for server events
		window.electronAPI.onRemoteServerStarted((data) => {
			setStatus((prev) => ({
				...prev,
				running: true,
				port: data.port,
				addresses: data.addresses,
			}));
			setIsLoading(false);
			setError(null);
		});

		window.electronAPI.onRemoteServerStopped(() => {
			setStatus((prev) => ({
				...prev,
				running: false,
				addresses: [],
				clients: [],
			}));
			setIsLoading(false);
		});

		window.electronAPI.onRemoteServerError((data) => {
			setError(data.error);
			setIsLoading(false);
		});

		window.electronAPI.onRemoteClientConnected((data) => {
			setStatus((prev) => ({
				...prev,
				clients: [...prev.clients, data.clientInfo as ClientInfo],
			}));
		});

		window.electronAPI.onRemoteClientDisconnected((data) => {
			setStatus((prev) => ({
				...prev,
				clients: prev.clients.filter((c) => c.id !== data.clientId),
			}));
		});
	});

	const handleStart = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const result = await window.electronAPI.remoteServerStart(port());
			if (!result.success) {
				setError(result.error || "Failed to start server");
				setIsLoading(false);
			}
		} catch (err) {
			setError((err as Error).message);
			setIsLoading(false);
		}
	};

	const handleStop = async () => {
		setIsLoading(true);
		try {
			await window.electronAPI.remoteServerStop();
		} catch (err) {
			setError((err as Error).message);
			setIsLoading(false);
		}
	};

	const copyUrl = (url: string) => {
		navigator.clipboard.writeText(url);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const getConnectionUrl = (address: string) => {
		return `http://${address}:${status().port}`;
	};

	return (
		<Stack gap={6}>
			{/* Server Status Card */}
			<Box bg="gray.900/50" rounded="xl" p={4}>
				<HStack justify="space-between" mb={4}>
					<HStack gap={3}>
						<Box
							p={2}
							bg={status().running ? "green.900/50" : "gray.800"}
							rounded="lg"
							color={status().running ? "green.400" : "gray.500"}
						>
							{status().running ? <TbWifi size={20} /> : <TbWifiOff size={20} />}
						</Box>
						<VStack alignItems="flex-start" gap={0}>
							<Text fontWeight="semibold" fontSize="md" color="gray.100">
								Remote Control Server
							</Text>
							<Text fontSize="xs" color={status().running ? "green.400" : "gray.500"}>
								{status().running ? "Running" : "Stopped"}
							</Text>
						</VStack>
					</HStack>
					<Button
						variant={status().running ? "outline" : "solid"}
						colorPalette={status().running ? "red" : defaultPalette}
						onClick={status().running ? handleStop : handleStart}
						disabled={isLoading()}
						size="sm"
					>
						{isLoading() ? (
							<TbRefresh
								size={16}
								class={css({ animation: "spin 1s linear infinite" })}
							/>
						) : status().running ? (
							"Stop Server"
						) : (
							"Start Server"
						)}
					</Button>
				</HStack>

				<Show when={error()}>
					<Box
						bg="red.900/30"
						border="1px solid"
						borderColor="red.800"
						rounded="lg"
						p={3}
						mb={4}
					>
						<Text fontSize="sm" color="red.400">
							{error()}
						</Text>
					</Box>
				</Show>

				<Show when={!status().running}>
					<HStack gap={3}>
						<GenericField label="Port">
							<Input
								type="number"
								value={port()}
								onInput={(e) => setPort(parseInt(e.currentTarget.value) || 3456)}
								size="sm"
								w="100px"
							/>
						</GenericField>
						<Text fontSize="xs" color="gray.500" mt={6}>
							Default port is 3456. Change if it conflicts with another service.
						</Text>
					</HStack>
				</Show>
			</Box>

			{/* Connection URLs */}
			<Show when={status().running && status().addresses.length > 0}>
				<Box bg="gray.900/50" rounded="xl" p={4}>
					<Text fontWeight="semibold" fontSize="sm" color="gray.300" mb={3}>
						Connection URLs
					</Text>
					<Text fontSize="xs" color="gray.500" mb={4}>
						Open any of these URLs on your phone or tablet while connected to the same
						WiFi network.
					</Text>
					<Stack gap={2}>
						<For each={status().addresses}>
							{(address) => (
								<HStack
									bg="gray.800"
									rounded="lg"
									p={3}
									justify="space-between"
								>
									<Text fontSize="sm" color="gray.200" fontFamily="mono">
										{getConnectionUrl(address)}
									</Text>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => copyUrl(getConnectionUrl(address))}
									>
										{copied() ? (
											<TbCheck size={16} color="green" />
										) : (
											<TbCopy size={16} />
										)}
									</Button>
								</HStack>
							)}
						</For>
					</Stack>
				</Box>
			</Show>

			{/* Connected Clients */}
			<Show when={status().running}>
				<Box bg="gray.900/50" rounded="xl" p={4}>
					<HStack gap={2} mb={3}>
						<TbUsers size={18} class={css({ color: "gray.400" })} />
						<Text fontWeight="semibold" fontSize="sm" color="gray.300">
							Connected Clients ({status().clients.length})
						</Text>
					</HStack>
					<Show
						when={status().clients.length > 0}
						fallback={
							<Text fontSize="xs" color="gray.500">
								No clients connected yet. Open the URL on another device to connect.
							</Text>
						}
					>
						<Stack gap={2}>
							<For each={status().clients}>
								{(client) => (
									<HStack
										bg="gray.800"
										rounded="lg"
										p={3}
										justify="space-between"
									>
										<VStack alignItems="flex-start" gap={0}>
											<Text fontSize="sm" color="gray.200">
												{client.ip}
											</Text>
											<Text fontSize="xs" color="gray.500">
												Connected {new Date(client.connectedAt).toLocaleTimeString()}
											</Text>
										</VStack>
									</HStack>
								)}
							</For>
						</Stack>
					</Show>
				</Box>
			</Show>

			{/* Instructions */}
			<Box bg={`${defaultPalette}.900/20`} rounded="xl" p={4}>
				<Text fontWeight="semibold" fontSize="sm" color={`${defaultPalette}.300`} mb={2}>
					How to use
				</Text>
				<Stack gap={1}>
					<Text fontSize="xs" color="gray.400">
						1. Make sure your phone/tablet is on the same WiFi as this computer
					</Text>
					<Text fontSize="xs" color="gray.400">
						2. Start the server and copy a connection URL
					</Text>
					<Text fontSize="xs" color="gray.400">
						3. Open the URL in your browser to control Crater remotely
					</Text>
				</Stack>
			</Box>
		</Stack>
	);
}
