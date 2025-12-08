import { Box, HStack, Stack, VStack } from "styled-system/jsx";
import { Text } from "../ui/text";
import { Menu } from "../ui/menu";
import { Dynamic, Portal, Show } from "solid-js/web";
import {
	TbChevronDown,
	TbChevronRight,
	TbBroadcast,
	TbMusic,
	TbBook2,
	TbPhoto,
	TbVideo,
	TbSortAscending,
	TbRefresh,
	TbSettings,
	TbLanguageHiragana,
} from "solid-icons/tb";
import { CgDisplayGrid } from "solid-icons/cg";
import { useAppContext } from "~/layouts/AppContext";
import { PREVIEW_INDEX_WIDTH, LIVE_PANEL_FOCUS_NAME } from "~/utils/constants";
import { useFocusContext } from "~/layouts/FocusContext";
import { createEffect, createMemo, For, Match, Switch } from "solid-js";
import { createVirtualizer } from "@tanstack/solid-virtual";
import ContextMenu from "./ContextMenu";
import ItemDisplay from "./ItemDisplay";
import MiniDisplay from "./MiniDisplay";

// Type to icon mapping
const typeIcons = {
	song: TbMusic,
	scripture: TbBook2,
	image: TbPhoto,
	video: TbVideo,
	strongs: TbLanguageHiragana,
};

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

	const hasLiveItem = createMemo(() => liveData().length > 0);

	return (
		<Stack pos="relative" h="full" pt={8} pb="1" gap={0}>
			{/* Content area with virtualizer */}
			<Box flex={1} overflow="hidden" pos="relative">
				<Box
					visibility={
						["image", "video"].includes(appStore.liveItem?.type ?? "")
							? "hidden"
							: "visible"
					}
					w={PREVIEW_INDEX_WIDTH}
					h="full"
					bgColor="gray.900/50"
					textAlign="center"
					position="absolute"
					left={0}
					top={0}
					bottom={0}
					zIndex={0}
				/>
			<ContextMenu open={false} setOpen={() => null} ref={virtualizerParentRef}>
				<Show
					when={liveData().length}
					fallback={
						<VStack gap={3} h="full" justify="center" px={6}>
							<Box color="gray.600">
								<TbBroadcast size={40} />
							</Box>
							<VStack gap={1}>
								<Text fontSize="14px" fontWeight="medium" color="gray.300">
									Nothing live
								</Text>
								<Text fontSize="12px" color="gray.500" textAlign="center">
									Double-click a preview item to go live
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
									const item = liveData()[virtualItem.index];
									return (
										<Box
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
				</Show>
			</ContextMenu>
			</Box>

			{/* Mini Display at bottom - shows actual live output */}
			<Box px={2} py={1.5} flexShrink={0} bg="gray.900" borderTop="1px solid" borderTopColor="gray.800">
				<Box maxW="200px" mx="auto">
					<MiniDisplay mode="live" />
				</Box>
			</Box>

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
				<HStack gap={2} ml={3} flex={1} overflow="hidden">
					{/* Live indicator */}
					<HStack
						gap={1.5}
						bg={hasLiveItem() ? "red.900/50" : "gray.800"}
						px={1.5}
						py={0.5}
						borderRadius="sm"
						border="1px solid"
						borderColor={hasLiveItem() ? "red.700/50" : "gray.700"}
					>
						<Box
							w={1.5}
							h={1.5}
							borderRadius="full"
							bg={hasLiveItem() ? "red.500" : "gray.500"}
							style={{
								animation: hasLiveItem() ? "pulse 2s infinite" : "none",
							}}
						/>
						<Text
							fontSize="10px"
							fontWeight="bold"
							color={hasLiveItem() ? "red.300" : "gray.500"}
							textTransform="uppercase"
							letterSpacing="wider"
						>
							Live
						</Text>
					</HStack>
					<Show when={appStore.liveItem}>
						<HStack gap={1.5} flex={1} overflow="hidden">
							<Text fontSize="11px" color="gray.500">
								—
							</Text>
							<Box color="gray.500" flexShrink={0}>
								<Dynamic
									component={
										typeIcons[itemType() as keyof typeof typeIcons] ||
										TbBroadcast
									}
									size={12}
								/>
							</Box>
							<Text
								fontSize="11px"
								color="gray.400"
								truncate
								title={appStore.liveItem?.metadata?.title}
							>
								{appStore.liveItem?.metadata?.title}
							</Text>
						</HStack>
					</Show>
				</HStack>
				<HStack flexShrink={0}>
					<Menu.Root>
						<Menu.Trigger
							asChild={(triggerProps) => (
								<HStack
									gap={0.5}
									h={6}
									px={2}
									py={0.5}
									cursor="pointer"
									borderRadius="sm"
									_hover={{ bg: "gray.800" }}
									transition="background 0.15s"
									{...triggerProps()}
								>
									<TbSettings size={14} />
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
												<HStack gap={2}>
													<TbSortAscending size={14} />
													Sort by
												</HStack>
												<TbChevronRight />
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
										<Menu.Item value="refresh">
											<HStack gap={2}>
												<TbRefresh size={14} />
												Refresh
											</HStack>
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
