import { css } from "styled-system/css";
import { Box, Flex, HStack, Stack } from "styled-system/jsx";
import { Text } from "~/components/ui/text";
import type { DisplayProps, Theme } from "~/types";
import { getFocusableStyles } from "~/utils";
import Image from "./Image";
import { defaultPalette, neutralPalette } from "~/utils/constants";
import { TbCheck, TbGripVertical, TbList } from "solid-icons/tb";
import type { IconTypes } from "solid-icons";
import { Dynamic, Show } from "solid-js/web";
import { createMemo, createSignal } from "solid-js";

interface Props {
	index: number;
	item: DisplayProps;
	isFocusItem: boolean;
	isSelected?: boolean;
	panelName: string;
	isCurrentPanel: boolean;
	theme: Theme | null | undefined;
	icon?: IconTypes;
	onDragStart?: (index: number) => void;
	onDragOver?: (index: number) => void;
	onDragEnd?: () => void;
	isDragOver?: boolean;
}

export default function ScheduleItem(props: Props) {
	const isHighlighted = createMemo(() => props.isFocusItem || props.isSelected);
	
	const handleDragStart = (e: DragEvent) => {
		e.dataTransfer?.setData("text/plain", props.index.toString());
		e.dataTransfer!.effectAllowed = "move";
		props.onDragStart?.(props.index);
	};

	const handleDragOver = (e: DragEvent) => {
		e.preventDefault();
		e.dataTransfer!.dropEffect = "move";
		props.onDragOver?.(props.index);
	};

	const handleDragEnd = () => {
		props.onDragEnd?.();
	};
	
	return (
		<HStack
			class="disable-child-clicks"
			userSelect="none"
			gap={0}
			h="full"
			data-focusId={props.index}
			data-panel={props.panelName}
			draggable={true}
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
			style={getFocusableStyles(
				"SCHEDULE_ITEM_PARENT_CONTAINER",
				props.isFocusItem,
				props.isCurrentPanel,
			)}
			bgColor={
				props.isDragOver 
					? `${defaultPalette}.700/60` 
					: props.isSelected && !props.isFocusItem 
					? `${defaultPalette}.800/50` 
					: undefined
			}
			borderLeft={props.isSelected ? `3px solid` : "3px solid transparent"}
			borderLeftColor={props.isSelected ? `${defaultPalette}.400` : "transparent"}
			borderTop={props.isDragOver ? `2px solid` : "2px solid transparent"}
			borderTopColor={props.isDragOver ? `${defaultPalette}.400` : "transparent"}
			_hover={{
				bgColor: props.isSelected ? `${defaultPalette}.800/60` : `${defaultPalette}.900/30`,
			}}
			cursor="pointer"
			transition="background-color 0.1s ease"
		>
			{/* Drag handle / Selection indicator */}
			<Box
				px={2}
				py={2.5}
				color={props.isSelected ? `${defaultPalette}.400` : isHighlighted() ? "gray.300" : "gray.600"}
				_hover={{ color: props.isSelected ? `${defaultPalette}.300` : "gray.400" }}
				cursor="grab"
				flexShrink={0}
			>
				<Show when={props.isSelected} fallback={<TbGripVertical size={14} />}>
					<TbCheck size={14} />
				</Show>
			</Box>

			{/* Icon */}
			<Box
				color={
					props.isFocusItem && props.isCurrentPanel
						? `${defaultPalette}.300`
						: props.isSelected
						? `${defaultPalette}.400`
						: `${neutralPalette}.500`
				}
				flexShrink={0}
				mr={2}
			>
				<Dynamic component={props.icon || TbList} size={14} />
			</Box>

			{/* Title */}
			<Text
				fontSize="13px"
				fontWeight={isHighlighted() ? "medium" : "normal"}
				color={props.isFocusItem && props.isCurrentPanel ? "white" : props.isSelected ? "gray.100" : "gray.200"}
				flex={1}
				truncate
				pr={3}
			>
				{props.item.metadata?.title}
			</Text>
		</HStack>
	);
}
