import { FiPlus, FiSettings } from "solid-icons/fi";
import { ImPlus } from "solid-icons/im";
import {
	TbChevronDown,
	TbChevronRight,
	TbCopy,
	TbEdit,
	TbHeart,
	TbMusic,
	TbRefresh,
	TbSettings,
	TbStar,
	TbTrash,
} from "solid-icons/tb";
import { For, Portal, Show } from "solid-js/web";
import { HStack } from "styled-system/jsx";
import { Kbd } from "~/components/ui/kbd";
import { Menu } from "~/components/ui/menu";
import { useAppContext } from "~/layouts/AppContext";

interface SongPanelContextMenuCompProps {
	onSongEdit: () => void;
	onDeleteSong: () => void;
}

export const MainDisplayMenuContent = (
	props: SongPanelContextMenuCompProps,
) => (
	<Menu.Content minW="200px">
		<Menu.ItemGroup>
			<Menu.Item value="edit-song" onClick={props.onSongEdit}>
				<HStack justify="space-between" w="full">
					<HStack gap={2}>
						<TbEdit size={14} />
						<span>Edit Song</span>
					</HStack>
					<Kbd size="sm" variant="outline">
						E
					</Kbd>
				</HStack>
			</Menu.Item>
			<Menu.Item value="duplicate-song">
				<HStack gap={2}>
					<TbCopy size={14} />
					<span>Duplicate Song</span>
				</HStack>
			</Menu.Item>
		</Menu.ItemGroup>
		<Menu.Separator />
		<Menu.ItemGroup>
			<Menu.Item value="add-to-favorites">
				<HStack gap={2}>
					<TbHeart size={14} />
					<span>Add to Favorites</span>
				</HStack>
			</Menu.Item>
			<Menu.Root positioning={{ placement: "right-start", gutter: 2 }}>
				<Menu.TriggerItem w="full" justifyContent="space-between">
					<HStack gap={2}>
						<TbMusic size={14} />
						<span>Add to Collection</span>
					</HStack>
					<TbChevronRight size={14} />
				</Menu.TriggerItem>
				<Menu.Positioner>
					<Menu.Content minW="150px">
						{/* TODO: Populate with actual collections */}
						<Menu.Item value="new-collection" color="purple.400">
							+ New Collection
						</Menu.Item>
					</Menu.Content>
				</Menu.Positioner>
			</Menu.Root>
		</Menu.ItemGroup>
		<Menu.Separator />
		<Menu.Item
			value="delete"
			color="fg.error"
			_hover={{ bg: "bg.error", color: "fg.error" }}
			onClick={props.onDeleteSong}
		>
			<HStack justify="space-between" w="full">
				<HStack gap={2}>
					<TbTrash size={14} />
					<span>Delete Song</span>
				</HStack>
				<Kbd size="sm" variant="outline">
					Del
				</Kbd>
			</HStack>
		</Menu.Item>
	</Menu.Content>
);

interface MainActionBarMenuProps {
	onAddSong: () => void;
	onDeleteSong: () => void;
}

export const MainActionBarMenu = (props: MainActionBarMenuProps) => (
	<>
		<HStack
			h={6}
			px={3}
			gap={1.5}
			cursor="pointer"
			color="gray.400"
			_hover={{ color: "white", bg: "gray.600" }}
			transition="all 0.15s ease"
			aria-label="Add new song"
			onClick={props.onAddSong}
			title="Add new song"
		>
			<FiPlus size={14} />
		</HStack>

		<Menu.Root>
			<Menu.Trigger
				asChild={(triggerProps) => (
					<HStack
						h={6}
						px={2}
						gap={1}
						cursor="pointer"
						color="gray.400"
						_hover={{ color: "white", bg: "gray.600" }}
						transition="all 0.15s ease"
						aria-label="Song settings"
						title="Song options"
						{...triggerProps()}
					>
						<FiSettings size={14} />
						<TbChevronDown size={10} />
					</HStack>
				)}
			></Menu.Trigger>
			<Menu.Positioner>
				<Menu.Content minW="180px">
					<Menu.ItemGroup>
						<Menu.Item value="edit">
							<HStack gap={2}>
								<TbEdit size={14} />
								<span>Edit Song</span>
							</HStack>
						</Menu.Item>
						<Menu.Item value="duplicate">
							<HStack gap={2}>
								<TbCopy size={14} />
								<span>Duplicate Song</span>
							</HStack>
						</Menu.Item>
					</Menu.ItemGroup>
					<Menu.Separator />
					<Menu.ItemGroup>
						<Menu.Item
							value="delete"
							color="fg.error"
							_hover={{ bg: "bg.error", color: "fg.error" }}
							onClick={props.onDeleteSong}
						>
							<HStack gap={2}>
								<TbTrash size={14} />
								<span>Delete Song</span>
							</HStack>
						</Menu.Item>
					</Menu.ItemGroup>
					<Menu.Separator />
					<Menu.ItemGroup>
						<Menu.Root positioning={{ placement: "right-start", gutter: 2 }}>
							<Menu.TriggerItem w="full" justifyContent="space-between">
								<span>Sort by</span>
								<TbChevronRight size={14} />
							</Menu.TriggerItem>
							<Menu.Positioner>
								<Menu.Content minW="140px">
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
						<Menu.Item value="refresh">
							<HStack gap={2}>
								<TbRefresh size={14} />
								<span>Refresh</span>
							</HStack>
						</Menu.Item>
					</Menu.ItemGroup>
				</Menu.Content>
			</Menu.Positioner>
		</Menu.Root>
	</>
);
