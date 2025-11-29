import { css } from "styled-system/css";
import { Box, Flex, HStack, Stack } from "styled-system/jsx";
import { Text } from "~/components/ui/text";
import type { DisplayProps, Theme } from "~/types";
import { getFocusableStyles } from "~/utils";
import Image from "./Image";
import { defaultPalette } from "~/utils/constants";
import { TbGripVertical, TbList } from "solid-icons/tb";
import type { IconTypes } from "solid-icons";
import { Dynamic } from "solid-js/web";

interface Props {
	index: number;
	item: DisplayProps;
	isFocusItem: boolean;
	panelName: string;
	isCurrentPanel: boolean;
	theme: Theme | null | undefined;
	icon?: IconTypes;
}

export default function ScheduleItem(props: Props) {
	return (
		<HStack
			class="disable-child-clicks"
			userSelect="none"
			gap={0}
			h="full"
			data-focusId={props.index}
			data-panel={props.panelName}
			style={getFocusableStyles(
				"SCHEDULE_ITEM_PARENT_CONTAINER",
				props.isFocusItem,
				props.isCurrentPanel,
			)}
			_hover={{
				bgColor: `purple.900/30`,
			}}
			cursor="pointer"
			transition="all 0.1s ease"
		>
			{/* Drag handle */}
			<Box
				px={2}
				py={2.5}
				color="gray.600"
				_hover={{ color: "gray.400" }}
				cursor="grab"
				flexShrink={0}
			>
				<TbGripVertical size={14} />
			</Box>

			{/* Icon */}
			<Box
				color={
					props.isFocusItem && props.isCurrentPanel ? "purple.300" : "gray.500"
				}
				flexShrink={0}
				mr={2}
			>
				<Dynamic component={props.icon || TbList} size={14} />
			</Box>

			{/* Title */}
			<Text
				fontSize="13px"
				fontWeight={props.isFocusItem ? "medium" : "normal"}
				color={props.isFocusItem && props.isCurrentPanel ? "white" : "gray.200"}
				flex={1}
				truncate
				pr={3}
			>
				{props.item.metadata?.title}
			</Text>
		</HStack>
	);
}
