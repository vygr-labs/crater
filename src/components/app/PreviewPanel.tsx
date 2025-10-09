import { Box, HStack, Stack } from "styled-system/jsx";
import { Text } from "../ui/text";
import { Menu } from "../ui/menu";
import { Portal } from "solid-js/web";
import { TbChevronDown, TbChevronRight, TbLayoutGrid } from "solid-icons/tb";
import { useAppContext } from "~/layouts/AppContext";
import { PREVIEW_INDEX_WIDTH, PREVIEW_PANEL_FOCUS_NAME } from "~/utils/constants";
import { useFocusContext } from "~/layouts/FocusContext";
import { createEffect, createMemo, For, Match, Switch } from "solid-js";
import { createVirtualizer } from "@tanstack/solid-virtual";
import ContextMenu from "./ContextMenu";
import LyricDisplay from "./song/LyricDisplay";
import type { SongLyric } from "~/types/context";

export default function PreviewPanel() {
    const { appStore, setAppStore } = useAppContext();
    const previewData = createMemo(() => appStore.previewItem?.data ?? [])
    const itemType = createMemo(() => appStore.previewItem?.type);

    const { subscribeEvent, changeFocusPanel, currentPanel } = useFocusContext();
    const { name, coreFocusId, fluidFocusId } = subscribeEvent({
        name: PREVIEW_PANEL_FOCUS_NAME,
        defaultCoreFocus: 0,
        defaultFluidFocus: 0,
        handlers: {
            "ArrowDown": ({ coreFocusId, fluidFocusId, changeFocus, changeCoreFocus, changeFluidFocus }) => {
                const newCoreFocusId = Math.min((fluidFocusId ?? 0) + 1, previewData().length);
                changeFluidFocus(newCoreFocusId);
            },
            "ArrowUp": ({ coreFocusId, fluidFocusId, changeFocus, changeCoreFocus, changeFluidFocus }) => {
                const newCoreFocusId = Math.max((fluidFocusId ?? 0) - 1, 0);
                changeFluidFocus(newCoreFocusId);
            },
            "Enter": ({ coreFocusId, fluidFocusId, changeFocus, changeCoreFocus, changeFluidFocus }) => {
                changeFocus(fluidFocusId);
            }
        },
        clickHandlers: {
            onClick: ({ changeFluidFocus, focusId, event }) => {
                console.log(event.target, focusId)
                if (typeof focusId === "number") {
                    changeFluidFocus(focusId)
                }
            },
            onDblClick: ({ changeFocus, focusId }) => {
                if (typeof focusId === "number") {
                    changeFocus(focusId)
                }
            }
        }
    })

    let virtualizerParentRef!: HTMLDivElement
    const rowVirtualizer = createMemo(() => createVirtualizer({
        count: previewData().length,
        getScrollElement: () => virtualizerParentRef,
        estimateSize: () => 20,
        overscan: 5,
    }))

    createEffect(() => {
        console.log("Fluid Focus is CHanged: ", fluidFocusId())
        rowVirtualizer().scrollToIndex(fluidFocusId() ?? 0)
    })

    return (
        <Stack pos="relative" h="full" pt={7} pb="1" gap={2} ref={virtualizerParentRef}>
            <Box
                visibility={
                    ['image', 'video'].includes(appStore.previewItem?.type ?? "") ? 'hidden' : 'visible'
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
            <ContextMenu open={false} ref={virtualizerParentRef}>
                <Box style={{
                    height: `${rowVirtualizer().getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}>
                        <Box pos="absolute"
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
                        {virtualItem => {
                            const item = previewData()[virtualItem.index]
                            return (
                                <Box data-index={virtualItem.index} ref={rowVirtualizer().measureElement}>
                                    <Switch>
                                        <Match when={itemType() === "song"}>
                                            <LyricDisplay index={virtualItem.index} lyric={item as SongLyric} isFocusItem={fluidFocusId() === virtualItem.index} panelName={name} isCurrentPanel={currentPanel() === name} />
                                        </Match>
                                        <Match when={true}>
                                            No display for this, yet;
                                        </Match>
                                    </Switch>
                                </Box>
                                // <HStack
                                //     // class={focusStyles(getFocusVariant(name, virtualItem.index, coreFocusId(), fluidFocusId()))}
                                //     pos="absolute"
                                //     top={0}
                                //     left={0}
                                //     w="full"
                                //     textAlign="left"
                                //     userSelect="none"
                                //     fontSize="14px"
                                //     pl={2}
                                //     cursor="pointer"
                                //     py={1.5}
                                //     css={{
                                    //         "& *": {
                                        //             pointerEvents: "none",
                                        //         },
                                        //         _hover: {
                                            //             bgColor: "purple.800/40"
                                            //         }
                                            //     }
                                            //     }
                                            //     style={{
                                                //         height: `${virtualItem.size}px`,
                                                //         transform: `translateY(${virtualItem.start}px)`,
                                                //         "background-color": virtualItem.index === fluidFocusId() ? token.var(`colors.${defaultPalette}.900`) : virtualItem.index === coreFocusId() ? token.var(`colors.gray.800`) : "",
                                                //         color: virtualItem.index === fluidFocusId() ? token.var(`colors.white`) : token.var(`colors.gray.100`),
                                                //     }}
                                                //     data-panel={PREVIEW_PANEL_FOCUS_NAME}
                                                //     data-focusId={virtualItem.index}
                                                // >
                                                //     <Text>{song.title}</Text>
                                                //     <Text>{song.author}</Text>
                                                //     <Text>{song.copyright}</Text>
                                                // </HStack>
                                            )
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
                h={6}
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
                    Preview {appStore.previewItem ? `- ${appStore.previewItem.metadata?.title}` : null}
                </Text>
                <HStack>
                    <Menu.Root>
                        <Menu.Trigger asChild={triggerProps => (
                            <HStack width={10} gap={1} h={6} px={2} py={0.5} cursor="pointer" {...triggerProps()}>
                                <TbLayoutGrid size={22} />
                                <TbChevronDown size={15} />
                            </HStack>
                        )}>
                        </Menu.Trigger>
                        <Portal>
                            <Menu.Positioner>
                                <Menu.Content>
                                    <Menu.ItemGroup>
                                        <Menu.Root
                                            positioning={{ placement: 'right-start', gutter: 2 }}
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
    )
}