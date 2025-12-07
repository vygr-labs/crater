import { For, Show } from "solid-js";
import { Box, Flex, Stack, VStack } from "styled-system/jsx";
import { token } from "styled-system/tokens";
import { Text } from "~/components/ui/text";
import { Badge } from "~/components/ui/badge";
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
				>
					<Text>{props.index + 1}</Text>
				</Box>
				<Stack gap={0}>
					<Show when={props.lyric.label}>
						<Box px={2} pt={2}>
							<Badge
								size="sm"
								variant={props.isFocusItem && props.isCurrentPanel ? "subtle" : "outline"}
								colorPalette={props.isFocusItem && props.isCurrentPanel ? "gray" : defaultSupportingPalette}
							>
								{props.lyric.label}
							</Badge>
						</Box>
					</Show>

					<VStack
						py={2}
						px={2}
						style={getFocusableStyles(
							"LYRICS_TEXT_CONTAINER",
							props.isFocusItem,
							props.isCurrentPanel,
						)}
						alignItems="start"
						gap={1}
						fontFamily="body"
					>
						<For each={props.lyric?.text}>{(line) => <Text>{line}</Text>}</For>
					</VStack>
				</Stack>
			</Flex>
		</Box>
	);
}
