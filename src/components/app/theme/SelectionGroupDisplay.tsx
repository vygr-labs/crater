import { FiPlus, FiSettings } from "solid-icons/fi";
import { ImPlus } from "solid-icons/im";
import { TbChevronDown, TbSettings } from "solid-icons/tb";
import { For, Portal } from "solid-js/web";
import { HStack } from "styled-system/jsx";
import { Menu } from "~/components/ui/menu";
import { useAppContext } from "~/layouts/AppContext";

export default function ThemeSelectionGroupDisplay() {
    const { appStore, setAppStore } = useAppContext();

    const handleNewGroup = (group: string) => {
        setAppStore("namingModal", { type: "theme", open: true, group })
    }

    const availableThemeGroups = () => Object.entries(appStore.displayGroups.theme).filter(([id, group]) => group.subGroups !== null).map(([id]) => id);

    return (<>
        <Menu.Root>
            <Menu.Trigger asChild={parentProps =>
                <HStack
                    width={10}
                    gap={0.5}
                    h="full"
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
                    <FiPlus size={14} />
                    <TbChevronDown size={10} />
                </HStack>
            }>
            </Menu.Trigger>
            <Portal>
                <Menu.Positioner>
                    <Menu.Content>
                        <For each={availableThemeGroups()}>
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
                    h="full"
                    px={2}
                    py={0.5}
                    cursor="pointer"
                    aria-label="Collection settings"
                    {...parentProps()}
                >
                    <FiSettings size={14} />
                    <TbChevronDown size={10} />
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
    </>)
}