import { FiPlus, FiSettings } from "solid-icons/fi";
import { ImPlus } from "solid-icons/im";
import { TbCheck, TbChevronDown, TbChevronRight, TbSettings } from "solid-icons/tb";
import { For, Portal, Show } from "solid-js/web";
import { HStack, Box } from "styled-system/jsx";
import * as ParkMenu from "~/components/ui/menu";
import * as Menu from "~/components/ui/custom-context-menu";
import { useAppContext } from "~/layouts/AppContext";
import type { MediaType } from "~/types";
import { defaultPalette } from "~/utils/constants";

interface MediaPanelContextMenuCompProps {
	onMediaEdit: () => void;
	onMediaDelete: () => void;
	currentType: MediaType;
	onSetLogoBg: () => void;
	isCurrentLogo?: boolean;
}

export const MainDisplayMenuContent = (
	props: MediaPanelContextMenuCompProps,
) => (
	<>
		<Menu.Item value="edit-theme" onClick={props.onMediaEdit}>
			Edit Media
		</Menu.Item>
		<Menu.Item
			value="set-default-theme"
			textTransform="capitalize"
			onClick={props.onSetLogoBg}
		>
			<HStack gap={4} w="full" justifyContent="space-between">
				Set as Logo Background
				<Show when={props.isCurrentLogo}>
					<TbCheck size={16} />
				</Show>
			</HStack>
		</Menu.Item>
		<Menu.Item value="duplicate-theme">Duplicate Theme</Menu.Item>
		<Menu.Separator />
		<Menu.Item
			value="add-to-favorites"
			// onClick={handleAddToFavorites}
		>
			Add to Favorites
		</Menu.Item>
		<Menu.ItemGroup>
			<Menu.SubRoot positioning={{ placement: "right-start", gutter: 2 }}>
				<Menu.TriggerItem w="full" justifyContent="space-between">
					Add to Collection <TbChevronRight />
				</Menu.TriggerItem>
				<Menu.Positioner>
					<Box
						bg="bg.default"
						borderWidth="1px"
						borderColor="border.default"
						rounded="md"
						shadow="lg"
						py={1}
						minW="12rem"
					>
						{/* {themeCollections.map((collection, index) => (
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
		<Menu.Item
			value="delete"
			color="fg.error"
			_hover={{ bg: "bg.error", color: "fg.error" }}
			onClick={props.onMediaDelete}
		>
			Delete Theme
		</Menu.Item>
	</>
);

interface ThemeActionBarMenuProps {
	onAddMedia: () => void;
}

export const MainActionBarMenu = (props: ThemeActionBarMenuProps) => {
	return (
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
				aria-label="Add new theme"
				onClick={props.onAddMedia}
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
							aria-label="Theme settings"
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
							<ParkMenu.Menu.Item value="edit">Edit Media</ParkMenu.Menu.Item>
							<ParkMenu.Menu.Item value="rename">Rename Media</ParkMenu.Menu.Item>
							<ParkMenu.Menu.Item value="duplicate">Duplicate Media</ParkMenu.Menu.Item>
						</ParkMenu.Menu.ItemGroup>
						<ParkMenu.Menu.Separator />
						<ParkMenu.Menu.ItemGroup>
							<ParkMenu.Menu.Item
								value="delete"
								color="fg.error"
								_hover={{ bg: "bg.error", color: "fg.error" }}
							>
								Delete Media
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
};
