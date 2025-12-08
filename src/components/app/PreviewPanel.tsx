import { Box, HStack, Stack, VStack } from "styled-system/jsx";
import { Text } from "../ui/text";
import { Menu } from "../ui/menu";
import { Dynamic, Portal, Show } from "solid-js/web";
import {
	TbChevronDown,
	TbChevronRight,
	TbEye,
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
import {
	PREVIEW_INDEX_WIDTH,
	PREVIEW_PANEL_FOCUS_NAME,
	LIVE_PANEL_FOCUS_NAME,
} from "~/utils/constants";
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

export default function PreviewPanel() {
	const { appStore, setAppStore } = useAppContext();
	const previewData = createMemo(() => appStore.previewItem?.data ?? []);
	const itemType = createMemo(() => appStore.previewItem?.type);

	const pushToLive = (focusId?: number | null) => {
		// const focusId = itemIndex;
		if (typeof focusId !== "number") return; // || !isCurrentPanel()
		setAppStore("liveItem", { ...appStore.previewItem, index: focusId });
	};

	const { subscribeEvent, changeFocusPanel, currentPanel } = useFocusContext();
	const { name, coreFocusId, fluidFocusId, changeFocus } = subscribeEvent({
		name: PREVIEW_PANEL_FOCUS_NAME,
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
					previewData().length - 1,
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
				pushToLive(fluidFocusId);
				changeFocusPanel(LIVE_PANEL_FOCUS_NAME);
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
					changeFocusPanel(LIVE_PANEL_FOCUS_NAME);
				}
			},
		},
	});

	createEffect(() => {
		if (previewData()) {
			console.log(
				"Changing Focus due to previewData & previewIndex changing: ",
				previewData(),
				appStore.previewItem?.index,
			);
			changeFocus(appStore.previewItem?.index);
		}
	});

	let virtualizerParentRef!: HTMLDivElement;
	const rowVirtualizer = createMemo(() =>
		createVirtualizer({
			count: previewData().length,
			getScrollElement: () => virtualizerParentRef,
			estimateSize: () => 20,
			overscan: 5,
		}),
	);

	createEffect(() => {
		const id = fluidFocusId();
		console.log("Fluid Focus is CHanged: ", fluidFocusId(), previewData());
		if (id && id < previewData().length) {
			rowVirtualizer().scrollToIndex(fluidFocusId() ?? 0);
		}
	});

	return (
		<Stack pos="relative" h="full" pt={8} pb="1" gap={0}>
			{/* Content area with virtualizer */}
			<Box flex={1} overflow="hidden" pos="relative">
				<Box
					visibility={
						["image", "video"].includes(appStore.previewItem?.type ?? "")
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
					when={previewData().length}
					fallback={
						<VStack gap={3} h="full" justify="center" px={6}>
							<Box color="gray.600">
								<TbEye size={40} />
							</Box>
							<VStack gap={1}>
								<Text fontSize="14px" fontWeight="medium" color="gray.300">
									No item selected
								</Text>
								<Text fontSize="12px" color="gray.500" textAlign="center">
									Select an item from the schedule to preview
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
									const item = previewData()[virtualItem.index];
									return (
										<div
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
										</div>
									);
								}}
							</For>
						</Box>
					</Box>
				</Show>
			</ContextMenu>
			</Box>

			{/* Mini Display at bottom */}
			<Box px={2} py={1.5} flexShrink={0} bg="gray.900" borderTop="1px solid" borderTopColor="gray.800">
				<Box maxW="200px" mx="auto">
					<MiniDisplay
						mode="preview"
						displayItem={appStore.previewItem}
						displayIndex={fluidFocusId() ?? 0}
					/>
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
					<TbEye size={14} color="var(--colors-blue-400)" />
					<Text fontSize="12px" fontWeight="medium" color="gray.300">
						Preview
					</Text>
					<Show when={appStore.previewItem}>
						<HStack gap={1.5} flex={1} overflow="hidden">
							<Text fontSize="11px" color="gray.500">
								—
							</Text>
							<Box color="gray.500" flexShrink={0}>
								<Dynamic
									component={
										typeIcons[itemType() as keyof typeof typeIcons] || TbEye
									}
									size={12}
								/>
							</Box>
							<Text
								fontSize="11px"
								color="gray.400"
								truncate
								title={appStore.previewItem?.metadata?.title}
							>
								{appStore.previewItem?.metadata?.title}
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
