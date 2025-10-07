// import { Button } from '@/components/ui/button'
// import {
// 	DialogActionTrigger,
// 	DialogBody,
// 	DialogCloseTrigger,
// 	DialogContent,
// 	DialogFooter,
// 	DialogHeader,
// 	DialogRoot,
// 	DialogTitle,
// } from '@/components/ui/dialog'
// import {
// 	SelectContent,
// 	SelectItem,
// 	SelectLabel,
// 	SelectRoot,
// 	SelectTrigger,
// 	SelectValueText,
// } from '@/components/ui/select'
// import {
// 	createListCollection,
// 	HStack,
// 	Input,
// 	SelectValueChangeDetails,
// 	Tabs,
// 	Text,
// 	VStack,
// } from '@chakra-ui/react'
// import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
// import { Field } from '../ui/field'
// import { ColorModeButton } from '../ui/color-mode'
// import { DisplayBounds } from '@/utils/types'
// import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
// import {
// 	updateDisplayBounds,
// 	updateProjectionDisplayId,
// } from '@/utils/redux/settingsSlice'

import { createListCollection, type SelectValueChangeDetails } from "@ark-ui/solid";
import { createEffect, createMemo, createSignal, For, Switch } from "solid-js";
import { Box, HStack, Stack, VStack } from "styled-system/jsx";
import { Tabs } from "../ui/tabs";
import { Dialog } from "../ui/dialog";
import { Select } from "../ui/select";
import { Field } from "../ui/field";
import { Input } from "../ui/input";
import { useAppContext } from "~/layouts/AppContext";
import { toggleTheme, updateDisplayBounds, updateProjectionDisplayId } from "~/utils/store-helpers";
import { Button } from "../ui/button";
import type { DisplayBounds } from "~/types";
import type { Display } from "electron";
import { Text } from "../ui/text";
import { Portal } from "solid-js/web";
import { Icon } from "../ui/icon";
import { FaSolidMoon, FaSolidSun } from "solid-icons/fa";
import { ArkSwitch, GenericSwitch } from "../ui/switch";

export function AppSettingsDialog() {
	const [displays, setDisplays] = createSignal<Display[]>([])
	const [displayBounds, setDisplayBounds] = createSignal<
		DisplayBounds | undefined
	>()
	// const dispatch = useAppDispatch()
	// const bounds = useAppSelector(state => state.settings.projectionBounds)
	// const displayId = useAppSelector(state => state.settings.projectionDisplayId)
	const { appStore, setAppStore, settings, updateSettings } = useAppContext();

	createEffect(() => {
		if (settings.projectionBounds) {
			setDisplayBounds(settings.projectionBounds)
		}
	})

	createEffect(() => {
		if (appStore.openSettings) {
			window.electronAPI.getConnectedDisplays().then(result => {
				setDisplays(result)
			})
		}
	})

	const displaySelectCollection = createMemo(
		() =>
			createListCollection({
				items: displays().map((val, index) => ({
					...val,
					label: `Display ${index + 1}`,
					value: val.id,
				})),
			})
	)

	function handleDisplayChange(details: SelectValueChangeDetails) {
		console.log(details)
		// setDisplayBounds(details)
		updateDisplayBounds(updateSettings, { ...details.items[0].workArea })
		updateProjectionDisplayId(updateSettings, details.items[0].id)
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
			onOpenChange={e => setAppStore("openSettings", e.open)}
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
										collection={displaySelectCollection()}
										// size="sm"
										width="full"
										defaultValue={[settings.projectionDisplayId.toString()]}
										onValueChange={handleDisplayChange}
									>
										<Select.HiddenSelect />
										<Select.Label>Select Display</Select.Label>

										<Select.Control>
											<Select.Trigger>
												<Select.ValueText placeholder="Change Displays" />
											</Select.Trigger>
											<Select.IndicatorGroup>
												<Select.Indicator />
											</Select.IndicatorGroup>
										</Select.Control>

										<Select.Positioner>
											<Select.Content>
												<For each={displaySelectCollection().items}>
													{display => (
														<Select.Item item={display}>
															{display.label}
															<Select.ItemIndicator />
														</Select.Item>
													)}
												</For>
											</Select.Content>
										</Select.Positioner>
									</Select.Root>

									<HStack gap="3" width="full">
										<Field label="Left">
											<Input
												placeholder="0"
												value={settings.projectionBounds?.x}
												// onChange={e => handleBoundChange('x', e)}
												variant="outline"
											/>
										</Field>
										<Field label="Top">
											<Input
												placeholder="0"
												value={settings.projectionBounds?.y}
												// onChange={e => handleBoundChange('x', e)}
												variant="outline"
											/>
										</Field>
										<Field label="Width">
											<Input
												placeholder="1920"
												value={settings.projectionBounds?.width}
												// onChange={e => handleBoundChange('x', e)}
												variant="outline"
											/>
										</Field>
										<Field label="Height">
											<Input
												placeholder="1080"
												value={settings.projectionBounds?.height}
												// onInput={e => handleBoundChange('x', e)}
												variant="outline"
											/>
										</Field>
									</HStack>

									<HStack w="full">
										<Text>Change Theme</Text>
										<Box onClick={() => toggleTheme(updateSettings)}>
											<ArkSwitch.Root aria-label="Toggle color mode"
												colorPalette="blue"
												size="lg"
												checked={settings.theme === 'light'}>
												<ArkSwitch.Control>
													<ArkSwitch.Thumb />
												</ArkSwitch.Control>
												{/* <Show when={getChildren()}>
													<ArkSwitch.Label>{getChildren()}</ArkSwitch.Label>
												  </Show> */}
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
							<Tabs.Content value="scripture">Manage your projects</Tabs.Content>
							<Tabs.Content value="songs">
								Manage your tasks for freelancers
							</Tabs.Content>
						</Tabs.Root>
					</Dialog.Body>
					<Dialog.Footer>
						{/* <Dialog.ActionTrigger asChild> */}
						<Button variant="outline">Cancel</Button>
						{/* </Dialog.ActionTrigger> */}
						{/* <Dialog.ActionTrigger asChild> */}
						<Button>Save</Button>
						{/* </Dialog.ActionTrigger> */}
					</Dialog.Footer>
					<Dialog.CloseTrigger />
				</Dialog.Content>
			</Dialog.Positioner>
		</Dialog.Root>
	)
}
