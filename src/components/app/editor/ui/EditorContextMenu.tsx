import { For, Show, createSignal, onCleanup, onMount } from "solid-js";
import { Box, Flex, HStack, VStack } from "styled-system/jsx";
import { Portal } from "solid-js/web";
import { Text } from "~/components/ui/text";
import {
	TbTrash,
	TbCopy,
	TbLayersSubtract,
	TbLayersIntersect,
	TbAlignLeft,
	TbAlignCenter,
	TbAlignRight,
	TbArrowsVertical,
	TbArrowsHorizontal,
} from "solid-icons/tb";
import {
	AiOutlineVerticalAlignTop,
	AiOutlineVerticalAlignMiddle,
	AiOutlineVerticalAlignBottom,
} from "solid-icons/ai";
import { css } from "styled-system/css";

interface ContextMenuItem {
	label: string;
	icon?: any;
	onClick: () => void;
	disabled?: boolean;
	danger?: boolean;
	divider?: boolean;
}

interface EditorContextMenuProps {
	x: number;
	y: number;
	isOpen: boolean;
	nodeName?: string;
	nodeType?: string;
	onClose: () => void;
	onDelete: () => void;
	onDuplicate: () => void;
	onBringToFront: () => void;
	onSendToBack: () => void;
	onAlignLeft: () => void;
	onAlignCenterH: () => void;
	onAlignRight: () => void;
	onAlignTop: () => void;
	onAlignCenterV: () => void;
	onAlignBottom: () => void;
}

function MenuItem(props: ContextMenuItem) {
	const handleClick = (e: MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (!props.disabled) {
			props.onClick();
		}
	};

	return (
		<>
			<Show when={props.divider}>
				<Box h="1px" bg="gray.700" mx={2} my={1} />
			</Show>
			<Flex
				px={2.5}
				py={1.5}
				mx={1}
				cursor={props.disabled ? "not-allowed" : "pointer"}
				opacity={props.disabled ? 0.5 : 1}
				bg="transparent"
				rounded="xs"
				alignItems="center"
				gap={2.5}
				transition="all 0.15s ease"
				class={css({
					"&:hover": {
						bg: props.disabled
							? "transparent"
							: props.danger
								? "red.900"
								: "gray.800",
					},
				})}
				on:click={handleClick}
			>
				<Show when={props.icon}>
					<Box color={props.danger ? "red.400" : "gray.500"} flexShrink={0}>
						{props.icon}
					</Box>
				</Show>
				<Text
					fontSize="sm"
					color={props.danger ? "red.400" : "gray.200"}
					fontWeight="400"
				>
					{props.label}
				</Text>
			</Flex>
		</>
	);
}

export default function EditorContextMenu(props: EditorContextMenuProps) {
	let menuRef: HTMLDivElement | undefined;

	const handleClickOutside = (e: MouseEvent) => {
		if (menuRef && !menuRef.contains(e.target as Node)) {
			props.onClose();
		}
	};

	onMount(() => {
		if (typeof document === "undefined") return;
		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("scroll", props.onClose, true);
	});

	onCleanup(() => {
		if (typeof document === "undefined") return;
		document.removeEventListener("mousedown", handleClickOutside);
		document.removeEventListener("scroll", props.onClose, true);
	});

	const handleAction = (action: () => void) => {
		action();
		props.onClose();
	};

	// Menu sections for better organization
	const menuSections = [
		{
			title: null,
			items: [
				{
					label: "Duplicate",
					icon: <TbCopy size={15} />,
					action: props.onDuplicate,
				},
				{
					label: "Delete",
					icon: <TbTrash size={15} />,
					action: props.onDelete,
					danger: true,
				},
			],
		},
		{
			title: "Layer",
			items: [
				{
					label: "Bring to Front",
					icon: <TbLayersSubtract size={15} />,
					action: props.onBringToFront,
				},
				{
					label: "Send to Back",
					icon: <TbLayersIntersect size={15} />,
					action: props.onSendToBack,
				},
			],
		},
		{
			title: "Align",
			items: [
				{
					label: "Left",
					icon: <TbAlignLeft size={15} />,
					action: props.onAlignLeft,
				},
				{
					label: "Center",
					icon: <TbAlignCenter size={15} />,
					action: props.onAlignCenterH,
				},
				{
					label: "Right",
					icon: <TbAlignRight size={15} />,
					action: props.onAlignRight,
				},
				{
					label: "Top",
					icon: <AiOutlineVerticalAlignTop size={15} />,
					action: props.onAlignTop,
				},
				{
					label: "Middle",
					icon: <AiOutlineVerticalAlignMiddle size={15} />,
					action: props.onAlignCenterV,
				},
				{
					label: "Bottom",
					icon: <AiOutlineVerticalAlignBottom size={15} />,
					action: props.onAlignBottom,
				},
			],
		},
	];

	return (
		<Show when={props.isOpen}>
			<Portal>
				<Box
					ref={menuRef}
					position="fixed"
					bg="gray.900"
					border="1px solid"
					borderColor="gray.700"
					borderRadius="lg"
					py={1.5}
					minW="200px"
					shadow="xl"
					zIndex={9999}
					pointerEvents="auto"
					style={{
						left: `${props.x}px`,
						top: `${props.y}px`,
						cursor: "default",
					}}
					class={css({
						animation: "fadeIn 0.1s ease-out",
						backdropFilter: "blur(8px)",
					})}
				>
					{/* Node Header */}
					<Show when={props.nodeType}>
						<Flex
							px={3}
							py={1}
							alignItems="center"
							gap={2}
							// borderBottom="1px solid"
							// borderBottomColor="gray.700"
							mb={1}
						>
							<Box
								w={1.5}
								h={1.5}
								rounded="full"
								bg={props.nodeType === "Text" ? "blue.600" : "purple.600"}
							/>
							<Text fontSize="2xs" fontWeight="400" color="gray.400">
								{props.nodeType}
							</Text>
							<Show when={props.nodeName && props.nodeName !== props.nodeType}>
								<Text fontSize="xs" color="gray.500" truncate maxW="120px">
									{props.nodeName}
								</Text>
							</Show>
						</Flex>
					</Show>

					<For each={menuSections}>
						{(section, sectionIndex) => (
							<Box>
								<Show when={sectionIndex() > 0}>
									<Box h="1px" bg="gray.700" my={1.5} />
								</Show>
								<Show when={section.title}>
									<Text
										fontSize="2xs"
										color="gray.500"
										textTransform="uppercase"
										letterSpacing="wide"
										px={3}
										py={1}
									>
										{section.title}
									</Text>
								</Show>
								<For each={section.items}>
									{(item) => (
										<MenuItem
											label={item.label}
											icon={item.icon}
											onClick={() => handleAction(item.action)}
											danger={(item as any).danger}
										/>
									)}
								</For>
							</Box>
						)}
					</For>
				</Box>
			</Portal>
		</Show>
	);
}
