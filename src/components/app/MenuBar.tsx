import { HStack } from "styled-system/jsx";
import { useAppContext } from "~/layouts/AppContext";
import { Menu } from "../ui/menu";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { FaSolidChevronDown } from "solid-icons/fa";
import { IconButton } from "../ui/icon-button";
import { ArkSwitch } from "../ui/switch";
import { Text } from "../ui/text";
import { TbArrowsRightDown, TbChevronRight, TbClearAll } from "solid-icons/tb";
import { TiSortNumerically } from "solid-icons/ti";
import {
	defaultPalette,
	defaultAbsenteePalette,
	GLOBAL_FOCUS_NAME,
} from "~/utils/constants";
import { IoSettings } from "solid-icons/io";
import { Portal } from "solid-js/web";
import {
	addRecentSchedule,
	toggleClearDisplay,
	toggleLive,
	toggleLogo,
} from "~/utils/store-helpers";
import type { SwitchCheckedChangeDetails } from "@ark-ui/solid";
import { BsDisplayFill } from "solid-icons/bs";
import { createStore, unwrap } from "solid-js/store";
import { batch, createEffect, createSignal, For, Show } from "solid-js";
import { getToastType, toaster } from "~/utils";
import GenericModal from "../modals/GenericModal";
import { GenericField } from "../ui/field";
import { Input } from "../ui/input";
import { createAsyncMemo } from "solidjs-use";
import type { SavedSchedule } from "~/backend/types";
import {
	useFocusContext,
	type FocusEventHandlerFn,
} from "~/layouts/FocusContext";

export type Props = {
	// openAppSettings: () => void
};

interface MenuControlsType {
	scheduleName: string;
	openSchedModal: boolean;
	loadedSchedule: SavedSchedule | null;
}

