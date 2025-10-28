import { ref } from "process";
import type { JSX } from "solid-js/jsx-runtime";
import { Box, Flex, VStack } from "styled-system/jsx";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { Textarea } from "~/components/ui/textarea";
import type { SongLyric } from "~/types/context";
import { defaultPalette, PREVIEW_INDEX_WIDTH } from "~/utils/constants";

interface Props extends SongLyric {
	index: number;
	isCurrentNavig?: boolean;
	onLabelEdit: JSX.ChangeEventHandlerUnion<HTMLInputElement, Event>;
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
			<Field.Root
				w="full"
				gap={0}
				// borderBottom="unset"
			>
				<Field.Input
					id={"song-edit-label-" + props.index}
					px={2}
					placeholder="Label"
					value={props.label}
					h={8}
					variant="subtle"
					onchange={props.onLabelEdit}
					border="2px solid"
					borderColor="gray.800"
					borderBottomColor="transparent"
					rounded="unset"
					_focusVisible={{
						outline: "unset",
						borderColor: "purple.800",
					}}
					color="white"
					data-key={`label-${props.index}`}
					data-type="label"
					data-index={props.index}
					ref={(el) => {
						if (props.index === 0) {
							console.log(el);
							el.focus();
						}
					}}
				/>
				<Field.Textarea
					id={"song-edit-text-" + props.index}
					px={2}
					minH={9}
					lineHeight={1.5}
					autoresize
					variant="flushed"
					rows={1}
					border="2px solid"
					borderColor="gray.800"
					borderTopColor="transparent"
					_focusVisible={{
						borderColor: "purple.800",
					}}
					scrollbar="hidden"
					overflow="hidden"
					placeholder="Lyrics"
					value={props.text.join("\n")}
					onchange={props.onTextEdit}
					data-key={`text-${props.index}`}
					data-type="text"
					data-index={props.index}
					// border="unset"
				/>
			</Field.Root>
		</Flex>
	);
}
