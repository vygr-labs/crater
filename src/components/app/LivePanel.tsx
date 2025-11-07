import { Box, HStack, Stack } from "styled-system/jsx";
import { Text } from "../ui/text";
import { Menu } from "../ui/menu";
import { Portal } from "solid-js/web";
import { TbChevronDown, TbChevronRight } from "solid-icons/tb";
import { CgDisplayGrid } from "solid-icons/cg";
import { useAppContext } from "~/layouts/AppContext";
import { PREVIEW_INDEX_WIDTH, LIVE_PANEL_FOCUS_NAME } from "~/utils/constants";
import { useFocusContext } from "~/layouts/FocusContext";
import { createEffect, createMemo, For, Match, Switch } from "solid-js";
import { createVirtualizer } from "@tanstack/solid-virtual";
import ContextMenu from "./ContextMenu";
import ItemDisplay from "./ItemDisplay";

export default function LivePanel() {
	const { appStore, setAppStore } = useAppContext();
	const liveData = createMemo(() => appStore.liveItem?.data ?? []);
	const itemType = createMemo(() => appStore.liveItem?.type);

	const displayLiveItem = (index?: number | null) => {
		const type = itemType();
		if (appStore.liveItem && type && typeof index === "number") {
			setAppStore("displayData", "displayContent", {
				type,
				[type]: liveData()[index],
			});
		}
	};

	const { subscribeEvent, changeFocusPanel, currentPanel } = useFocusContext();
	const { name, coreFocusId, fluidFocusId, changeFocus } = subscribeEvent({
		name: LIVE_PANEL_FOCUS_NAME,
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
					liveData().length - 1,
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
				}
			},
		},
	});

	createEffect(() => {
		if (liveData()) {
			changeFocus(appStore.liveItem?.index);
		}
	});

	let virtualizerParentRef!: HTMLDivElement;
	const rowVirtualizer = createMemo(() =>
		createVirtualizer({
			count: liveData().length,
			getScrollElement: () => virtualizerParentRef,
			estimateSize: () => 20,
			overscan: 5,
		}),
	);

	createEffect(() => {
		console.log("Fluid Focus is CHanged: ", fluidFocusId());
		rowVirtualizer().scrollToIndex(fluidFocusId() ?? 0);
		displayLiveItem(fluidFocusId());
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
			<Box
				visibility={
					["image", "video"].includes(appStore.liveItem?.type ?? "")
						? "hidden"
						: "visible"
				}
				w={PREVIEW_INDEX_WIDTH}
				h="full"
				bgColor="gray.800"
				pt={2}
				textAlign="center"
				position="absolute"
				left={0}
				bottom={0}
				top={0}
				zIndex={0}
			/>
			<ContextMenu open={false} setOpen={() => null} ref={virtualizerParentRef}>
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
								const item = liveData()[virtualItem.index];
								return (
									<Box
										// data-index={virtualItem.index} // this is not set by the time the ref is called
										ref={(ref) => {
											ref.dataset["index"] = virtualItem.index.toString();
											rowVirtualizer().measureElement(ref);
										}}
									>
										<ItemDisplay
											type={itemType()}
											index={virtualItem.index}
											item={item}
											isFocusItem={fluidFocusId() === virtualItem.index}
											panelName={name}
											isCurrentPanel={currentPanel() === name}
										/>
									</Box>
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
					Live{" "}
					{appStore.liveItem ? `- ${appStore.liveItem.metadata?.title}` : null}
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
