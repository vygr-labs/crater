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

type SongPanelGroupValues = 'all' | 'collections' | 'favorites'
type SongListData = {
    title: string
    value: SongPanelGroupValues
}
type SongControlsData = {
    searchMode: "search" | "title"
    group: string
    collection: number | null;
    query: string
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
        query: ""
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
                }
            },
            onDblClick: ({ changeFocus, focusId }) => {
                if (typeof focusId === "number") {
                    changeFocus(focusId)
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
        rowVirtualizer().scrollToIndex(fluidFocusId() ?? 0)
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

    return (
        <Flex h="full" pos="relative">
            <SelectionGroups currentGroup={[songControls.group]} groups={appStore.displayGroups.song} handleAccordionChange={handleGroupAccordionChange} actionMenus={<SongSelectionGroupMenus />} />
            <ControlTabDisplay contextMenuContent={<MainDisplayMenuContent />} actionBarMenu={<MainActionBarMenu />} ref={virtualizerParentRef}>
                {/* h="full" overflow="auto" */}
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
                                    // class={focusStyles(getFocusVariant(name, virtualItem.index, coreFocusId(), fluidFocusId()))}
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

// props: { handleNewGroup: (group: string) => void }
const SongSelectionGroupMenus = () => {
    const { appStore, setAppStore } = useAppContext();

    const handleNewGroup = (group: string) => {
        setAppStore("namingModal", { type: "song", open: true, group })
    }

    const availableSongGroups = () => Object.entries(appStore.displayGroups.song).filter(([id, group]) => group.subGroups !== null).map(([id]) => id)

    return <>
        <Menu.Root>
            <Menu.Trigger asChild={parentProps =>
                <HStack
                    width={10}
                    gap={1}
                    h={6}
                    px={2}
                    py={0.5}
                    pr={10}
                    mr={1}
                    cursor="pointer"
                    borderRight="2px solid"
                    borderRightColor="gray.600"
                    aria-label="Add group menu"
                    {...parentProps()}
                >
                    <ImPlus size={11} />
                    <TbChevronDown size={12} />
                </HStack>
            }>
            </Menu.Trigger>
            <Portal>
                <Menu.Positioner>
                    <Menu.Content>
                        <For each={availableSongGroups()}>
                            {
                                groupKey => (
                                    <Menu.Item
                                        value={`add-${groupKey}`}
                                        textTransform="capitalize"
                                        onClick={() => handleNewGroup(groupKey)}
                                    >
                                        New {groupKey}
                                    </Menu.Item>
                                )
                            }
                        </For>
                    </Menu.Content>
                </Menu.Positioner>
            </Portal>
        </Menu.Root>

        <Menu.Root>
            <Menu.Trigger asChild={parentProps =>
                <HStack
                    width={10}
                    gap={1}
                    h={6}
                    px={2}
                    py={0.5}
                    cursor="pointer"
                    aria-label="Collection settings"
                    {...parentProps()}
                >
                    <TbSettings size={18} />
                    <TbChevronDown size={12} />
                </HStack>
            }>
            </Menu.Trigger>
            <Portal>
                <Menu.Positioner>
                    <Menu.Content>
                        <Menu.ItemGroup>
                            <Menu.Item value="rename">Rename</Menu.Item>
                            <Menu.Item value="duplicate">Duplicate</Menu.Item>
                            <Menu.Item value="edit">Edit</Menu.Item>
                        </Menu.ItemGroup>
                        <Menu.Separator />
                        <Menu.ItemGroup>
                            <Menu.Item
                                value="delete"
                                color="fg.error"
                                _hover={{ bg: 'bg.error', color: 'fg.error' }}
                            >
                                Delete
                            </Menu.Item>
                        </Menu.ItemGroup>
                    </Menu.Content>
                </Menu.Positioner>
            </Portal>
        </Menu.Root>
    </>
}

const MainDisplayMenuContent = () => <Menu.Content>
    <Menu.Item
        value="edit-song"
    // onClick={() => onSongEdit(songListContextIndex)}
    >
        Edit Song
    </Menu.Item>
    <Menu.Item value="rename-song">Rename Song</Menu.Item>
    <Menu.Item value="duplicate-song">Duplicate Song</Menu.Item>
    <Menu.Separator />
    <Menu.Item
        value="add-to-favorites"
    // onClick={handleAddToFavorites}
    >
        Add to Favorites
    </Menu.Item>
    <Menu.ItemGroup>
        <Menu.Root
            positioning={{ placement: 'right-start', gutter: 2 }}
        >
            <Menu.TriggerItem w="full" justifyContent="space-between">
                Add to Collection <TbChevronRight />
            </Menu.TriggerItem>
            <Menu.Positioner>
                <Menu.Content>
                    {/* {songCollections.map((collection, index) => (
                                                                <Menu.Item
                                                                    key={index}
                                                                    value={`sc-${collection.id}`}
                                                                    onClick={() =>
                                                                        handleAddToCollection(collection)
                                                                    }
                                                                >
                                                                    {collection.name}
                                                                </Menu.Item>
                                                            ))} */}
                </Menu.Content>
            </Menu.Positioner>
        </Menu.Root>
        <Menu.Item value="refresh">Refresh</Menu.Item>
    </Menu.ItemGroup>
    <Menu.Separator />
    <Menu.Item
        value="delete"
        color="fg.error"
        _hover={{ bg: 'bg.error', color: 'fg.error' }}
    // onClick={() => onSongDelete(songListContextIndex)}
    >
        Delete Song
    </Menu.Item>
</Menu.Content>

const MainActionBarMenu = () => <>
    <HStack
        width={10}
        gap={1}
        h={6}
        px={2}
        py={0.5}
        mr={1}
        justify="center"
        cursor="pointer"
        borderInline="2px solid"
        borderInlineColor="gray"
        aria-label="Add new song"
    // onClick={() => updateSongEdit(appStore, { open: true, song: null })}
    >
        <ImPlus size={9.5} />
    </HStack>

    <Menu.Root>
        <Menu.Trigger asChild={triggerProps => (
            <HStack
                width={10}
                gap={1}
                h={6}
                px={2}
                py={0.5}
                cursor="pointer"
                aria-label="Song settings"
                {...triggerProps()}
            >
                <TbSettings size={17} />
                <TbChevronDown size={12} />
            </HStack>
        )}>
        </Menu.Trigger>
        <Menu.Positioner>
            <Menu.Content>
                <Menu.ItemGroup>
                    <Menu.Item value="edit">Edit Song</Menu.Item>
                    <Menu.Item value="rename">Rename Song</Menu.Item>
                    <Menu.Item value="duplicate">Duplicate Song</Menu.Item>
                </Menu.ItemGroup>
                <Menu.Separator />
                <Menu.ItemGroup>
                    <Menu.Item
                        value="delete"
                        color="fg.error"
                        _hover={{ bg: 'bg.error', color: 'fg.error' }}
                    >
                        Delete Song
                    </Menu.Item>
                </Menu.ItemGroup>
                <Menu.Separator />
                <Menu.ItemGroup>
                    <Menu.Root
                        positioning={{ placement: 'right-start', gutter: 2 }}
                    >
                        <Menu.TriggerItem w="full" justifyContent="space-between">
                            Sort by <TbChevronRight />
                        </Menu.TriggerItem>
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
                    </Menu.Root>
                    <Menu.Item value="refresh">Refresh</Menu.Item>
                </Menu.ItemGroup>
            </Menu.Content>
        </Menu.Positioner>
    </Menu.Root>
</>

// const songGroups: SongListData[] = [
//     { value: 'all', title: 'All Songs' },
//     { value: 'favorites', title: 'My Favorites' },
//     { value: 'collections', title: 'My Collections' },
// ]