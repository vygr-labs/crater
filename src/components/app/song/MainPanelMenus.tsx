import { ImPlus } from "solid-icons/im";
import { TbChevronDown, TbChevronRight, TbSettings } from "solid-icons/tb";
import { For, Portal } from "solid-js/web";
import { HStack } from "styled-system/jsx";
import { Menu } from "~/components/ui/menu";
import { useAppContext } from "~/layouts/AppContext";

interface SongPanelContextMenuCompProps {
    onSongEdit: () => void;
}

export const MainDisplayMenuContent = (props: SongPanelContextMenuCompProps) => <Menu.Content>
    <Menu.Item
        value="edit-song"
    onClick={props.onSongEdit}
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

export const MainActionBarMenu = () => <>
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