import { Box, HStack } from "styled-system/jsx";
import { Accordion } from "../ui/accordion";
import { For, Show, type JSXElement } from "solid-js";
import { Dynamic } from "solid-js/web";
import { TbCheck, TbChevronDown, TbFolder, TbHash } from "solid-icons/tb";
import { Text } from "../ui/text";
import type { PanelGroup } from "~/types/app-context";
import { AiOutlineFolderOpen } from "solid-icons/ai";
import type { IconTypes } from "solid-icons";
import { defaultPalette, neutralPalette } from "~/utils/constants";

interface GroupMeta {
	title: string;
	value: string;
}

interface Props<T extends GroupMeta[]> {
	currentGroup: T[number]["value"][];
	currentSubgroup?: number | null;
	groups: PanelGroup;
	handleAccordionChange: (value: any) => void;
	onSubgroupDblClick?: (subgroupId: number) => void;
	searchInput?: JSXElement;
	actionMenus?: JSXElement;
	subgroupIcon?: IconTypes;
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
												? `${defaultPalette}.900/30`
												: "transparent"
										}
										transition="all 0.15s ease"
									>
										<HStack gap={2}>
											<Box
												color={
													isOpen()
														? `${defaultPalette}.400`
														: `${neutralPalette}.500`
												}
											>
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
											<Accordion.ItemBody py={1} px={2}>
												<For each={panelGroup.subGroups}>
													{(collection) => {
														const isSelected = () =>
															props.currentSubgroup === collection.id;
														return (
															<HStack
																justifyContent="space-between"
																px={2.5}
																py={1.5}
																fontSize="13px"
																cursor="pointer"
																color={isSelected() ? "white" : "gray.400"}
																bg={
																	isSelected()
																		? `${defaultPalette}.900/40`
																		: "transparent"
																}
																_hover={{
																	background: isSelected()
																		? `${defaultPalette}.900/40`
																		: "gray.800/50",
																	color: isSelected() ? "white" : "gray.200",
																}}
																borderRadius="md"
																transition="all 0.15s ease"
																data-subgroup={`song-${panel}-${collection.id}`}
																role="treeitem"
																onClick={() =>
																	props.handleAccordionChange([
																		panel,
																		`${panel}-${collection.id}`,
																	])
																}
																onDblClick={() =>
																	props.onSubgroupDblClick?.(collection.id)
																}
															>
																<HStack gap={2}>
																	<Show when={props.subgroupIcon}>
																		<Box
																			color={
																				isSelected()
																					? `${defaultPalette}.400`
																					: `${neutralPalette}.600`
																			}
																		>
																			<Dynamic
																				component={props.subgroupIcon}
																				size={13}
																			/>
																		</Box>
																	</Show>
																	<Text
																		fontWeight={
																			isSelected() ? "medium" : "normal"
																		}
																	>
																		{collection.name}
																	</Text>
																</HStack>
																<Show when={isSelected()}>
																	<TbCheck
																		size={14}
																		color={`var(--colors-${defaultPalette}-400)`}
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
