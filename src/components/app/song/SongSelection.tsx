import { Box, Flex, HStack } from "styled-system/jsx";
import SelectionGroups from "../SelectionGroups";
import { createStore, produce } from "solid-js/store";
import { Menu } from "../../ui/menu";
import { For, Portal } from "solid-js/web";
import { TbChevronDown, TbChevronRight, TbPlus, TbSettings } from "solid-icons/tb";
import { IconButton } from "../../ui/icon-button";
import { InputGroup } from "../../ui/input-group";
import { ImPlus } from "solid-icons/im";
import { FiSettings } from "solid-icons/fi";
import ControlTabDisplay from "../ControlTabDisplay";
import type { SongData } from "~/types/context";
import { createEffect, createMemo, createRenderEffect, on } from "solid-js";
import { Text } from "../../ui/text";
import { createVirtualizer } from "@tanstack/solid-virtual";
import { useAppContext } from "~/layouts/AppContext";
import { useFocusContext } from "~/layouts/FocusContext";
import { defaultPalette, SONGS_TAB_FOCUS_NAME } from "~/utils/constants";
import { focusStyles } from "~/utils/atomic-recipes";
import { getFocusVariant } from "~/utils";
import { css } from "styled-system/css";
import { token } from "styled-system/tokens";
import { createAsyncMemo } from "solidjs-use";
import type { PanelCollection } from "~/types/app-context";
import SongSelectionGroupMenus from "./SelectionGroupMenus";
import { MainActionBarMenu, MainDisplayMenuContent } from "./MainPanelMenus";

type SongPanelGroupValues = 'all' | 'collections' | 'favorites'
type SongListData = {
    title: string
    value: SongPanelGroupValues
}
type SongControlsData = {
    searchMode: "search" | "title";
    group: string;
    collection: number | null;
    query: string;
    contextMenuOpen: boolean;
}

