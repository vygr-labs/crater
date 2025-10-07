import { Box, HStack } from "styled-system/jsx";
import { Accordion } from "../ui/accordion";
import { For, Show, type JSXElement } from "solid-js";
import { TbChevronDown, TbPlus, TbSettings } from "solid-icons/tb";
import { Text } from "../ui/text";

interface GroupMeta {
    title: string
    value: string
}

interface DisplayPropsCollection {
    id: number
    name: string,
    [key: string]: unknown
}

interface Props<T extends GroupMeta[]> {
    currentGroup: (T[number]["value"])[]
    allGroups: T
    subGroups: {
        [K in T[number]["value"]]: DisplayPropsCollection[]
    }
    handleAccordionChange: (value: any) => void;
    searchInput?: JSXElement
    actionMenus?: JSXElement
}

export default function SelectionGroups<T extends GroupMeta[]>(props: Props<T>) {
    return (
        <Box
            w="1/4"
            pos="absolute"
            left="0"
            h="full"
            border="1px solid"
            borderColor="gray.700"
            pb={7}
            overflowY="auto"
        >
            {props.searchInput}

            {/* Accordion for song groups */}
            <Box
                // ref={accordionRef}
                tabIndex={0}
                // onFocus={handleAccordionFocus}
                role="tree"
                aria-label="Song categories"
            >
                <Accordion.Root
                    variant={'enclosed'}
                    collapsible
                    size="sm"
                    value={props.currentGroup}
                    onValueChange={e => props.handleAccordionChange(e.value)}
                >
                    <For each={props.allGroups}>
                        {(item, index) => {
                            const subGroupItems = props.subGroups[item.value as T[number]["value"]]

                            return (
                                <Accordion.Item value={item.value}>
                                    <Accordion.ItemTrigger
                                        cursor="pointer"
                                        w="full"
                                        justifyContent="space-between"
                                        role="treeitem"
                                        aria-expanded={props.currentGroup.includes(item.value)}
                                    >
                                        <Text fontSize="13px">{item.title}</Text>
                                        <Show when={subGroupItems?.length}>
                                            <Accordion.ItemIndicator>
                                                <TbChevronDown />
                                            </Accordion.ItemIndicator>
                                        </Show>
                                    </Accordion.ItemTrigger>

                                    <Show when={subGroupItems?.length}>
                                        <Accordion.ItemContent borderRadius={0} p={0} role="group">
                                            <Accordion.ItemBody py={1}>
                                                <For each={subGroupItems}>
                                                    {
                                                        (subItem: DisplayPropsCollection) => (
                                                            <HStack
                                                                justifyContent="space-between"
                                                                px={3}
                                                                fontSize="14px"
                                                                py={'3px'}
                                                                cursor="pointer"
                                                                _hover={{
                                                                    background: 'gray.700',
                                                                    color: 'gray.200',
                                                                }}
                                                                borderRadius={0}
                                                                data-subgroup={`song-${item.value}-${subItem.id}`}
                                                                role="treeitem"
                                                                onClick={() =>
                                                                    props.handleAccordionChange([
                                                                        item.value,
                                                                        `${item.value}-${subItem.id}`,
                                                                    ])
                                                                }
                                                            >
                                                                <Text>{subItem.name}</Text>
                                                            </HStack>
                                                        )
                                                    }
                                                </For>
                                            </Accordion.ItemBody>
                                        </Accordion.ItemContent>
                                    </Show>
                                </Accordion.Item>
                            )
                        }}
                    </For>
                </Accordion.Root>
            </Box>

            {/* Bottom controls for left panel */}
            <HStack
                gap={0}
                position="absolute"
                bottom={0}
                w="full"
                h={6}
                bg="gray.700"
            >
                {props.actionMenus}
            </HStack>
        </Box>
    )
}

// const searchInput = <InputGroup
// 					w="full"
// 					startElement={
// 						<IconButton
// 							size="sm"
// 							variant="plain"
// 							cursor="pointer"
// 							onClick={updateSearchMode}
// 							aria-label={
// 								searchMode === 'title'
// 									? 'Switch to search mode'
// 									: 'Switch to title mode'
// 							}
// 						>
// 							{searchMode === 'title' ? <VscListTree /> : <VscSearchFuzzy />}
// 						</IconButton>
// 					}
// 					startElementProps={{ padding: 0, pointerEvents: 'auto' }}
// 					endElement={<Kbd>⌘A</Kbd>}
// 				>
// 					<SearchInput
// 						value={filter}
// 						placeholder="Search songs"
// 						onChange={handleFilterUpdate}
// 						ref={searchInputRef}
// 						onFocus={handleSearchInputFocus}
// 						data-testid="song-search-input"
// 						aria-label="Search songs"
// 					/>
// 				</InputGroup>