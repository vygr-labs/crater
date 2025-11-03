import { css } from "styled-system/css";
import { Box, Flex, HStack, Stack } from "styled-system/jsx";
import { Text } from "~/components/ui/text";
import type { DisplayProps, Theme } from "~/types";
import { getFocusableStyles } from "~/utils";
import Image from "./Image";
import { defaultPalette } from "~/utils/constants";

interface Props {
	index: number;
	item: DisplayProps;
	isFocusItem: boolean;
	panelName: string;
	isCurrentPanel: boolean;
	theme: Theme | null | undefined;
}

export default function ScheduleItem(props: Props) {
	return (
		<HStack
			class="disable-child-clicks"
			userSelect="none"
			gap={2}
			h="full"
			px={4.5}
			py={2.5}
			data-focusId={props.index}
			data-panel={props.panelName}
			style={getFocusableStyles(
				"SCHEDULE_ITEM_PARENT_CONTAINER",
				props.isFocusItem,
				props.isCurrentPanel,
			)}
			_hover={{
				bgColor: `purple.800/40`,
			}}
			// bgColor={
			// 	renderIndex === navigatedItem
			// 		? `${defaultPalette}.800`
			// 		: isHovered
			// 			? `${defaultSupportingPalette}.700`
			// 			: 'initial'
			// }
			// color={
			// 	renderIndex === navigatedItem
			// 		? 'white'
			// 		: isHovered
			// 			? 'gray.100'
			// 			: 'initial'
			// }
			cursor="pointer"
		>
			{/* <Square bg="teal" h="full" w={24}></Square> */}
			<Text textTransform="capitalize" fontSize="14px">
				{props.item.metadata?.title}
			</Text>
		</HStack>
	);
}
