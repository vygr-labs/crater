import {
	useListCollection,
	type SelectValueChangeDetails,
} from "@ark-ui/solid";
import { createEffect, createSignal, For, on, onMount, Show } from "solid-js";
import { Box, Divider, HStack, Stack, VStack } from "styled-system/jsx";
import { Tabs } from "../ui/tabs";
import { Dialog } from "../ui/dialog";
import { Select } from "../ui/select";
import { GenericField } from "../ui/field";
import { Input } from "../ui/input";
import { useAppContext } from "~/layouts/AppContext";
import {
	toggleTheme,
	updateDisplayBounds,
	updateProjectionDisplayId,
	updateFontSize,
	updateDefaultTranslation,
	toggleShowVerseNumbers,
	toggleShowScriptureReference,
	toggleShowStrongsTab,
	toggleShowSongAuthor,
	toggleShowCcliNumber,
	toggleAutoAdvanceSlides,
	toggleAuthoritativeOverlay,
	toggleScriptureInputMode,
	toggleUseCustomProjectionBounds,
} from "~/utils/store-helpers";
import { Button } from "../ui/button";
import type { BasicSelectOption, DisplayBounds } from "~/types";
import type { Display } from "electron";
import { Text } from "../ui/text";
import { GenericSwitch } from "../ui/switch";
import { Checkbox } from "../ui/checkbox";
import {
	TbBook,
	TbBroadcast,
	TbCheck,
	TbChevronDown,
	TbDeviceDesktop,
	TbMoon,
	TbMusic,
	TbPalette,
	TbRefresh,
	TbSettings,
	TbSun,
	TbWifi,
} from "solid-icons/tb";
import {
	DEFAULT_PROJECTION_DISPLAY_ID,
	defaultPalette,
	neutralPalette,
} from "~/utils/constants";
import { css } from "styled-system/css";
import { RemoteControlSettings } from "../app/RemoteControlSettings";
import { NDISettings } from "../app/NDISettings";

// Section header component for consistent styling
function SectionHeader(props: {
	icon: any;
	title: string;
	description?: string;
}) {
	return (
		<HStack gap={3} mb={4}>
			<Box
				p={2}
				bg={`${defaultPalette}.900/50`}
				rounded="lg"
				color={`${defaultPalette}.400`}
			>
				<props.icon size={20} />
			</Box>
			<VStack alignItems="flex-start" gap={0}>
				<Text fontWeight="semibold" fontSize="md" color="gray.100">
					{props.title}
				</Text>
				<Show when={props.description}>
					<Text fontSize="xs" color="gray.500">
						{props.description}
					</Text>
				</Show>
			</VStack>
		</HStack>
	);
}

// Setting row component for consistent layout
function SettingRow(props: {
	label: string;
	description?: string;
	children: any;
}) {
	return (
		<HStack justify="space-between" py={3} gap={4}>
			<VStack alignItems="flex-start" gap={0.5} flex={1}>
				<Text fontSize="sm" fontWeight="medium" color="gray.200">
					{props.label}
				</Text>
				<Show when={props.description}>
					<Text fontSize="xs" color="gray.500">
						{props.description}
					</Text>
				</Show>
			</VStack>
			<Box flexShrink={0}>{props.children}</Box>
		</HStack>
	);
}