export default function SongSelection() {
    const { appStore, setAppStore } = useAppContext();
    const allSongs = createAsyncMemo(async () => {
        const updated = appStore.songsUpdateCounter
        return await window.electronAPI.fetchAllSongs();
    }, [])
    const [songControls, setSongControls] = createStore<SongControlsData>({
        group: "all",
        collection: null,
        searchMode: "title",
        query: "",
        contextMenuOpen: false
    })
    const currentGroup = createMemo(() => appStore.displayGroups.song[songControls.group])
    const currentCollection = createMemo(() => currentGroup().subGroups?.find(group => group.id === songControls.collection))
    const applyQueryFilter = (songs: SongData[]) => songs.filter(song => song.title.includes(songControls.query))
    const filteredSongs = createMemo<SongData[]>(() => { 
        const songCollection = currentCollection()
        if (currentGroup().subGroups && songCollection) {
            return applyQueryFilter(allSongs().filter(song => songCollection.items.includes(song.id)))
        } else {
            return applyQueryFilter(allSongs())
        }
    });

    let virtualizerParentRef!: HTMLDivElement
    const rowVirtualizer = createMemo(() => createVirtualizer({
        count: filteredSongs().length,
        getScrollElement: () => virtualizerParentRef,
        estimateSize: () => 36,
        overscan: 5,
    }))

    const { subscribeEvent, changeFocusPanel } = useFocusContext();
    const { name, coreFocusId, fluidFocusId } = subscribeEvent({
        name: SONGS_TAB_FOCUS_NAME,
        defaultCoreFocus: 0,
        defaultFluidFocus: 0,
        handlers: {
            "ArrowDown": ({ coreFocusId, fluidFocusId, changeFocus, changeCoreFocus, changeFluidFocus }) => {
                const newCoreFocusId = Math.min((fluidFocusId ?? 0) + 1, filteredSongs().length);
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
            onClick: ({ changeFluidFocus, focusId }) => {
                if (typeof focusId === "number") {
                    changeFluidFocus(focusId)
                    setSongControls("contextMenuOpen", false)
                }
            },
            onDblClick: ({ changeFocus, focusId }) => {
                if (typeof focusId === "number") {
                    changeFocus(focusId)
                }
            },
            onRightClick: ({ changeFluidFocus, focusId }) => {
                if (typeof focusId === "number") {
                    changeFluidFocus(focusId);
                    setSongControls("contextMenuOpen", true)
                }
            }
        }
    })

    function handleGroupAccordionChange(open: (SongPanelGroupValues | string)[], e?: MouseEvent) {
        if (!open.length) return;
        setSongControls(produce(store => {
            const subSelection = open.find(item => item.includes('-'))
           
            if (subSelection) {
                const [group, collection] = subSelection.split('-');
                store.group = group
                store.collection = parseInt(collection)
            } else {
                store.group = open[0]
                store.collection = null
            }
        }))
    }

    createEffect(() => {
        rowVirtualizer().scrollToIndex(fluidFocusId() ?? 0);
    })

    createEffect(() => {
        const fluidFocus = fluidFocusId();
        if (songControls.contextMenuOpen && fluidFocus) {
            if (!rowVirtualizer().getVirtualItems().map(item => item.index).includes(fluidFocus)) {
                setSongControls("contextMenuOpen", false);
            }
        }
    })

    createEffect(() => {
        const previewFocusId = fluidFocusId()
        if (typeof previewFocusId !== "number" || !filteredSongs().length) return;

        const metadata = filteredSongs()[previewFocusId]
        window.electronAPI.fetchSongLyrics(metadata.id).then(songData => {
            setAppStore("previewItem", {
                metadata,
                type: "song",
                data: songData,
                index: 0,
            })
        });
    })

    const handleSongEdit = () => {
        const toEdit = fluidFocusId();
        if (toEdit) {
            setAppStore("songEdit", { open: true, song: filteredSongs()[toEdit] });
        }
    }

    return (
        <Flex h="full" pos="relative">
            <SelectionGroups currentGroup={[songControls.group]} groups={appStore.displayGroups.song} handleAccordionChange={handleGroupAccordionChange} actionMenus={<SongSelectionGroupMenus />} />
            <ControlTabDisplay open={songControls.contextMenuOpen} contextMenuContent={<MainDisplayMenuContent onSongEdit={handleSongEdit} />} actionBarMenu={<MainActionBarMenu />} ref={virtualizerParentRef}>
                <Box style={{
                    height: `${rowVirtualizer().getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}>
                    <For each={rowVirtualizer().getVirtualItems()}>
                        {virtualItem => {
                            const song = filteredSongs()[virtualItem.index]
                            return (
                                <HStack
                                    pos="absolute"
                                    top={0}
                                    left={0}
                                    w="full"
                                    textAlign="left"
                                    userSelect="none"
                                    fontSize="14px"
                                    pl={2}
                                    cursor="pointer"
                                    py={1.5}
                                    css={{
                                        "& *": {
                                            pointerEvents: "none",
                                        },
                                        _hover: {
                                            bgColor: "purple.800/40"
                                        }
                                    }
                                    }
                                    style={{
                                        height: `${virtualItem.size}px`,
                                        transform: `translateY(${virtualItem.start}px)`,
                                        "background-color": virtualItem.index === fluidFocusId() ? token.var(`colors.${defaultPalette}.900`) : virtualItem.index === coreFocusId() ? token.var(`colors.gray.800`) : "",
                                        color: virtualItem.index === fluidFocusId() ? token.var(`colors.white`) : token.var(`colors.gray.100`),
                                    }}
                                    data-panel={SONGS_TAB_FOCUS_NAME}
                                    data-focusId={virtualItem.index}
                                >
                                    <Text>{song.title}</Text>
                                    <Text>{song.author}</Text>
                                    <Text>{song.copyright}</Text>
                                </HStack>
                            )
                        }}
                    </For>
                </Box>
            </ControlTabDisplay>
        </Flex>
    )
}
