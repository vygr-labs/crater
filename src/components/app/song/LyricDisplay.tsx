import { For, Show } from "solid-js";
import { Box, Flex, Stack } from "styled-system/jsx";
import { token } from "styled-system/tokens";
import { Text } from "~/components/ui/text";
import type { SongLyric } from "~/types/context";
import { getFocusableStyles } from "~/utils";
import {
	defaultPalette,
	defaultSupportingPalette,
	PREVIEW_INDEX_WIDTH,
} from "~/utils/constants";

interface Props {
	index: number;
	lyric: SongLyric;
	isFocusItem: boolean;
	panelName: string;
	isCurrentPanel: boolean;
}

export default function LyricDisplay(props: Props) {
	return (
		<Box
			class="disable-child-clicks transition-children-backgrounds"
			userSelect="none"
			py={1}
			mb={0}
			data-focusId={props.index}
			data-panel={props.panelName}
			display="flex"
			gap={0}
			// onMouseEnter={() => setIsHovered(true)}
			// onMouseLeave={() => setIsHovered(false)}
		>
			<Flex
				w="full"
				h="full"
				fontSize="14px"
				gap={0.5}
				position="relative"
				pl={PREVIEW_INDEX_WIDTH}
				style={getFocusableStyles(
					"LYRICS_PARENT_CONTAINER",
					props.isFocusItem,
					props.isCurrentPanel,
				)}
				// style={{
				// 	// "background-color": props.isFocusItem ? token.var(`colors.${defaultPalette}.800`) : isHovered ? token.var(`colors.${defaultSupportingPalette}.800`) : 'transparent'
				// }}
			>
				<Box
					w={PREVIEW_INDEX_WIDTH}
					h="full"
					pt={2}
					textAlign="center"
					position="absolute"
					left={0}
					bottom={0}
					top={0}
					style={getFocusableStyles(
						"LYRICS_INDEX_CONTAINER",
						props.isFocusItem,
						props.isCurrentPanel,
					)}
					// bgColor={
					// 	props.isFocusItem ? `${defaultPalette}.700` : isHovered ? `${defaultPalette}.700/50` : 'gray.800'
					// }
				>
					<Text>{props.index + 1}</Text>
				</Box>
				<Stack gap={0}>
					<Show when={props.lyric.label}>
						<Box px={2} pt={2}>
							<Text
								textTransform="capitalize"
								style={getFocusableStyles(
									"LYRICS_LABEL_TEXT",
									props.isFocusItem,
									props.isCurrentPanel,
								)}
								// color={
								// 	props.isFocusItem
								// 		? 'gray.100'
								// 		: isHovered
								// 			? 'gray.100'
								// 			: 'initial'
								// }
								fontWeight={600}
							>
								{props.lyric.label}
							</Text>
						</Box>
					</Show>

					<Box
						py={2}
						px={2}
						style={getFocusableStyles(
							"LYRICS_TEXT_CONTAINER",
							props.isFocusItem,
							props.isCurrentPanel,
						)}
						// color={
						// 	props.isFocusItem ? 'gray.200' : isHovered ? 'gray.200' : 'fg.muted'
						// }
						fontFamily="body"
					>
						<For each={props.lyric?.text}>{(line) => <Text>{line}</Text>}</For>
					</Box>
				</Stack>
			</Flex>
		</Box>
	);
}