export default function MenuBar(props: Props) {
	const { appStore, setAppStore, settings, updateSettings } = useAppContext();
	const [menuStore, setMenuStore] = createStore<MenuControlsType>({
		scheduleName: "",
		openSchedModal: false,
		loadedSchedule: null,
	});

	const handleShortcutSave: FocusEventHandlerFn = ({ event }) => {
		console.log(
			"Saving schedule ",
			menuStore.loadedSchedule,
			appStore.recentSchedules,
		);
		if (event.ctrlKey) {
			if (menuStore.loadedSchedule) {
				onSaveSchedule();
			} else if (appStore.scheduleItems.length) {
				setMenuStore("openSchedModal", true);
			}
		}
	};

	const { subscribeEvent, currentPanel } = useFocusContext();
	const { name, coreFocusId, fluidFocusId, changeFluidFocus } = subscribeEvent({
		name: GLOBAL_FOCUS_NAME,
		handlers: {
			s: handleShortcutSave,
			S: handleShortcutSave,
		},
		global: true,
	});

	function openImportDialog() {
		setAppStore("loading", {
			reason: "Importing Database...",
			isLoading: true,
		});
		window.electronAPI.importEswSongs().then(({ success, message }) => {
			console.log("Result from Dialog: ", message);
			toaster.create({
				type: getToastType(success),
				title: message,
			});

			setAppStore("songsUpdateCounter", (former) => ++former);
			setAppStore("loading", { reason: "Finished task", isLoading: false });
		});
	}

	function handleLiveToggle() {
		console.log("Former Live: ", appStore.isLive);
		toggleLive(setAppStore); // toggleLive(setAppStore, checked)
		console.log("New Live: ", appStore.isLive);
	}

	createEffect(() => {
		if (appStore.isLive) {
			console.log(settings.projectionBounds);
			window.electronAPI.openProjectionWindow(
				unwrap(settings.projectionBounds),
			);
		} else {
			window.electronAPI.closeProjectionWindow();
		}
	});

	const onSaveSchedule = () => {
		const sched = {
			name: menuStore.scheduleName,
			items: unwrap(appStore.scheduleItems),
		};
		window.electronAPI
			.saveSchedule({
				schedule: sched,
				overwrite: Boolean(menuStore.loadedSchedule),
			})
			.then(({ success, message, path }) => {
				if (success) {
					const savedSched = {
						...sched,
						path,
						last_used: Date.now(),
					};
					addRecentSchedule(setAppStore, savedSched);
					batch(() => {
						setMenuStore("loadedSchedule", savedSched);
						setMenuStore("scheduleName", savedSched.name);
					});
				}
				toaster.create({ type: getToastType(success), title: message });
			});
	};

	const loadSchedule = async (savedSched: SavedSchedule) => {
		const scheduleData = await window.electronAPI.getScheduleData(
			unwrap(savedSched),
		);
		console.log(scheduleData);
		console.log("SCHEDULE LOADED: ", JSON.parse(scheduleData));
		setAppStore("scheduleItems", JSON.parse(scheduleData).items);
		batch(() => {
			setMenuStore("loadedSchedule", savedSched);
			setMenuStore("scheduleName", savedSched.name);
		});
	};

	const emptySchedule = () => {
		batch(() => {
			setAppStore("scheduleItems", []);
			setMenuStore("loadedSchedule", null);
			setMenuStore("scheduleName", "");
		});
	};

	return (
		<HStack
			w="full"
			h="1/12"
			px="4"
			pos="absolute"
			top="0"
			justify="space-between"
		>
			<HStack gap={3}>
				<Menu.Root>
					<Menu.Trigger
						asChild={(parentProps) => (
							<Button variant="outline" size="sm" {...parentProps}>
								Schedule
								<Icon fontSize="sm">
									<FaSolidChevronDown />
								</Icon>
							</Button>
						)}
					></Menu.Trigger>
					<Portal>
						<Menu.Positioner>
							<Menu.Content>
								<Menu.Item
									value="new"
									onClick={emptySchedule}
									disabled={appStore.scheduleItems.length === 0}
								>
									New
								</Menu.Item>
								<Menu.Item
									value="save-schedule"
									disabled={appStore.scheduleItems.length === 0}
								>
									Save
								</Menu.Item>
								<Menu.Item
									value="save-schedule-as"
									onClick={() => setMenuStore("openSchedModal", true)}
									disabled={appStore.scheduleItems.length === 0}
								>
									Save as...
								</Menu.Item>
								<Menu.Item value="open-schedule">Open</Menu.Item>
								<Show
									when={appStore.recentSchedules.length}
									fallback={
										<Menu.Item value="disabled-recent" disabled>
											Recent
										</Menu.Item>
									}
								>
									<Menu.Root>
										<Menu.TriggerItem justifyContent="space-between">
											Recents <TbChevronRight />
										</Menu.TriggerItem>
										<Portal>
											<Menu.Positioner>
												<Menu.Content>
													<For each={appStore.recentSchedules}>
														{(item) => (
															<Menu.Item
																value={item.path}
																onClick={() => loadSchedule(item)}
															>
																{item.path}
															</Menu.Item>
														)}
													</For>
												</Menu.Content>
											</Menu.Positioner>
										</Portal>
									</Menu.Root>
								</Show>
							</Menu.Content>
						</Menu.Positioner>
					</Portal>
				</Menu.Root>

				<IconButton
					bgColor="gray.800"
					color="white"
					size="sm"
					onClick={() => {
						setAppStore("openSettings", true);
					}}
				>
					<IoSettings />
				</IconButton>

				<Button
					colorPalette="black"
					variant="outline"
					onClick={openImportDialog}
				>
					<TbArrowsRightDown /> Import
				</Button>
			</HStack>
			<HStack gap={6}>
				<HStack gap={3}>
					<Button
						onClick={() => toggleLogo(setAppStore)}
						variant="surface"
						colorPalette={
							appStore.showLogo ? defaultPalette : defaultAbsenteePalette
						}
					>
						<Icon fontSize="2xl" aria-label="Show Logo">
							<TiSortNumerically />
						</Icon>
						<Text textStyle="xs">Logo</Text>
					</Button>

					<Button
						onClick={() => toggleClearDisplay(setAppStore)}
						variant="surface"
						colorPalette={
							appStore.hideLive ? defaultPalette : defaultAbsenteePalette
						}
					>
						<Icon fontSize="2xl" aria-label="Clear Display">
							<TbClearAll />
						</Icon>
						<Text textStyle="xs">Clear</Text>
					</Button>
				</HStack>

				<Button
					variant="surface"
					colorPalette={
						appStore.isLive ? defaultPalette : defaultAbsenteePalette
					}
					onclick={handleLiveToggle}
				>
					<BsDisplayFill /> Go Live
				</Button>
				{/* <ArkSwitch.Root
					size="lg"
					checked={appStore.isLive}
					onCheckedChange={handleLiveToggle}
					flexDir="column"
				>
					<ArkSwitch.HiddenInput />
					<ArkSwitch.Control>
						<ArkSwitch.Thumb />
					</ArkSwitch.Control>
					<ArkSwitch.Label fontSize="xs">Go Live</ArkSwitch.Label>
				</ArkSwitch.Root> */}
			</HStack>

			<GenericModal
				open={menuStore.openSchedModal}
				setOpen={(bool) => setMenuStore("openSchedModal", bool)}
				title="Name your schedule"
				footer={
					<>
						<Button
							variant="outline"
							onClick={() => setMenuStore("openSchedModal", false)}
						>
							Cancel
						</Button>
						<Button onclick={onSaveSchedule}>Save</Button>
					</>
				}
			>
				<GenericField label={`Name`}>
					<Input
						placeholder="My Star"
						variant="outline"
						value={menuStore.scheduleName}
						onChange={(e) => setMenuStore("scheduleName", e.target.value)}
					/>
				</GenericField>
			</GenericModal>
		</HStack>
	);
}
