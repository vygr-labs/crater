import {
	createListCollection,
	useListCollection,
	type SelectValueChangeDetails,
} from "@ark-ui/solid";
import { createEffect, createMemo, createSignal, For, Switch } from "solid-js";
import { Box, HStack, Stack, VStack } from "styled-system/jsx";
import { Tabs } from "../ui/tabs";
import { Dialog } from "../ui/dialog";
import { Select } from "../ui/select";
import { Field, GenericField } from "../ui/field";
import { Input } from "../ui/input";
import { useAppContext } from "~/layouts/AppContext";
import {
	toggleTheme,
	updateDisplayBounds,
	updateProjectionDisplayId,
} from "~/utils/store-helpers";
import { Button } from "../ui/button";
import type { BasicSelectOption, DisplayBounds } from "~/types";
import type { Display } from "electron";
import { Text } from "../ui/text";
import { Portal } from "solid-js/web";
import { Icon } from "../ui/icon";
import { FaSolidMoon, FaSolidSun } from "solid-icons/fa";
import { ArkSwitch, GenericSwitch } from "../ui/switch";
import { TbCheck, TbChevronDown } from "solid-icons/tb";

export function AppSettingsDialog() {
	const [displayBounds, setDisplayBounds] = createSignal<
		DisplayBounds | undefined
	>();
	const { appStore, setAppStore, settings, updateSettings } = useAppContext();

	const { collection: displayCollection, set: setDisplayCollection } =
		useListCollection<BasicSelectOption>({
			initialItems: [],
		});

	createEffect(() => {
		if (settings.projectionBounds) {
			setDisplayBounds(settings.projectionBounds);
		}
	});

	createEffect(() => {
		if (appStore.openSettings) {
			window.electronAPI.getConnectedDisplays().then((result) => {
				console.log("Connected Displays: ", result);
				setDisplayCollection(
					result.map((val, index) => ({
						...val,
						label: val.label || `Display ${index + 1}`,
						value: val.id,
					})),
				);
			});
		}
	});

	function handleDisplayChange(details: SelectValueChangeDetails) {
		console.log(details);
		// setDisplayBounds(details)
		updateDisplayBounds(updateSettings, { ...details.items[0].workArea });
		updateProjectionDisplayId(updateSettings, details.items[0].id);
	}

	// function handleBoundChange(bound, event) {
	// 	console.log(bound, event)
	// }

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
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title>Settings</Dialog.Title>
					</Dialog.Header>
					<Dialog.Body>
						<Tabs.Root defaultValue="display" variant="line">
							<Tabs.List>
								<Tabs.Trigger value="display">Display</Tabs.Trigger>
								<Tabs.Trigger value="scripture">Scripture</Tabs.Trigger>
								<Tabs.Trigger value="songs">Songs</Tabs.Trigger>
							</Tabs.List>
							<Tabs.Content value="display" pt={8} pb={4}>
								<Stack gap={6}>
									<Select.Root
										collection={displayCollection()}
										// size="sm"
										width="full"
										defaultValue={[settings.projectionDisplayId.toString()]}
										onValueChange={handleDisplayChange}
									>
										<Select.HiddenSelect />
										<Select.Label>Select Display</Select.Label>

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
												<For each={displayCollection().items}>
													{(display) => (
														<Select.Item item={display}>
															{display.label}
															<Select.ItemIndicator>
																<TbCheck />
															</Select.ItemIndicator>
														</Select.Item>
													)}
												</For>
											</Select.Content>
										</Select.Positioner>
									</Select.Root>

									<HStack gap="3" width="full">
										<GenericField label="Left">
											<Input
												placeholder="0"
												value={settings.projectionBounds?.x}
												// onChange={e => handleBoundChange('x', e)}
												variant="outline"
												disabled
											/>
										</GenericField>
										<GenericField label="Top">
											<Input
												placeholder="0"
												value={settings.projectionBounds?.y}
												// onChange={e => handleBoundChange('x', e)}
												variant="outline"
												disabled
											/>
										</GenericField>
										<GenericField label="Width">
											<Input
												placeholder="1920"
												value={settings.projectionBounds?.width}
												// onChange={e => handleBoundChange('x', e)}
												variant="outline"
												disabled
											/>
										</GenericField>
										<GenericField label="Height">
											<Input
												placeholder="1080"
												value={settings.projectionBounds?.height}
												// onInput={e => handleBoundChange('x', e)}
												variant="outline"
												disabled
											/>
										</GenericField>
									</HStack>

									<HStack w="full" display="none">
										<Text>Change Theme</Text>
										<Box onClick={() => toggleTheme(updateSettings)}>
											<ArkSwitch.Root
												aria-label="Toggle color mode"
												colorPalette="blue"
												size="lg"
												checked={settings.theme === "light"}
											>
												<ArkSwitch.Control>
													<ArkSwitch.Thumb />
												</ArkSwitch.Control>
												<ArkSwitch.HiddenInput />
											</ArkSwitch.Root>
											{/* // trackLabel={{
											// 	on: (
											// 		<Icon color="yellow.400">
											// 			<FaSolidSun />
											// 		</Icon>
											// 	),
											// 	off: (
											// 		<Icon color="gray.400">
											// 			<FaSolidMoon />
											// 		</Icon>
											// 	),
											// }} */}
										</Box>
										{/* <ColorModeButton /> */}
									</HStack>
								</Stack>
							</Tabs.Content>
							<Tabs.Content value="scripture">
								Manage your projects
							</Tabs.Content>
							<Tabs.Content value="songs">
								Manage your tasks for freelancers
							</Tabs.Content>
						</Tabs.Root>
					</Dialog.Body>
					<Dialog.Footer>
						<Button
							variant="outline"
							onClick={() => setAppStore("openSettings", false)}
						>
							Cancel
						</Button>
						<Button onClick={() => setAppStore("openSettings", false)}>
							Save
						</Button>
					</Dialog.Footer>
					<Dialog.CloseTrigger />
				</Dialog.Content>
			</Dialog.Positioner>
		</Dialog.Root>
	);
}
