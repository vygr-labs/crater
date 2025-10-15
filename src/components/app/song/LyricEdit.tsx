import type { JSX } from "solid-js/jsx-runtime";
import { Box, Flex, VStack } from "styled-system/jsx";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { Textarea } from "~/components/ui/textarea";
import type { SongLyric } from "~/types/context";
import { defaultPalette, PREVIEW_INDEX_WIDTH } from "~/utils/constants";

interface Props extends SongLyric {
	index: number;
	isCurrentNavig?: boolean;
	onLabelEdit: (e: InputEvent) => void;
	onTextEdit: JSX.ChangeEventHandlerUnion<HTMLTextAreaElement, Event>;
}

export default function LyricEdit(props: Props) {
	return (
		<Flex
			w="full"
			h="full"
			// bgColor={isCurrentNavig ? `${defaultPalette}.800` : 'transparent'}
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
				// bgColor={isCurrentNavig ? `${defaultPalette}.700` : 'gray.800'}
			>
				<Text>{props.index + 1}</Text>
			</Box>
			<VStack
				w="full"
				gap={0}
				border="1px solid"
				borderColor="gray.800"
				borderBottom="unset"
			>
				<Input
					px={2}
					placeholder="Label"
					value={props.label}
					h={8}
					variant="flushed"
					onInput={props.onLabelEdit}
					colorPalette="yellow"
					color="white"
					data-key={`label-${props.index}`}
					data-type="label"
					data-index={props.index}
				/>
				<Textarea
					px={2}
					minH={9}
					lineHeight={1.5}
					autoresize
					variant="flushed"
					rows={1}
					scrollbar="hidden"
					overflow="hidden"
					placeholder="Lyrics"
					value={props.text.join("\n")}
					onChange={props.onTextEdit}
					colorPalette="yellow"
					data-key={`text-${props.index}`}
					data-type="text"
					data-index={props.index}
					// border="unset"
				/>
			</VStack>
		</Flex>
	);
}
