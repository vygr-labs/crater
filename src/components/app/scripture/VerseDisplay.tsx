import { For } from "solid-js";
import { Box, Flex, Stack } from "styled-system/jsx";
import { Text } from "~/components/ui/text";
import type { SongLyric } from "~/types/context";
import { defaultPalette, PREVIEW_INDEX_WIDTH } from "~/utils/constants";

interface Props {
    index: number;
    lyric: SongLyric;
    isFocusItem: boolean;
}

export default function LyricDisplay(props: Props) {
    const isHovered = false;
    return (
        <Box
			class="disable-child-clicks transition-children-backgrounds"
			userSelect="none"
			py={1}
			mb="4"
			height="unset"
			data-focusId={props.index}
			// onMouseEnter={() => setIsHovered(true)}
			// onMouseLeave={() => setIsHovered(false)}
		>
			<Flex
				w="full"
				h="full"
				// bgColor={
				// 	isCurrentNavig ? `${defaultPalette}.800` : isHovered ? `${defaultSupportingPalette}.800` : 'transparent'
				// }
				fontSize="14px"
				gap={0.5}
				position="relative"
				pl={PREVIEW_INDEX_WIDTH}
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
					bgColor={
						props.isFocusItem ? `${defaultPalette}.700` : isHovered ? `${defaultPalette}.700/50` : 'gray.800'
					}
				>
					<Text>{props.index + 1}</Text>
				</Box>
				<Stack gap={0}>
					{props.lyric.label ? (
						<Box px={2} pt={2}>
							<Text
								textTransform="capitalize"
								color={
									props.isFocusItem
										? 'gray.100'
										: isHovered
											? 'gray.100'
											: 'initial'
								}
								fontWeight={600}
							>
								{props.lyric.label}
							</Text>
						</Box>
					) : null}

					<Box
						pt={1}
						pb={2}
						px={2}
						color={
							props.isFocusItem ? 'gray.200' : isHovered ? 'gray.200' : 'fg.muted'
						}
						fontFamily="body"
					>
                        <For each={props.lyric?.text}>
                            {((line) => <Text>{line}</Text>)}
                        </For>
					</Box>
				</Stack>
			</Flex>
		</Box>
    )
}