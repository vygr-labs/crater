import { Box, HStack } from "styled-system/jsx";
import { Accordion } from "../ui/accordion";
import { For, Show, type JSXElement } from "solid-js";
import { TbCheck, TbChevronDown } from "solid-icons/tb";
import { Text } from "../ui/text";
import type { PanelGroup } from "~/types/app-context";

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
			border="1px solid"
			borderRight="none"
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
				aria-label="Panel Groups"
			>
				<Accordion.Root
					variant={"enclosed"}
					collapsible
					size="sm"
					value={props.currentGroup}
					onValueChange={(e) => props.handleAccordionChange(e.value)}
				>
					<For each={props.groups ? Object.entries(props.groups) : []}>
						{([panel, panelGroup]) => {
							return (
								<Accordion.Item value={panel}>
									<Accordion.ItemTrigger
										cursor="pointer"
										w="full"
										justifyContent="space-between"
										role="treeitem"
										aria-expanded={props.currentGroup.includes(panel)}
									>
										<Text fontSize="13px">{panelGroup.title}</Text>
										<Show when={panelGroup.subGroups?.length}>
											<Accordion.ItemIndicator>
												<TbChevronDown />
											</Accordion.ItemIndicator>
										</Show>
									</Accordion.ItemTrigger>

									<Show when={panelGroup.subGroups?.length}>
										<Accordion.ItemContent borderRadius={0} p={0} role="group">
											<Accordion.ItemBody py={1}>
												<For each={panelGroup.subGroups}>
													{(collection) => (
														<HStack
															justifyContent="space-between"
															px={3}
															fontSize="14px"
															py={"3px"}
															cursor="pointer"
															_hover={{
																background: "gray.700",
																color: "gray.200",
															}}
															borderRadius={0}
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
															<Show
																when={props.currentSubgroup === collection.id}
															>
																<TbCheck />
															</Show>
														</HStack>
													)}
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
			<HStack gap={0} position="fixed" bottom={0} w="full" h={6} bg="gray.700">
				{props.actionMenus}
			</HStack>
		</Box>
	);
}
