import { FiPlus, FiSettings } from "solid-icons/fi";
import { ImPlus } from "solid-icons/im";
import { TbChevronDown, TbChevronRight, TbSettings } from "solid-icons/tb";
import { For, Portal } from "solid-js/web";
import { HStack } from "styled-system/jsx";
import { Menu } from "~/components/ui/menu";
import { useAppContext } from "~/layouts/AppContext";
import type { MediaType } from "~/types";

interface MediaPanelContextMenuCompProps {
	onMediaEdit: () => void;
	onMediaDelete: () => void;
	currentType: MediaType;
	onSetLogoBg: () => void;
}

export const MainDisplayMenuContent = (
	props: MediaPanelContextMenuCompProps,
) => (
	<Menu.Content>
		<Menu.Item value="edit-theme" onClick={props.onMediaEdit}>
			Edit Media
		</Menu.Item>
		<Menu.Item
			value="set-default-theme"
			textTransform="capitalize"
			onClick={props.onSetLogoBg}
		>
			Set as Logo Background
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
			<Menu.Root positioning={{ placement: "right-start", gutter: 2 }}>
				<Menu.TriggerItem w="full" justifyContent="space-between">
					Add to Collection <TbChevronRight />
				</Menu.TriggerItem>
				<Menu.Positioner>
					<Menu.Content>
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
					</Menu.Content>
				</Menu.Positioner>
			</Menu.Root>
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
	</Menu.Content>
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

			<Menu.Root>
				<Menu.Trigger
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
				></Menu.Trigger>
				<Menu.Positioner>
					<Menu.Content>
						<Menu.ItemGroup>
							<Menu.Item value="edit">Edit Media</Menu.Item>
							<Menu.Item value="rename">Rename Media</Menu.Item>
							<Menu.Item value="duplicate">Duplicate Media</Menu.Item>
						</Menu.ItemGroup>
						<Menu.Separator />
						<Menu.ItemGroup>
							<Menu.Item
								value="delete"
								color="fg.error"
								_hover={{ bg: "bg.error", color: "fg.error" }}
							>
								Delete Media
							</Menu.Item>
						</Menu.ItemGroup>
						<Menu.Separator />
						<Menu.ItemGroup>
							<Menu.Root positioning={{ placement: "right-start", gutter: 2 }}>
								<Menu.TriggerItem w="full" justifyContent="space-between">
									Sort by <TbChevronRight />
								</Menu.TriggerItem>
								<Menu.Positioner>
									<Menu.Content>
										<Menu.ItemGroup>
											<Menu.Item value="name">Name</Menu.Item>
											<Menu.Item value="date-added">Date Added</Menu.Item>
											<Menu.Item value="last-used">Last Used</Menu.Item>
										</Menu.ItemGroup>
										<Menu.Separator />
										<Menu.ItemGroup>
											<Menu.Item value="ascending">Ascending</Menu.Item>
											<Menu.Item value="descending">Descending</Menu.Item>
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
	);
};
