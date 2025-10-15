import { Box, HStack, Stack } from "styled-system/jsx";
import { Text } from "../ui/text";
import { Menu } from "../ui/menu";
import { Portal } from "solid-js/web";
import { TbChevronDown, TbChevronRight } from "solid-icons/tb";
import { CgDisplayGrid } from "solid-icons/cg";
import { useAppContext } from "~/layouts/AppContext";
import {
	PREVIEW_INDEX_WIDTH,
	SCHEDULE_PANEL_FOCUS_NAME,
} from "~/utils/constants";
import { useFocusContext } from "~/layouts/FocusContext";
import { createEffect, createMemo, For, Match, Switch } from "solid-js";
import { createVirtualizer } from "@tanstack/solid-virtual";
import ContextMenu from "./ContextMenu";
import ItemDisplay from "./ItemDisplay";
import ScheduleItem from "./ScheduleItem";

export default function SchedulePanel() {
	const { appStore, setAppStore } = useAppContext();
	const scheduleItems = createMemo(() => {
		console.log("Updating schedule items: ", appStore.scheduleItems);
		return appStore.scheduleItems;
	});

	const pushToLive = (focusId?: number | null) => {
		// const focusId = itemIndex;
		if (typeof focusId !== "number") return; // || !isCurrentPanel()
		setAppStore("liveItem", {
			...appStore.scheduleItems[focusId],
			index: focusId,
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
				}
			},
			onDblClick: ({ changeFocus, focusId }) => {
				if (typeof focusId === "number") {
					changeFocus(focusId);
					pushToLive(focusId);
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
		<Stack
			pos="relative"
			h="full"
			pt={7}
			pb="1"
			gap={2}
			ref={virtualizerParentRef}
		>
			<ContextMenu open={false} ref={virtualizerParentRef}>
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
							// "background-color": virtualItem.index === fluidFocusId() ? token.var(`colors.${defaultPalette}.900`) : virtualItem.index === coreFocusId() ? token.var(`colors.gray.800`) : "",
							// color: virtualItem.index === fluidFocusId() ? token.var(`colors.white`) : token.var(`colors.gray.100`),
						}}
					>
						<For each={rowVirtualizer().getVirtualItems()}>
							{(virtualItem) => {
								const item = scheduleItems()[virtualItem.index];
								return (
									<ScheduleItem
										index={virtualItem.index}
										item={item}
										isFocusItem={fluidFocusId() === virtualItem.index}
										panelName={name}
										isCurrentPanel={currentPanel() === name}
									/>
									// <Box data-index={virtualItem.index} ref={rowVirtualizer().measureElement}>
									//     <ItemDisplay type={itemType()} index={virtualItem.index} item={item} isFocusItem={fluidFocusId() === virtualItem.index} panelName={name} isCurrentPanel={currentPanel() === name} />
									// </Box>
								);
							}}
						</For>
					</Box>
				</Box>
			</ContextMenu>

			<HStack
				justifyContent="space-between"
				gap={0}
				position="absolute"
				top={0}
				w="full"
				h={PREVIEW_INDEX_WIDTH}
				bg="gray.800"
				color="gray.300"
			>
				<Text
					fontSize="13px"
					ml={3}
					overflow="hidden"
					textOverflow="ellipsis"
					whiteSpace="nowrap"
				>
					Projection Schedule
				</Text>
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
									{...triggerProps()}
								>
									<CgDisplayGrid size={17} />
									<TbChevronDown size={10} />
								</HStack>
							)}
						></Menu.Trigger>
						<Portal>
							<Menu.Positioner>
								<Menu.Content>
									<Menu.ItemGroup>
										<Menu.Root
											positioning={{ placement: "right-start", gutter: 2 }}
										>
											<Menu.TriggerItem w="full" justifyContent="space-between">
												Sort by <TbChevronRight />
											</Menu.TriggerItem>
											<Portal>
												<Menu.Positioner>
													<Menu.Content>
														<Menu.ItemGroup>
															<Menu.Item value="name">Name</Menu.Item>
															<Menu.Item value="date-added">
																Date Added
															</Menu.Item>
															<Menu.Item value="last-used">Last Used</Menu.Item>
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
										<Menu.Item value="refresh">Refresh</Menu.Item>
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
