import { Box, HStack, Stack, VStack } from "styled-system/jsx";
import { Text } from "../ui/text";
import { Menu } from "../ui/menu";
import { Portal } from "solid-js/web";
import {
	TbBook2,
	TbChevronDown,
	TbChevronRight,
	TbGripVertical,
	TbList,
	TbMusic,
	TbPhoto,
	TbPlayerPlay,
	TbPlaylist,
	TbPresentation,
	TbVideo,
} from "solid-icons/tb";
import { CgDisplayGrid } from "solid-icons/cg";
import { useAppContext } from "~/layouts/AppContext";
import {
	PREVIEW_INDEX_WIDTH,
	SCHEDULE_PANEL_FOCUS_NAME,
} from "~/utils/constants";
import { useFocusContext } from "~/layouts/FocusContext";
import { createEffect, createMemo, For, Match, Show, Switch } from "solid-js";
import { createVirtualizer } from "@tanstack/solid-virtual";
import ContextMenu from "./ContextMenu";
import ItemDisplay from "./ItemDisplay";
import ScheduleItem from "./ScheduleItem";
import type { Theme } from "~/types";

// Icon map for different item types
const typeIcons: Record<string, typeof TbMusic> = {
	song: TbMusic,
	scripture: TbBook2,
	presentation: TbPresentation,
	video: TbVideo,
	image: TbPhoto,
	message: TbList,
};

