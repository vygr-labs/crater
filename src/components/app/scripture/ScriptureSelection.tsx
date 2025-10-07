import { Box, Flex, HStack } from "styled-system/jsx";
import SelectionGroups from "../SelectionGroups";
import { createStore } from "solid-js/store";
import { Menu } from "../../ui/menu";
import { For, Portal } from "solid-js/web";
import { TbChevronDown, TbChevronRight, TbPlus, TbSettings } from "solid-icons/tb";
import { IconButton } from "../../ui/icon-button";
import { InputGroup } from "../../ui/input-group";
import { ImPlus } from "solid-icons/im";
import { FiSettings } from "solid-icons/fi";
import ControlTabDisplay from "../ControlTabDisplay";
import type { SongData } from "~/types/context";
import { createEffect, createMemo, onMount } from "solid-js";
import { Text } from "../../ui/text";
import type { ScriptureVerse } from "~/types";
import { createVirtualizer } from "@tanstack/solid-virtual";

type GroupValues = 'all' | 'collections' | 'favorites'
type SongListData = {
    title: string
    value: GroupValues
}
type SongControlsData = {
    searchMode: "search" | "title"
    currentGroup: GroupValues[]
    filter: string
}

export default function ScriptureSelection() {
    const [allScripture, setAllScripture] = createStore<ScriptureVerse[]>([]);
    // convert this into a createMemo
    // const [filteredSongs, setFilteredSongs] = createStore<SongData[]>([]);
    const [songControls, setSongControls] = createStore<SongControlsData>({
        currentGroup: ["all"],
        searchMode: "title",
        filter: ""
    })
    function handleGroupAccordionChange(open: (GroupValues | string)[], e?: MouseEvent) {
        setSongControls("currentGroup", open as GroupValues[])
    }

    onMount(() => {
        window.electronAPI.fetchAllScripture("NKJV").then(result => {
            console.log("Scriptures Fetched: ", result.length);
            setAllScripture(result);
        })
    })
    
    let virtualizerParentRef!: HTMLDivElement
    const rowVirtualizer = createMemo(() => createVirtualizer({
        count: allScripture.length,
        getScrollElement: () => virtualizerParentRef,
        estimateSize: () => 36,
        overscan: 5,
    }))

    return (
        <Flex h="full" pos="relative">
            <SelectionGroups currentGroup={songControls.currentGroup} allGroups={songGroups} subGroups={{
                favorites: [],
                collections: [{
                    id: 1,
                    name: "October"
                }, {
                    id: 2,
                    name: "November"
                }],
                all: [],
            }} handleAccordionChange={handleGroupAccordionChange} actionMenus={<SongSelectionGroupMenus />} />
            <ControlTabDisplay contextMenuContent={<MainDisplayMenuContent />} actionBarMenu={<MainActionBarMenu />} ref={virtualizerParentRef}>
                <Box style={{
                    height: `${rowVirtualizer().getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}>
                    <For each={rowVirtualizer().getVirtualItems()}>
                        {virtualItem => (
                            <Text style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: `${virtualItem.size}px`,
                                transform: `translateY(${virtualItem.start}px)`,
                            }}>{allScripture[virtualItem.index].text}</Text>
                        )}
                    </For>
                </Box>
            </ControlTabDisplay>
        </Flex>
    )
}

const SongSelectionGroupMenus = () => <>
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
                    <Menu.Item
                        value="add-collection"
                    // onClick={() => handleNewGroup('collection')}
                    >
                        New Collection
                    </Menu.Item>
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

const songGroups: SongListData[] = [
    { value: 'all', title: 'All Songs' },
    { value: 'favorites', title: 'My Favorites' },
    { value: 'collections', title: 'My Collections' },
]