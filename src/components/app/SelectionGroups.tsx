import { Box, HStack } from "styled-system/jsx";
import { Accordion } from "../ui/accordion";
import { For, Show, type JSXElement } from "solid-js";
import { TbCheck, TbChevronDown, TbFolder } from "solid-icons/tb";
import { Text } from "../ui/text";
import type { PanelGroup } from "~/types/app-context";
import { AiOutlineFolderOpen } from "solid-icons/ai";

interface GroupMeta {
	title: string;
	value: string;
}

interface Props<T extends GroupMeta[]> {
	currentGroup: T[number]["value"][];
	currentSubgroup?: number | null;
	groups: PanelGroup;
	handleAccordionChange: (value: any) => void;
	searchInput?: JSXElement;
	actionMenus?: JSXElement;
}

export default function SelectionGroups<T extends GroupMeta[]>(
	props: Props<T>,
) {
	return (
		<Box
			w="1/4"
			pos="absolute"
			left="0"
			h="full"
			borderRight="1px solid"
			borderRightColor="gray.800"
			pb={7}
			overflowY="auto"
			bg="gray.950/50"
		>
			{props.searchInput}

			{/* Accordion for song groups */}
			<Box tabIndex={0} role="tree" aria-label="Panel Groups" pt={1}>
				<Accordion.Root
					variant={"enclosed"}
					collapsible
					size="sm"
					value={props.currentGroup}
					onValueChange={(e) => props.handleAccordionChange(e.value)}
				>
					<For each={props.groups ? Object.entries(props.groups) : []}>
						{([panel, panelGroup]) => {
							const isOpen = () => props.currentGroup.includes(panel);
							return (
								<Accordion.Item value={panel} borderColor="transparent">
									<Accordion.ItemTrigger
										cursor="pointer"
										w="full"
										justifyContent="space-between"
										role="treeitem"
										aria-expanded={isOpen()}
										px={3}
										py={2}
										_hover={{ bg: "gray.800/50" }}
										bg={
											isOpen() && !panelGroup.subGroups?.length
												? "purple.900/30"
												: "transparent"
										}
										transition="all 0.15s ease"
									>
										<HStack gap={2}>
											<Box color={isOpen() ? "purple.400" : "gray.500"}>
												<Show when={isOpen()} fallback={<TbFolder size={14} />}>
													<AiOutlineFolderOpen size={14} />
												</Show>
											</Box>
											<Text
												fontSize="13px"
												fontWeight={isOpen() ? "medium" : "normal"}
												color={isOpen() ? "gray.100" : "gray.300"}
											>
												{panelGroup.title}
											</Text>
										</HStack>
										<Show when={panelGroup.subGroups?.length}>
											<Accordion.ItemIndicator
												color="gray.500"
												transition="transform 0.2s ease"
											>
												<TbChevronDown size={14} />
											</Accordion.ItemIndicator>
										</Show>
									</Accordion.ItemTrigger>

									<Show when={panelGroup.subGroups?.length}>
										<Accordion.ItemContent borderRadius={0} p={0} role="group">
											<Accordion.ItemBody py={1} pl={2}>
												<For each={panelGroup.subGroups}>
													{(collection) => {
														const isSelected = () =>
															props.currentSubgroup === collection.id;
														return (
															<HStack
																justifyContent="space-between"
																px={3}
																py={1.5}
																ml={2}
																fontSize="13px"
																cursor="pointer"
																color={isSelected() ? "gray.100" : "gray.400"}
																bg={
																	isSelected() ? "purple.900/30" : "transparent"
																}
																_hover={{
																	background: "gray.800/50",
																	color: "gray.200",
																}}
																borderRadius="sm"
																borderLeft="2px solid"
																borderColor={
																	isSelected() ? "purple.500" : "gray.700"
																}
																transition="all 0.15s ease"
																data-subgroup={`song-${panel}-${collection.id}`}
																role="treeitem"
																onClick={() =>
																	props.handleAccordionChange([
																		panel,
																		`${panel}-${collection.id}`,
																	])
																}
															>
																<Text>{collection.name}</Text>
																<Show when={isSelected()}>
																	<TbCheck
																		size={14}
																		color="var(--colors-purple-400)"
																	/>
																</Show>
															</HStack>
														);
													}}
												</For>
											</Accordion.ItemBody>
										</Accordion.ItemContent>
									</Show>
								</Accordion.Item>
							);
						}}
					</For>
				</Accordion.Root>
			</Box>

			{/* Bottom controls for left panel */}
			<HStack
				gap={0}
				position="fixed"
				bottom={0}
				w="full"
				h={6}
				bg="gray.800"
				borderTop="1px solid"
				borderTopColor="gray.700"
			>
				{props.actionMenus}
			</HStack>
		</Box>
	);
}
