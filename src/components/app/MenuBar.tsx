import { Box, Divider, HStack } from "styled-system/jsx";
import { useAppContext } from "~/layouts/AppContext";
import { Menu } from "../ui/menu";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { FaSolidChevronDown } from "solid-icons/fa";
import { IconButton } from "../ui/icon-button";
import { Text } from "../ui/text";
import {
	TbArrowsRightDown,
	TbChevronRight,
	TbClearAll,
	TbDeviceFloppy,
	TbFile,
	TbFileExport,
	TbHistory,
	TbPlus,
	TbScreenShare,
	TbScreenShareOff,
} from "solid-icons/tb";
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
import { BsDisplayFill } from "solid-icons/bs";
import { createStore, unwrap } from "solid-js/store";
import {
	batch,
	createEffect,
	createMemo,
	createSignal,
	For,
	Show,
} from "solid-js";
import { getToastType, logger, toaster } from "~/utils";
import GenericModal from "../modals/GenericModal";
import { GenericField } from "../ui/field";
import { Input } from "../ui/input";
import type { SavedSchedule } from "~/backend/types";
import {
	useFocusContext,
	type FocusEventHandlerFn,
} from "~/layouts/FocusContext";
import { Tooltip } from "../ui/tooltip";
import { Kbd } from "../ui/kbd";
import { AiOutlineFolderOpen } from "solid-icons/ai";

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
		logger.info([
			"Default Projection Bounds: ",
			settings.projectionBounds,
			settings.projectionDisplayId,
		]);
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

	const hasScheduleItems = createMemo(() => appStore.scheduleItems.length > 0);
	const hasLoadedSchedule = createMemo(() => menuStore.loadedSchedule !== null);

	// Tooltip wrapper component for cleaner code
	const TooltipButton = (props: {
		children: any;
		tooltip: string;
		shortcut?: string;
		onClick?: () => void;
		disabled?: boolean;
		colorPalette?: string;
		variant?: "solid" | "outline" | "ghost" | "surface";
		size?: "xs" | "sm" | "md" | "lg";
	}) => (
		<Tooltip.Root openDelay={400} closeDelay={0}>
			<Tooltip.Trigger
				asChild={(triggerProps) => (
					<Button
						{...triggerProps()}
						onClick={props.onClick}
						disabled={props.disabled}
						colorPalette={props.colorPalette}
						variant={props.variant ?? "surface"}
						size={props.size ?? "sm"}
					>
						{props.children}
					</Button>
				)}
			/>
			<Tooltip.Positioner>
				<Tooltip.Content>
					<Tooltip.Arrow>
						<Tooltip.ArrowTip />
					</Tooltip.Arrow>
					<HStack gap={2}>
						<Text>{props.tooltip}</Text>
						<Show when={props.shortcut}>
							<Kbd size="sm">{props.shortcut}</Kbd>
						</Show>
					</HStack>
				</Tooltip.Content>
			</Tooltip.Positioner>
		</Tooltip.Root>
	);

	return (
		<HStack
			w="full"
			h="1/12"
			px={4}
			pos="absolute"
			top={0}
			justify="space-between"
			bg="gray.950/80"
			backdropFilter="blur(8px)"
			borderBottom="1px solid"
			borderBottomColor="gray.800"
			zIndex={100}
		>
			{/* Left Section: Schedule & Settings */}
			<HStack gap={2}>
				{/* Schedule Menu */}
				<Menu.Root>
					<Menu.Trigger
						asChild={(parentProps) => (
							<Button
								variant="ghost"
								size="sm"
								{...parentProps()}
								px={3}
								_hover={{ bg: "gray.800" }}
							>
								<TbFile size={16} />
								<Text fontSize="sm" fontWeight="medium">
									Schedule
								</Text>
								<Show when={hasLoadedSchedule()}>
									<Text
										fontSize="xs"
										color="gray.400"
										maxW="120px"
										truncate
										ml={1}
									>
										({menuStore.scheduleName})
									</Text>
								</Show>
								<FaSolidChevronDown size={10} />
							</Button>
						)}
					/>
					<Portal>
						<Menu.Positioner>
							<Menu.Content minW="220px">
								<Menu.ItemGroup>
									<Menu.ItemGroupLabel>Schedule</Menu.ItemGroupLabel>
									<Menu.Item
										value="new"
										onClick={emptySchedule}
										disabled={!hasScheduleItems()}
									>
										<HStack justify="space-between" w="full">
											<HStack gap={2}>
												<TbPlus size={16} />
												<Text>New Schedule</Text>
											</HStack>
											<Kbd size="sm">Ctrl+N</Kbd>
										</HStack>
									</Menu.Item>
									<Menu.Item
										value="save-schedule"
										onClick={() => {
											if (hasLoadedSchedule()) {
												onSaveSchedule();
											} else {
												setMenuStore("openSchedModal", true);
											}
										}}
										disabled={!hasScheduleItems()}
									>
										<HStack justify="space-between" w="full">
											<HStack gap={2}>
												<TbDeviceFloppy size={16} />
												<Text>Save</Text>
											</HStack>
											<Kbd size="sm">Ctrl+S</Kbd>
										</HStack>
									</Menu.Item>
									<Menu.Item
										value="save-schedule-as"
										onClick={() => setMenuStore("openSchedModal", true)}
										disabled={!hasScheduleItems()}
									>
										<HStack justify="space-between" w="full">
											<HStack gap={2}>
												<TbFileExport size={16} />
												<Text>Save as...</Text>
											</HStack>
											<Kbd size="sm">Ctrl+Shift+S</Kbd>
										</HStack>
									</Menu.Item>
									<Menu.Item value="open-schedule">
										<HStack justify="space-between" w="full">
											<HStack gap={2}>
												<AiOutlineFolderOpen size={16} />
												<Text>Open</Text>
											</HStack>
											<Kbd size="sm">Ctrl+O</Kbd>
										</HStack>
									</Menu.Item>
								</Menu.ItemGroup>

								<Menu.Separator />

								<Menu.ItemGroup>
									<Menu.ItemGroupLabel>
										<HStack gap={1}>
											<TbHistory size={14} />
											<Text>Recent</Text>
										</HStack>
									</Menu.ItemGroupLabel>
									<Show
										when={appStore.recentSchedules.length}
										fallback={
											<Menu.Item value="no-recent" disabled>
												<Text fontSize="xs" color="gray.500">
													No recent schedules
												</Text>
											</Menu.Item>
										}
									>
										<For each={appStore.recentSchedules.slice(0, 5)}>
											{(item) => (
												<Menu.Item
													value={item.path}
													onClick={() => loadSchedule(item)}
												>
													<Text fontSize="sm" truncate maxW="180px">
														{item.name || item.path.split(/[/\\]/).pop()}
													</Text>
												</Menu.Item>
											)}
										</For>
									</Show>
								</Menu.ItemGroup>
							</Menu.Content>
						</Menu.Positioner>
					</Portal>
				</Menu.Root>

				{/* Settings Button */}
				<Tooltip.Root openDelay={400} closeDelay={0}>
					<Tooltip.Trigger
						asChild={(triggerProps) => (
							<IconButton
								{...triggerProps()}
								variant="ghost"
								size="sm"
								onClick={() => setAppStore("openSettings", true)}
								_hover={{ bg: "gray.800" }}
							>
								<IoSettings size={18} />
							</IconButton>
						)}
					/>
					<Tooltip.Positioner>
						<Tooltip.Content>
							<Tooltip.Arrow>
								<Tooltip.ArrowTip />
							</Tooltip.Arrow>
							Settings
						</Tooltip.Content>
					</Tooltip.Positioner>
				</Tooltip.Root>

				<Divider orientation="vertical" h={6} />

				{/* Import Button */}
				<TooltipButton
					tooltip="Import EasyWorship Songs"
					onClick={openImportDialog}
					variant="ghost"
				>
					<TbArrowsRightDown size={16} />
					<Text fontSize="sm">Import</Text>
				</TooltipButton>
			</HStack>

			{/* Right Section: Display Controls */}
			<HStack gap={2}>
				{/* Logo Toggle */}
				<TooltipButton
					tooltip={appStore.showLogo ? "Hide Logo" : "Show Logo"}
					shortcut="L"
					onClick={() => toggleLogo(setAppStore)}
					colorPalette={appStore.showLogo ? "purple" : "gray"}
					variant={appStore.showLogo ? "solid" : "outline"}
				>
					<TiSortNumerically size={18} />
					<Text fontSize="sm">Logo</Text>
				</TooltipButton>

				{/* Clear Display Toggle */}
				<TooltipButton
					tooltip={appStore.hideLive ? "Show Display" : "Clear Display"}
					shortcut="C"
					onClick={() => toggleClearDisplay(setAppStore)}
					colorPalette={appStore.hideLive ? "red" : "gray"}
					variant={appStore.hideLive ? "solid" : "outline"}
				>
					<TbClearAll size={18} />
					<Text fontSize="sm">Clear</Text>
				</TooltipButton>

				<Divider orientation="vertical" h={6} />

				{/* Go Live Button */}
				<Button
					size="sm"
					colorPalette={appStore.isLive ? "red" : "green"}
					variant="solid"
					onClick={handleLiveToggle}
					px={4}
					fontWeight="semibold"
				>
					<Show when={appStore.isLive} fallback={<TbScreenShare size={18} />}>
						<TbScreenShareOff size={18} />
					</Show>
					<Text fontSize="sm">{appStore.isLive ? "End Live" : "Go Live"}</Text>
				</Button>
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