export default function SchedulePanel() {
	const { appStore, setAppStore } = useAppContext();
	const scheduleItems = createMemo(() => {
		console.log("Updating schedule items: ", appStore.scheduleItems);
		return appStore.scheduleItems;
	});
	const themeMap = createMemo<Record<string, Theme | null | undefined>>(() => ({
		song: appStore.displayData.songTheme,
		scripture: appStore.displayData.scriptureTheme,
		presentation: appStore.displayData.presentationTheme,
		video: null,
		image: null,
		message: null,
	}));

	const pushToLive = (focusId?: number | null, live?: boolean) => {
		// const focusId = itemIndex;
		if (typeof focusId !== "number") return; // || !isCurrentPanel()
		setAppStore(live ? "liveItem" : "previewItem", {
			...appStore.scheduleItems[focusId],
			index: 0,
		});
	};

	const { subscribeEvent, changeFocusPanel, currentPanel } = useFocusContext();
	const { name, coreFocusId, fluidFocusId, changeFocus } = subscribeEvent({
		name: SCHEDULE_PANEL_FOCUS_NAME,
		defaultCoreFocus: 0,
		defaultFluidFocus: 0,
		handlers: {
			ArrowDown: ({
				coreFocusId,
				fluidFocusId,
				changeFocus,
				changeCoreFocus,
				changeFluidFocus,
			}) => {
				const newCoreFocusId = Math.min(
					(fluidFocusId ?? 0) + 1,
					scheduleItems().length - 1,
				);
				changeFluidFocus(newCoreFocusId);
			},
			ArrowUp: ({
				coreFocusId,
				fluidFocusId,
				changeFocus,
				changeCoreFocus,
				changeFluidFocus,
			}) => {
				const newCoreFocusId = Math.max((fluidFocusId ?? 0) - 1, 0);
				changeFluidFocus(newCoreFocusId);
			},
			Enter: ({
				coreFocusId,
				fluidFocusId,
				changeFocus,
				changeCoreFocus,
				changeFluidFocus,
			}) => {
				changeFocus(fluidFocusId);
			},
		},
		clickHandlers: {
			onClick: ({ changeFluidFocus, focusId, event }) => {
				if (typeof focusId === "number") {
					changeFluidFocus(focusId);
					pushToLive(focusId, false);
				}
			},
			onDblClick: ({ changeFocus, focusId }) => {
				if (typeof focusId === "number") {
					changeFocus(focusId);
					pushToLive(focusId, true);
				}
			},
		},
	});

	// createEffect(() => {
	//     if (scheduleItems()) {
	//         changeFocus(appStore.scheduleItems?.index)
	//     }
	// })

	let virtualizerParentRef!: HTMLDivElement;
	const rowVirtualizer = createMemo(() =>
		createVirtualizer({
			count: scheduleItems().length,
			getScrollElement: () => virtualizerParentRef,
			estimateSize: () => 20,
			overscan: 5,
		}),
	);

	createEffect(() => {
		console.log("Fluid Focus is CHanged: ", fluidFocusId());
		rowVirtualizer().scrollToIndex(fluidFocusId() ?? 0);
	});

	return (
		<Stack pos="relative" h="full" pt={8} pb="1" gap={0}>
			<ContextMenu open={false} setOpen={() => null} ref={virtualizerParentRef}>
				<Show
					when={scheduleItems().length}
					fallback={
						<VStack gap={3} h="full" justify="center" px={6}>
							<Box color="gray.600">
								<TbPlaylist size={40} />
							</Box>
							<VStack gap={1}>
								<Text fontSize="14px" fontWeight="medium" color="gray.300">
									No items in schedule
								</Text>
								<Text fontSize="12px" color="gray.500" textAlign="center">
									Add songs, scriptures, or media from the tabs below
								</Text>
							</VStack>
						</VStack>
					}
				>
					<Box
						style={{
							height: `${rowVirtualizer().getTotalSize()}px`,
							width: "100%",
							position: "relative",
						}}
					>
						<Box
							pos="absolute"
							top={0}
							left={0}
							w="full"
							style={{
								transform: `translateY(${rowVirtualizer().getVirtualItems()[0]?.start ?? 0}px)`,
							}}
						>
							<For each={rowVirtualizer().getVirtualItems()}>
								{(virtualItem) => {
									const item = scheduleItems()[virtualItem.index];
									const TypeIcon = typeIcons[item.type] || TbList;
									return (
										<ScheduleItem
											index={virtualItem.index}
											item={item}
											isFocusItem={fluidFocusId() === virtualItem.index}
											panelName={name}
											isCurrentPanel={currentPanel() === name}
											theme={themeMap()[item.type]}
											icon={TypeIcon}
										/>
									);
								}}
							</For>
						</Box>
					</Box>
				</Show>
			</ContextMenu>

			{/* Header */}
			<HStack
				justifyContent="space-between"
				gap={0}
				position="absolute"
				top={0}
				w="full"
				h={8}
				bg="gray.900"
				borderBottom="1px solid"
				borderBottomColor="gray.800"
				color="gray.300"
			>
				<HStack gap={2} ml={3}>
					<TbPlaylist size={14} color="var(--colors-gray-500)" />
					<Text fontSize="12px" fontWeight="medium" color="gray.300">
						Schedule
					</Text>
					<Show when={scheduleItems().length}>
						<Text fontSize="11px" color="gray.500">
							({scheduleItems().length})
						</Text>
					</Show>
				</HStack>
				<HStack>
					<Menu.Root>
						<Menu.Trigger
							asChild={(triggerProps) => (
								<HStack
									gap={0.5}
									h={6}
									px={2}
									py={0.5}
									cursor="pointer"
									color="gray.400"
									_hover={{ color: "white", bg: "gray.700" }}
									rounded="sm"
									mr={1}
									transition="all 0.15s ease"
									{...triggerProps()}
								>
									<CgDisplayGrid size={15} />
									<TbChevronDown size={10} />
								</HStack>
							)}
						></Menu.Trigger>
						<Portal>
							<Menu.Positioner>
								<Menu.Content minW="160px">
									<Menu.ItemGroup>
										<Menu.Root
											positioning={{ placement: "right-start", gutter: 2 }}
										>
											<Menu.TriggerItem w="full" justifyContent="space-between">
												<span>Sort by</span>
												<TbChevronRight size={14} />
											</Menu.TriggerItem>
											<Portal>
												<Menu.Positioner>
													<Menu.Content minW="120px">
														<Menu.ItemGroup>
															<Menu.Item value="name">Name</Menu.Item>
															<Menu.Item value="date-added">
																Date Added
															</Menu.Item>
															<Menu.Item value="type">Type</Menu.Item>
														</Menu.ItemGroup>
														<Menu.Separator />
														<Menu.ItemGroup>
															<Menu.Item value="ascending">Ascending</Menu.Item>
															<Menu.Item value="descending">
																Descending
															</Menu.Item>
														</Menu.ItemGroup>
													</Menu.Content>
												</Menu.Positioner>
											</Portal>
										</Menu.Root>
										<Menu.Item value="clear-all" color="fg.error">
											Clear Schedule
										</Menu.Item>
									</Menu.ItemGroup>
								</Menu.Content>
							</Menu.Positioner>
						</Portal>
					</Menu.Root>
				</HStack>
			</HStack>
		</Stack>
	);
}