export function AppSettingsDialog() {
	const { appStore, setAppStore, settings, updateSettings } = useAppContext();
	const [isRefreshing, setIsRefreshing] = createSignal(false);
	const [displayBounds, setDisplayBounds] = createSignal<DisplayBounds>({
		x: 0,
		y: 0,
		width: 0,
		height: 0,
	});

	const { collection: displayCollection, setCollection: setDisplayCollection } =
		useListCollection({
			initialItems: [] as (Display & { label: string; value: string })[],
		});

	const fontSizeOptions: BasicSelectOption[] = [
		{ label: "Small", value: "small" },
		{ label: "Medium", value: "medium" },
		{ label: "Large", value: "large" },
		{ label: "Extra Large", value: "xlarge" },
	];

	createEffect(() => {
		if (settings.projectionBounds) {
			setDisplayBounds(settings.projectionBounds);
		}
	});

	const handleDisplaysUpdate = (allDisplays: Display[]) => {
		console.log("Connected Displays: ", allDisplays);
		setDisplayCollection(
			allDisplays.map((val, index) => ({
				...val,
				label: val.label || `Display ${index + 1}`,
				value: val.id.toString(),
			})),
		);

		if (settings.projectionDisplayId === DEFAULT_PROJECTION_DISPLAY_ID) {
			const externalDisplay =
				allDisplays.length > 1
					? (allDisplays.find((display) => {
							return display.bounds.x !== 0 || display.bounds.y !== 0;
						}) ?? allDisplays[1])
					: allDisplays[0];

			// Only auto-update bounds when not using custom bounds
			if (!settings.useCustomProjectionBounds) {
				updateDisplayBounds(updateSettings, {
					...externalDisplay.bounds,
				});
			}
			updateProjectionDisplayId(updateSettings, externalDisplay.id);
		}
	};

	const refreshDisplays = async () => {
		setIsRefreshing(true);
		try {
			const displays = await window.electronAPI.getConnectedDisplays();
			handleDisplaysUpdate(displays);
		} finally {
			setTimeout(() => setIsRefreshing(false), 500);
		}
	};

	onMount(() => {
		window.electronAPI.getConnectedDisplays().then(handleDisplaysUpdate);
		window.electronAPI.onDisplaysUpdate(handleDisplaysUpdate);
	});

	createEffect(
		on(
			() => appStore.openSettings,
			(settingsOpen) => {
				if (settingsOpen) {
					window.electronAPI.getConnectedDisplays().then(handleDisplaysUpdate);
				}
			},
		),
	);

	function handleDisplayChange(details: SelectValueChangeDetails) {
		// Only auto-update bounds when not using custom bounds
		if (!settings.useCustomProjectionBounds) {
			updateDisplayBounds(updateSettings, { ...details.items[0].bounds });
		}
		updateProjectionDisplayId(updateSettings, details.items[0].id);
	}

	const handleThemeToggle = () => {
		toggleTheme(updateSettings);
	};

	return (
		<Dialog.Root
			lazyMount
			placement="center"
			motionPreset="slide-in-top"
			open={appStore.openSettings}
			onOpenChange={(e) => setAppStore("openSettings", e.open)}
		>
			<Dialog.Backdrop />
			<Dialog.Positioner>
				<Dialog.Content minW="550px" maxW="650px">
					<Dialog.Header pb={2}>
						<Dialog.Title>
							<HStack gap={2} alignItems="center">
								<TbSettings size={20} />
								<Text>App Settings</Text>
							</HStack>
						</Dialog.Title>
					</Dialog.Header>
					<Dialog.Body>
						<Tabs.Root defaultValue="display" variant="line">
							<Tabs.List>
								<Tabs.Trigger value="display">
									<TbDeviceDesktop size={14} />
									Display
								</Tabs.Trigger>
								<Tabs.Trigger value="scripture">
									<TbBook size={14} />
									Scripture
								</Tabs.Trigger>
								<Tabs.Trigger value="songs">
									<TbMusic size={14} />
									Songs
								</Tabs.Trigger>
								<Tabs.Trigger value="ndi">
									<TbBroadcast size={14} />
									NDI
								</Tabs.Trigger>
								<Tabs.Trigger value="remote">
									<TbWifi size={14} />
									Remote
								</Tabs.Trigger>
								<Tabs.Trigger value="appearance">
									<TbPalette size={14} />
									Appearance
								</Tabs.Trigger>
							</Tabs.List>

							{/* Display Settings Tab */}
							<Tabs.Content value="display">
								<Stack gap={6} py={4}>
									<Box>
										<SectionHeader
											icon={TbDeviceDesktop}
											title="Projection Display"
											description="Configure which display is used for projection output"
										/>

										<Stack gap={4}>
											<GenericField label="Projection Display">
												<HStack gap={2}>
													<Select.Root
														collection={displayCollection}
														onValueChange={handleDisplayChange}
														value={[
															settings.projectionDisplayId?.toString() ?? "",
														]}
														width="full"
													>
														<Select.Control>
															<Select.Trigger>
																<Select.ValueText placeholder="Select display" />
																<TbChevronDown />
															</Select.Trigger>
														</Select.Control>
														<Select.Positioner>
															<Select.Content>
																<For each={displayCollection.items}>
																	{(display) => (
																		<Select.Item item={display}>
																			<Select.ItemText>
																				<VStack alignItems="flex-start" gap={0}>
																					<Text fontSize="sm">{display.label}</Text>
																					<Text fontSize="2xs" color="gray.500">
																						{(display as any).workArea?.width}x
																						{(display as any).workArea?.height}
																					</Text>
																				</VStack>
																			</Select.ItemText>
																			<Select.ItemIndicator>
																				<TbCheck />
																			</Select.ItemIndicator>
																		</Select.Item>
																	)}
																</For>
															</Select.Content>
														</Select.Positioner>
													</Select.Root>
													<Button
														size="sm"
														variant="ghost"
														colorPalette="gray"
														onClick={refreshDisplays}
														disabled={isRefreshing()}
													>
														<TbRefresh
															size={16}
															class={isRefreshing() ? css({ animation: "spin 1s linear infinite" }) : ""}
														/>
													</Button>
												</HStack>
											</GenericField>

											<Box>
												<HStack justify="space-between" mb={2}>
													<Checkbox.Root
														checked={settings.useCustomProjectionBounds}
														onCheckedChange={() =>
															toggleUseCustomProjectionBounds(updateSettings)
														}
													>
														<Checkbox.Label>
															<Text fontSize="sm" fontWeight="medium">
																{settings.useCustomProjectionBounds ? "Custom Projection Bounds" : "Display Bounds (Read-only)"}
															</Text>
														</Checkbox.Label>
														<Checkbox.HiddenInput />
														<Checkbox.Control />
													</Checkbox.Root>
												</HStack>
												<HStack gap={2}>
													<GenericField label="X">
														<Input
															type="number"
															value={settings.projectionBounds?.x}
															onChange={(e) => {}}
															disabled={!settings.useCustomProjectionBounds}
															onInput={(e) => {
																updateDisplayBounds(updateSettings, {
																	...settings.projectionBounds,
																	x: parseInt(e.currentTarget.value),
																});
															}}
														/>
													</GenericField>
													<GenericField label="Y">
														<Input
															type="number"
															value={settings.projectionBounds?.y}
															onChange={(e) => {}}
															disabled={!settings.useCustomProjectionBounds}
															onInput={(e) => {
																updateDisplayBounds(updateSettings, {
																	...settings.projectionBounds,
																	y: parseInt(e.currentTarget.value),
																});
															}}
														/>
													</GenericField>
													<GenericField label="Width">
														<Input
															type="number"
															value={settings.projectionBounds?.width}
															onChange={(e) => {}}
															disabled={!settings.useCustomProjectionBounds}
															onInput={(e) => {
																updateDisplayBounds(updateSettings, {
																	...settings.projectionBounds,
																	width: parseInt(e.currentTarget.value),
																});
															}}
														/>
													</GenericField>
													<GenericField label="Height">
														<Input
															type="number"
															value={settings.projectionBounds?.height}
															onChange={(e) => {}}
															disabled={!settings.useCustomProjectionBounds}
															onInput={(e) => {
																updateDisplayBounds(updateSettings, {
																	...settings.projectionBounds,
																	height: parseInt(e.currentTarget.value),
																});
															}}
														/>
													</GenericField>
												</HStack>
											</Box>
										</Stack>
									</Box>

									<Box>
										<SectionHeader
											icon={TbDeviceDesktop}
											title="General"
										/>
										<Stack gap={0} divideY="1px" divideColor="gray.800">
											<SettingRow
												label="Keep Projection on Top"
												description="Bring projection window to top when controls window is focused (only when on different displays)"
											>
												<GenericSwitch
													checked={settings.authoritativeOverlay}
													onCheckedChange={() =>
														toggleAuthoritativeOverlay(updateSettings)
													}
												/>
											</SettingRow>
										</Stack>
									</Box>
								</Stack>
							</Tabs.Content>

							{/* Scripture Settings Tab */}
							<Tabs.Content value="scripture">
								<Stack gap={6} py={4}>
									<Box>
										<SectionHeader
											icon={TbBook}
											title="Scripture Display"
										/>
										<Stack gap={0} divideY="1px" divideColor="gray.800">
											<SettingRow
												label="Show Verse Numbers"
											>
												<GenericSwitch
													checked={settings.showVerseNumbers}
													onCheckedChange={() =>
														toggleShowVerseNumbers(updateSettings)
													}
												/>
											</SettingRow>
											<SettingRow
												label="Show Scripture Reference"
											>
												<GenericSwitch
													checked={settings.showScriptureReference}
													onCheckedChange={() =>
														toggleShowScriptureReference(updateSettings)
													}
												/>
											</SettingRow>
											<SettingRow
												label="Show Strong's Tab"
											>
												<GenericSwitch
													checked={settings.showStrongsTab}
													onCheckedChange={() =>
														toggleShowStrongsTab(updateSettings)
													}
												/>
											</SettingRow>
											<SettingRow
												label="Scripture Input Mode"
												description="'Crater' uses keyboard shortcut navigation; 'Controlled' uses separate fields"
											>
												<GenericSwitch
													checked={settings.scriptureInputMode === "controlled"}
													onCheckedChange={() =>
														toggleScriptureInputMode(updateSettings)
													}
												/>
											</SettingRow>
										</Stack>
									</Box>

									<Box>
										<SectionHeader
											icon={TbBook}
											title="Scripture Defaults"
										/>
										<Stack gap={4}>
											<GenericField label="Default Translation">
												<Input
													value={settings.defaultTranslation}
													onInput={(e) =>
														updateDefaultTranslation(
															updateSettings,
															e.currentTarget.value,
														)
													}
												/>
											</GenericField>
										</Stack>
									</Box>
								</Stack>
							</Tabs.Content>

							{/* Songs Settings Tab */}
							<Tabs.Content value="songs">
								<Stack gap={6} py={4}>
									<Box>
										<SectionHeader
											icon={TbMusic}
											title="Song Display"
										/>
										<Stack gap={0} divideY="1px" divideColor="gray.800">
											<SettingRow label="Show Song Author">
												<GenericSwitch
													checked={settings.showSongAuthor}
													onCheckedChange={() =>
														toggleShowSongAuthor(updateSettings)
													}
												/>
											</SettingRow>
											<SettingRow label="Show CCLI Number">
												<GenericSwitch
													checked={settings.showCcliNumber}
													onCheckedChange={() =>
														toggleShowCcliNumber(updateSettings)
													}
												/>
											</SettingRow>
											<SettingRow label="Auto-Advance Slides">
												<GenericSwitch
													checked={settings.autoAdvanceSlides}
													onCheckedChange={() =>
														toggleAutoAdvanceSlides(updateSettings)
													}
												/>
											</SettingRow>
										</Stack>
									</Box>
								</Stack>
							</Tabs.Content>

							{/* NDI Settings Tab */}
							<Tabs.Content value="ndi">
								<Stack gap={6} py={4}>
									<NDISettings />
								</Stack>
							</Tabs.Content>

							{/* Remote Control Settings Tab */}
							<Tabs.Content value="remote">
								<Stack gap={6} py={4}>
									<RemoteControlSettings />
								</Stack>
							</Tabs.Content>

							{/* Appearance Settings Tab */}
							<Tabs.Content value="appearance">
								<Stack gap={6} py={4}>
									<Box>
										<SectionHeader
											icon={TbPalette}
											title="Theme"
										/>
										<Stack gap={0} divideY="1px" divideColor="gray.800">
											<SettingRow label="Dark Mode">
												<HStack gap={2}>
													<TbSun size={16} />
													<GenericSwitch
														checked={settings.theme === "dark"}
														onCheckedChange={handleThemeToggle}
													/>
													<TbMoon size={16} />
												</HStack>
											</SettingRow>
											<SettingRow
												label="Font Size"
												description="Controls the font size of the app interface (not the projection)"
											>
												<Select.Root
													collection={useListCollection({ initialItems: fontSizeOptions }).collection}
													onValueChange={(details) =>
														updateFontSize(
															updateSettings,
															details.value[0] as "small" | "medium" | "large" | "xlarge",
														)
													}
													value={[settings.fontSize]}
													width="150px"
										>
													<Select.Control>
														<Select.Trigger>
															<Select.ValueText />
															<TbChevronDown />
														</Select.Trigger>
													</Select.Control>
													<Select.Positioner>
														<Select.Content>
															<For each={fontSizeOptions}>
																{(option) => (
																	<Select.Item item={option}>
																		<Select.ItemText>{option.label}</Select.ItemText>
																		<Select.ItemIndicator>
																			<TbCheck />
																		</Select.ItemIndicator>
																	</Select.Item>
																)}
															</For>
														</Select.Content>
													</Select.Positioner>
												</Select.Root>
											</SettingRow>
										</Stack>
									</Box>
								</Stack>
							</Tabs.Content>
						</Tabs.Root>
					</Dialog.Body>
					<Dialog.Footer>
						<Dialog.ActionTrigger asChild>
							<Button variant="outline">Close</Button>
						</Dialog.ActionTrigger>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Positioner>
		</Dialog.Root>
	);
}
