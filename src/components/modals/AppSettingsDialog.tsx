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
} from "~/utils/store-helpers";
import { Button } from "../ui/button";
import type { BasicSelectOption, DisplayBounds } from "~/types";
import type { Display } from "electron";
import { Text } from "../ui/text";
import { GenericSwitch } from "../ui/switch";
import { Checkbox } from "../ui/checkbox";
import {
	TbBook,
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
	const [displayBounds, setDisplayBounds] = createSignal<
		DisplayBounds | undefined
	>();
	const { appStore, setAppStore, settings, updateSettings } = useAppContext();
	const [isRefreshing, setIsRefreshing] = createSignal(false);

	const { collection: displayCollection, set: setDisplayCollection } =
		useListCollection<BasicSelectOption>({
			initialItems: [],
		});

	// Available translations for scripture settings
	const { collection: translationCollection } = useListCollection({
		initialItems: [
			{ label: "NKJV - New King James Version", value: "NKJV" },
			{ label: "KJV - King James Version", value: "KJV" },
			{ label: "NIV - New International Version", value: "NIV" },
			{ label: "NLT - New Living Translation", value: "NLT" },
			{ label: "ASV - American Standard Version", value: "ASV" },
			{ label: "AMPC - Amplified Bible Classic", value: "AMPC" },
			{ label: "TLV - Tree of Life Version", value: "TLV" },
		],
	});

	// Font size options
	const { collection: fontSizeCollection } = useListCollection({
		initialItems: [
			{ label: "Small", value: "small" },
			{ label: "Medium", value: "medium" },
			{ label: "Large", value: "large" },
			{ label: "Extra Large", value: "xlarge" },
		],
	});

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

			updateDisplayBounds(updateSettings, {
				...externalDisplay.workArea,
			});
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
		updateDisplayBounds(updateSettings, { ...details.items[0].workArea });
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
						<HStack gap={3}>
							<Box
								p={2}
								bg={`${defaultPalette}.900/30`}
								rounded="lg"
								color={`${defaultPalette}.400`}
							>
								<TbSettings size={22} />
							</Box>
							<VStack alignItems="flex-start" gap={0}>
								<Dialog.Title fontSize="xl">Settings</Dialog.Title>
								<Text fontSize="xs" color="gray.500">
									Configure your Crater experience
								</Text>
							</VStack>
						</HStack>
					</Dialog.Header>
					<Dialog.Body pt={2}>
						<Tabs.Root defaultValue="display" variant="line">
							<Tabs.List>
								<Tabs.Trigger value="display">
									<HStack gap={2}>
										<TbDeviceDesktop size={16} />
										<span>Display</span>
									</HStack>
								</Tabs.Trigger>
								<Tabs.Trigger value="appearance">
									<HStack gap={2}>
										<TbPalette size={16} />
										<span>Appearance</span>
									</HStack>
								</Tabs.Trigger>
								<Tabs.Trigger value="scripture">
									<HStack gap={2}>
										<TbBook size={16} />
										<span>Scripture</span>
									</HStack>
								</Tabs.Trigger>
								<Tabs.Trigger value="songs">
									<HStack gap={2}>
										<TbMusic size={16} />
										<span>Songs</span>
									</HStack>
								</Tabs.Trigger>
								<Tabs.Trigger value="remote">
									<HStack gap={2}>
										<TbWifi size={16} />
										<span>Remote</span>
									</HStack>
								</Tabs.Trigger>
							</Tabs.List>

							{/* Display Settings Tab */}
							<Tabs.Content value="display" pt={6} pb={4}>
								<Stack gap={6}>
									<SectionHeader
										icon={TbDeviceDesktop}
										title="Projection Display"
										description="Choose which screen to use for projection output"
									/>

									<Box bg="gray.900/50" rounded="xl" p={4}>
										<HStack gap={3} mb={4}>
											<Select.Root
												collection={displayCollection()}
												width="full"
												value={[settings.projectionDisplayId.toString()]}
												onValueChange={handleDisplayChange}
											>
												<Select.HiddenSelect />
												<Select.Control>
													<Select.Trigger>
														<Select.ValueText placeholder="Select a display" />
													</Select.Trigger>
													<Select.IndicatorGroup>
														<Select.Indicator>
															<TbChevronDown />
														</Select.Indicator>
													</Select.IndicatorGroup>
												</Select.Control>

												<Select.Positioner>
													<Select.Content>
														<For each={displayCollection().items}>
															{(display) => {
																const displayData =
																	display as BasicSelectOption & {
																		workArea?: {
																			width: number;
																			height: number;
																		};
																	};
																return (
																	<Select.Item item={display}>
																		<HStack justify="space-between" w="full">
																			<Text>{display.label}</Text>
																			<Text fontSize="xs" color="gray.500">
																				{displayData.workArea?.width}x
																				{displayData.workArea?.height}
																			</Text>
																		</HStack>
																		<Select.ItemIndicator>
																			<TbCheck />
																		</Select.ItemIndicator>
																	</Select.Item>
																);
															}}
														</For>
													</Select.Content>
												</Select.Positioner>
											</Select.Root>
											<Button
												variant="outline"
												size="sm"
												onClick={refreshDisplays}
												disabled={isRefreshing()}
											>
												<TbRefresh
													size={16}
													class={css({
														animation: isRefreshing()
															? "spin 1s linear infinite"
															: "none",
													})}
												/>
											</Button>
										</HStack>

										<Divider my={4} borderColor="gray.800" />

										<Text fontSize="xs" color="gray.500" mb={3}>
											Display Bounds (Read-only)
										</Text>
										<HStack gap={3} width="full">
											<GenericField label="Left">
												<Input
													placeholder="0"
													value={settings.projectionBounds?.x}
													variant="outline"
													size="sm"
													disabled
												/>
											</GenericField>
											<GenericField label="Top">
												<Input
													placeholder="0"
													value={settings.projectionBounds?.y}
													variant="outline"
													size="sm"
													disabled
												/>
											</GenericField>
											<GenericField label="Width">
												<Input
													placeholder="1920"
													value={settings.projectionBounds?.width}
													variant="outline"
													size="sm"
													disabled
												/>
											</GenericField>
											<GenericField label="Height">
												<Input
													placeholder="1080"
													value={settings.projectionBounds?.height}
													variant="outline"
													size="sm"
													disabled
												/>
											</GenericField>
										</HStack>
									</Box>

									<Box bg="gray.900/50" rounded="xl" p={4}>
										<SettingRow
											label="Authoritative Overlay"
											description="Bring projection window to front when controls are focused"
										>
											<Checkbox
												colorPalette={defaultPalette}
												checked={settings.authoritativeOverlay}
												onCheckedChange={() =>
													toggleAuthoritativeOverlay(updateSettings)
												}
											/>
										</SettingRow>
									</Box>
								</Stack>
							</Tabs.Content>

							{/* Appearance Settings Tab */}
							<Tabs.Content value="appearance" pt={6} pb={4}>
								<Stack gap={6}>
									<SectionHeader
										icon={TbPalette}
										title="Theme & Appearance"
										description="Customize how Crater looks"
									/>

									<Box bg="gray.900/50" rounded="xl" p={4}>
										<SettingRow
											label="Dark Mode"
											description="Switch between light and dark themes"
										>
											<HStack gap={2}>
												<TbSun
													size={16}
													class={css({
														color:
															settings.theme === "light"
																? "yellow.400"
																: `${neutralPalette}.600`,
													})}
												/>
												<GenericSwitch
													colorPalette={defaultPalette}
													checked={settings.theme === "dark"}
													onCheckedChange={handleThemeToggle}
												/>
												<TbMoon
													size={16}
													class={css({
														color:
															settings.theme === "dark"
																? `${defaultPalette}.400`
																: `${neutralPalette}.600`,
													})}
												/>
											</HStack>
										</SettingRow>

										<Divider my={2} borderColor="gray.800" />

										<SettingRow
											label="Projection Font Size"
											description="Default text size for projected content"
										>
											<Select.Root
												collection={fontSizeCollection()}
												width="140px"
												size="sm"
												value={[settings.fontSize]}
												onValueChange={(details) => {
													updateFontSize(
														updateSettings,
														details.value[0] as
															| "small"
															| "medium"
															| "large"
															| "xlarge",
													);
												}}
											>
												<Select.HiddenSelect />
												<Select.Control>
													<Select.Trigger>
														<Select.ValueText />
													</Select.Trigger>
													<Select.IndicatorGroup>
														<Select.Indicator>
															<TbChevronDown />
														</Select.Indicator>
													</Select.IndicatorGroup>
												</Select.Control>
												<Select.Positioner>
													<Select.Content>
														<For each={fontSizeCollection().items}>
															{(item) => (
																<Select.Item item={item}>
																	{item.label}
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
									</Box>
								</Stack>
							</Tabs.Content>

							{/* Scripture Settings Tab */}
							<Tabs.Content value="scripture" pt={6} pb={4}>
								<Stack gap={6}>
									<SectionHeader
										icon={TbBook}
										title="Scripture Settings"
										description="Configure Bible display preferences"
									/>

									<Box bg="gray.900/50" rounded="xl" p={4}>
										<SettingRow
											label="Default Translation"
											description="Bible version to use when loading scriptures"
										>
											<Select.Root
												collection={translationCollection()}
												width="200px"
												size="sm"
												value={[settings.defaultTranslation]}
												onValueChange={(details) => {
													updateDefaultTranslation(
														updateSettings,
														details.value[0],
													);
												}}
											>
												<Select.HiddenSelect />
												<Select.Control>
													<Select.Trigger>
														<Select.ValueText />
													</Select.Trigger>
													<Select.IndicatorGroup>
														<Select.Indicator>
															<TbChevronDown />
														</Select.Indicator>
													</Select.IndicatorGroup>
												</Select.Control>
												<Select.Positioner>
													<Select.Content>
														<For each={translationCollection().items}>
															{(item) => (
																<Select.Item item={item}>
																	{item.label}
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

										<Divider my={2} borderColor="gray.800" />

										<SettingRow
											label="Show Verse Numbers"
											description="Display verse numbers in projection"
										>
											<Checkbox
												colorPalette={defaultPalette}
												checked={settings.showVerseNumbers}
												onCheckedChange={() =>
													toggleShowVerseNumbers(updateSettings)
												}
											/>
										</SettingRow>

										<Divider my={2} borderColor="gray.800" />

										<SettingRow
											label="Show Reference"
											description="Display book, chapter and verse reference"
										>
											<Checkbox
												colorPalette={defaultPalette}
												checked={settings.showScriptureReference}
												onCheckedChange={() =>
													toggleShowScriptureReference(updateSettings)
												}
											/>
										</SettingRow>

										<Divider my={2} borderColor="gray.800" />

										<SettingRow
											label="Use Crater Input Mode"
											description="Enable smart scripture parsing and navigation"
										>
											<Checkbox
												colorPalette={defaultPalette}
												checked={settings.scriptureInputMode === "crater"}
												onCheckedChange={() =>
													toggleScriptureInputMode(updateSettings)
												}
											/>
										</SettingRow>

										<Divider my={2} borderColor="gray.800" />

										<SettingRow
											label="Show Strong's Tab"
											description="Show the Strong's concordance tab in the main interface"
										>
											<Checkbox
												colorPalette={defaultPalette}
												checked={settings.showStrongsTab}
												onCheckedChange={() =>
													toggleShowStrongsTab(updateSettings)
												}
											/>
										</SettingRow>
									</Box>

									<Box bg="gray.900/50" rounded="xl" p={4}>
										<Text
											fontSize="sm"
											fontWeight="medium"
											color="gray.300"
											mb={3}
										>
											Search Index
										</Text>
										<HStack justify="space-between">
											<VStack alignItems="flex-start" gap={0.5}>
												<Text fontSize="xs" color="gray.500">
													Rebuild the scripture search index if search isn't
													working properly
												</Text>
											</VStack>
											<Button
												variant="outline"
												size="sm"
												onClick={() => {
													window.electronAPI.rebuildScripturesFtsIndex();
												}}
											>
												<TbRefresh size={14} />
												Rebuild Index
											</Button>
										</HStack>
									</Box>
								</Stack>
							</Tabs.Content>

							{/* Songs Settings Tab */}
							<Tabs.Content value="songs" pt={6} pb={4}>
								<Stack gap={6}>
									<SectionHeader
										icon={TbMusic}
										title="Song Settings"
										description="Configure song display and import preferences"
									/>

									<Box bg="gray.900/50" rounded="xl" p={4}>
										<SettingRow
											label="Show Song Author"
											description="Display author/artist below song title"
										>
											<Checkbox
												colorPalette={defaultPalette}
												checked={settings.showSongAuthor}
												onCheckedChange={() =>
													toggleShowSongAuthor(updateSettings)
												}
											/>
										</SettingRow>

										<Divider my={2} borderColor="gray.800" />

										<SettingRow
											label="Show CCLI Number"
											description="Display CCLI license number on songs"
										>
											<Checkbox
												colorPalette={defaultPalette}
												checked={settings.showCcliNumber}
												onCheckedChange={() =>
													toggleShowCcliNumber(updateSettings)
												}
											/>
										</SettingRow>

										<Divider my={2} borderColor="gray.800" />

										<SettingRow
											label="Auto-advance Slides"
											description="Automatically move to next slide during playback"
										>
											<Checkbox
												colorPalette={defaultPalette}
												checked={settings.autoAdvanceSlides}
												onCheckedChange={() =>
													toggleAutoAdvanceSlides(updateSettings)
												}
											/>
										</SettingRow>
									</Box>

									<Box bg="gray.900/50" rounded="xl" p={4}>
										<Text
											fontSize="sm"
											fontWeight="medium"
											color="gray.300"
											mb={3}
										>
											Search Index
										</Text>
										<HStack justify="space-between">
											<VStack alignItems="flex-start" gap={0.5}>
												<Text fontSize="xs" color="gray.500">
													Rebuild the song search index if search isn't working
													properly
												</Text>
											</VStack>
											<Button
												variant="outline"
												size="sm"
												onClick={() => {
													window.electronAPI.rebuildSongsFtsIndex();
												}}
											>
												<TbRefresh size={14} />
												Rebuild Index
											</Button>
										</HStack>
									</Box>
								</Stack>
							</Tabs.Content>

							{/* Remote Control Tab */}
							<Tabs.Content value="remote" pt={6} pb={4}>
								<RemoteControlSettings />
							</Tabs.Content>
						</Tabs.Root>
					</Dialog.Body>
					<Dialog.Footer pt={4}>
						<HStack gap={3}>
							<Button
								variant="outline"
								onClick={() => setAppStore("openSettings", false)}
							>
								Cancel
							</Button>
							<Button
								colorPalette={defaultPalette}
								onClick={() => setAppStore("openSettings", false)}
							>
								Done
							</Button>
						</HStack>
					</Dialog.Footer>
					<Dialog.CloseTrigger />
				</Dialog.Content>
			</Dialog.Positioner>
		</Dialog.Root>
	);
}
