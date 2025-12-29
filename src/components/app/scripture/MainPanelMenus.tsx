import { FiPlus, FiSettings } from "solid-icons/fi";
import { ImPlus } from "solid-icons/im";
import { TbChevronDown, TbChevronRight, TbSettings } from "solid-icons/tb";
import { For, Portal } from "solid-js/web";
import { HStack, Box } from "styled-system/jsx";
import * as Menu from "~/components/ui/custom-context-menu";
import * as ParkMenu from "~/components/ui/menu";
import { useAppContext } from "~/layouts/AppContext";
import { defaultPalette } from "~/utils/constants";

interface SongPanelContextMenuCompProps {
	// onSongEdit: () => void;
}

export const MainDisplayMenuContent = (
	props: SongPanelContextMenuCompProps,
) => (
	<>
		<Menu.Item
			value="edit-song"
			// onClick={props.onSongEdit}
		>
			Add to Schedule
		</Menu.Item>
		<Menu.Item value="rename-song">Mark Up</Menu.Item>
		<Menu.Separator />
		<Menu.Item
			value="add-to-favorites"
			// onClick={handleAddToFavorites}
		>
			Add to Favorites
		</Menu.Item>
		<Menu.ItemGroup>
			<Menu.SubRoot>
				<Menu.TriggerItem w="full" justifyContent="space-between">
					Add to Collection <TbChevronRight />
				</Menu.TriggerItem>
				<Menu.Positioner>
					<Box
						bg="gray.950"
						border="1px solid"
						borderColor="gray.800"
						rounded="md"
						shadow="xl"
						py={1}
						minW="150px"
					>
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
						<Menu.Item value="new-collection" color={`${defaultPalette}.400`}>
							+ New Collection
						</Menu.Item>
					</Box>
				</Menu.Positioner>
			</Menu.SubRoot>
			<Menu.Item value="refresh">Refresh</Menu.Item>
		</Menu.ItemGroup>
		<Menu.Separator />
	</>
);

export const MainActionBarMenu = () => (
	<>
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
			<FiPlus size={14} />
		</HStack>

		<ParkMenu.Menu.Root>
			<ParkMenu.Menu.Trigger
				asChild={(triggerProps) => (
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
						<FiSettings size={14} />
						<TbChevronDown size={10} />
					</HStack>
				)}
			></ParkMenu.Menu.Trigger>
			<ParkMenu.Menu.Positioner>
				<ParkMenu.Menu.Content>
					<ParkMenu.Menu.ItemGroup>
						<ParkMenu.Menu.Item value="edit">Edit Song</ParkMenu.Menu.Item>
						<ParkMenu.Menu.Item value="rename">Rename Song</ParkMenu.Menu.Item>
						<ParkMenu.Menu.Item value="duplicate">Duplicate Song</ParkMenu.Menu.Item>
					</ParkMenu.Menu.ItemGroup>
					<ParkMenu.Menu.Separator />
					<ParkMenu.Menu.ItemGroup>
						<ParkMenu.Menu.Item
							value="delete"
							color="fg.error"
							_hover={{ bg: "bg.error", color: "fg.error" }}
						>
							Delete Song
						</ParkMenu.Menu.Item>
					</ParkMenu.Menu.ItemGroup>
					<ParkMenu.Menu.Separator />
					<ParkMenu.Menu.ItemGroup>
						<ParkMenu.Menu.Root positioning={{ placement: "right-start", gutter: 2 }}>
							<ParkMenu.Menu.TriggerItem w="full" justifyContent="space-between">
								Sort by <TbChevronRight />
							</ParkMenu.Menu.TriggerItem>
							<ParkMenu.Menu.Positioner>
								<ParkMenu.Menu.Content>
									<ParkMenu.Menu.ItemGroup>
										<ParkMenu.Menu.Item value="name">Name</ParkMenu.Menu.Item>
										<ParkMenu.Menu.Item value="date-added">Date Added</ParkMenu.Menu.Item>
										<ParkMenu.Menu.Item value="last-used">Last Used</ParkMenu.Menu.Item>
									</ParkMenu.Menu.ItemGroup>
									<ParkMenu.Menu.Separator />
									<ParkMenu.Menu.ItemGroup>
										<ParkMenu.Menu.Item value="ascending">Ascending</ParkMenu.Menu.Item>
										<ParkMenu.Menu.Item value="descending">Descending</ParkMenu.Menu.Item>
									</ParkMenu.Menu.ItemGroup>
								</ParkMenu.Menu.Content>
							</ParkMenu.Menu.Positioner>
						</ParkMenu.Menu.Root>
						<ParkMenu.Menu.Item value="refresh">Refresh</ParkMenu.Menu.Item>
					</ParkMenu.Menu.ItemGroup>
				</ParkMenu.Menu.Content>
			</ParkMenu.Menu.Positioner>
		</ParkMenu.Menu.Root>
	</>
);
