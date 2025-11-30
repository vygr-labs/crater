import { Box, Flex } from "styled-system/jsx";
import { Text } from "~/components/ui/text";
import type { StrongsSection } from "~/types/context";
import { css } from "styled-system/css";
import { createEffect, onMount, Show } from "solid-js";
import TextFill from "~/utils/textfill";

interface Props {
	strongsData: StrongsSection | undefined;
}

export default function RenderStrongs(props: Props) {
	let contentRef!: HTMLDivElement;

	const isHebrew = () => props.strongsData?.word.startsWith("H");

	// Apply TextFill when content changes
	createEffect(() => {
		if (contentRef && props.strongsData) {
			// Small delay to ensure DOM is ready
			setTimeout(() => {
				TextFill(contentRef, {
					innerTag: "div",
					maxFontPixels: 72,
					minFontPixels: 14,
					changeLineHeight: true,
				});
			}, 50);
		}
	});

	return (
		<Show when={props.strongsData}>
			<Flex w="full" h="full" flexDir="column" p={6} gap={4}>
				{/* Header with Strong's number and section label - 10% */}
				<Flex
					gap={4}
					alignItems="center"
					justifyContent="flex-start"
					h="10%"
					flexShrink={0}
				>
					<Box
						px={4}
						py={2}
						bg={isHebrew() ? "blue.700" : "green.700"}
						borderRadius="lg"
						fontFamily="mono"
						fontWeight="bold"
						fontSize="3xl"
					>
						{props.strongsData!.word}
					</Box>
					<Text fontWeight={600} fontSize="2xl" color="gray.300">
						{props.strongsData!.label}
					</Text>
					<Show when={props.strongsData!.totalSections > 1}>
						<Text fontSize="xl" color="gray.500">
							({props.strongsData!.sectionIndex + 1}/
							{props.strongsData!.totalSections})
						</Text>
					</Show>
				</Flex>

				{/* Main content area - 90% with TextFill */}
				<Box
					ref={contentRef}
					h="90%"
					w="full"
					overflow="hidden"
					textAlign="left"
				>
					<Box
						fontFamily="body"
						lineHeight={1.5}
						class={css({
							"& p": {
								marginBottom: "0.5em",
								lineHeight: 1.5,
							},
							"& strong": {
								color: "var(--colors-gray-100)",
								fontWeight: 600,
							},
							// Base list styles
							"& ol, & ul": {
								paddingLeft: "1.5em",
								marginBottom: "0.5em",
							},
							"& li": {
								marginBottom: "0.25em",
								lineHeight: 1.5,
								display: "list-item",
							},
							// Alternating pattern: 1 > a > 1 > a > 1 > a...
							// Level 1: decimal (1, 2, 3)
							"& ol": {
								listStyleType: "decimal",
							},
							// Level 2: lower-alpha (a, b, c)
							"& ol ol, & ol ul, & ul ol": {
								listStyleType: "lower-alpha",
								marginTop: "0.25em",
							},
							// Level 3: decimal (1, 2, 3)
							"& ol ol ol, & ol ol ul, & ol ul ol, & ul ol ol": {
								listStyleType: "decimal",
							},
							// Level 4: lower-alpha (a, b, c)
							"& ol ol ol ol, & ol ol ol ul, & ol ol ul ol, & ol ul ol ol, & ul ol ol ol":
								{
									listStyleType: "lower-alpha",
								},
							// Level 5: decimal (1, 2, 3)
							"& ol ol ol ol ol, & ol ol ol ol ul, & ol ol ol ul ol, & ol ol ul ol ol, & ol ul ol ol ol, & ul ol ol ol ol":
								{
									listStyleType: "decimal",
								},
							// Level 6: lower-alpha (a, b, c)
							"& ol ol ol ol ol ol": {
								listStyleType: "lower-alpha",
							},
							"& ul": {
								listStyleType: "disc",
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
						innerHTML={props.strongsData!.content}
					/>
				</Box>
			</Flex>
		</Show>
	);
}
