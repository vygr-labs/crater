import { Box, Flex, Stack } from "styled-system/jsx";
import { Text } from "~/components/ui/text";
import type { StrongsSection } from "~/types/context";
import { getFocusableStyles } from "~/utils";
import { PREVIEW_INDEX_WIDTH } from "~/utils/constants";
import { css } from "styled-system/css";

interface Props {
	index: number;
	entry: StrongsSection;
	isFocusItem: boolean;
	panelName: string;
	isCurrentPanel: boolean;
}

export default function StrongsDisplay(props: Props) {
	const isHebrew = () => props.entry.word.startsWith("H");

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
				<Stack gap={0} w="full">
					{/* Header with Strong's number and section label */}
					<Flex px={2} pt={2} gap={2} alignItems="center">
						<Box
							px={2}
							py={0.5}
							bg={isHebrew() ? "blue.800" : "green.800"}
							borderRadius="md"
							fontFamily="mono"
							fontWeight="bold"
							fontSize="sm"
						>
							{props.entry.word}
						</Box>
						<Text
							style={getFocusableStyles(
								"LYRICS_TEXT_CONTAINER",
								props.isFocusItem,
								props.isCurrentPanel,
							)}
							fontWeight={600}
							fontSize="sm"
							color="gray.400"
						>
							{props.entry.label}
						</Text>
						<Text fontSize="xs" color="gray.600">
							({props.entry.sectionIndex + 1}/{props.entry.totalSections})
						</Text>
					</Flex>

					{/* Section content */}
					<Box
						py={2}
						px={2}
						style={getFocusableStyles(
							"LYRICS_TEXT_CONTAINER",
							props.isFocusItem,
							props.isCurrentPanel,
						)}
						fontFamily="body"
						class={css({
							"& p": {
								marginBottom: "0.5rem",
								lineHeight: 1.5,
							},
							"& strong": {
								color: "var(--colors-gray-100)",
								fontWeight: 600,
							},
							"& ol": {
								paddingLeft: "1.5rem",
								marginBottom: "0.5rem",
								listStyleType: "decimal",
							},
							"& ul": {
								paddingLeft: "1.5rem",
								marginBottom: "0.5rem",
								listStyleType: "disc",
							},
							"& li": {
								marginBottom: "0.35rem",
								lineHeight: 1.5,
								display: "list-item",
							},
							"& ol[type='a'], & ol[type='A']": {
								listStyleType: "lower-alpha",
							},
							"& ol[type='i'], & ol[type='I']": {
								listStyleType: "lower-roman",
							},
							"& ol ol, & ul ol": {
								listStyleType: "lower-alpha",
								marginTop: "0.25rem",
							},
							"& ol ol ol, & ul ol ol": {
								listStyleType: "lower-roman",
							},
							"& a.dict": {
								color: "var(--colors-purple-400)",
								textDecoration: "underline",
							},
							"& i": {
								fontStyle: "italic",
								color: "var(--colors-gray-300)",
							},
						})}
						innerHTML={props.entry.content}
					/>
				</Stack>
			</Flex>
		</Box>
	);
}
