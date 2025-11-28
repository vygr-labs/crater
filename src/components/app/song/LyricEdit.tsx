import type { JSX } from "solid-js/jsx-runtime";
import { Box, Flex, HStack } from "styled-system/jsx";
import { Field } from "~/components/ui/field";
import { Text } from "~/components/ui/text";
import { IconButton } from "~/components/ui/icon-button";
import type { SongLyric } from "~/types/context";
import { FiTrash2, FiCopy, FiMove } from "solid-icons/fi";
import { Show } from "solid-js";

interface Props extends SongLyric {
	index: number;
	isCurrentNavig?: boolean;
	canDelete: boolean;
	onLabelEdit: JSX.ChangeEventHandlerUnion<HTMLInputElement, Event>;
	onTextEdit: JSX.ChangeEventHandlerUnion<HTMLTextAreaElement, Event>;
	onActiveEl: () => void;
	onPaste: (
		type: "label" | "text",
		index: number,
		event: ClipboardEvent,
	) => void;
	onDelete: (index: number) => void;
	onDuplicate: (index: number) => void;
}

export default function LyricEdit(props: Props) {
	return (
		<Flex
			w="full"
			gap={2}
			position="relative"
			bgColor="gray.900"
			borderRadius="sm"
			overflow="hidden"
			border="1px solid"
			borderColor="gray.800"
			_hover={{
				// borderColor: "gray.700",
				"& .action-buttons": {
					opacity: 1,
				},
			}}
			transition="border-color 0.2s"
		>
			{/* Index Number & Actions */}
			<Flex
				w="40px"
				minH="full"
				flexDirection="column"
				alignItems="center"
				justifyContent="space-between"
				bgColor="gray.800"
				flexShrink={0}
				py={2}
			>
				<Text fontWeight="semibold" color="gray.400" fontSize="sm">
					{props.index + 1}
				</Text>

				{/* Action Buttons - visible on hover */}
				<Flex
					class="action-buttons"
					flexDirection="column"
					gap={1}
					opacity={0}
					transition="opacity 0.2s"
				>
					<IconButton
						size="xs"
						variant="ghost"
						colorPalette="gray"
						aria-label="Duplicate section"
						title="Duplicate section"
						opacity={0.5}
						_hover={{
							opacity: 1,
						}}
						onClick={() => props.onDuplicate(props.index)}
					>
						<FiCopy size={12} />
					</IconButton>
					<Show when={props.canDelete}>
						<IconButton
							size="xs"
							variant="ghost"
							colorPalette="red"
							aria-label="Delete section"
							title="Delete section"
							opacity={0.5}
							_hover={{
								opacity: 1,
							}}
							onClick={() => props.onDelete(props.index)}
						>
							<FiTrash2 size={12} />
						</IconButton>
					</Show>
				</Flex>
			</Flex>

			{/* Input Fields */}
			<Field.Root w="full" gap={1} py={2} pr={3} on:focusin={props.onActiveEl}>
				<Field.Input
					id={"song-edit-label-" + props.index}
					px={2}
					placeholder="Section label (e.g., Verse 1, Chorus)"
					value={props.label}
					h={8}
					fontSize="sm"
					variant="flushed"
					onchange={props.onLabelEdit}
					borderRadius="xs"
					bgColor="transparent"
					_hover={{
						bgColor: "gray.800",
					}}
					_focusVisible={{
						outline: "none",
						bgColor: "gray.800",
						ring: "2px",
						ringColor: "purple.600",
					}}
					color="gray.300"
					fontWeight="medium"
					data-key={`label-${props.index}`}
					data-type="label"
					data-index={props.index}
					ref={(el) => {
						if (props.index === 0) {
							el.focus();
						}
					}}
					onpaste={(e) => props.onPaste("label", props.index, e)}
				/>
				<Field.Textarea
					id={"song-edit-text-" + props.index}
					px={2}
					py={2}
					w="full"
					minH="60px"
					lineHeight={1.6}
					autoresize
					variant="flushed"
					borderRadius="xs"
					bgColor="transparent"
					_hover={{
						bgColor: "gray.800",
					}}
					_focusVisible={{
						outline: "none",
						bgColor: "gray.800",
						ring: "2px",
						ringColor: "purple.600",
					}}
					scrollbar="hidden"
					overflow="hidden"
					placeholder="Enter lyrics here..."
					value={props.text.join("\n")}
					oninput={props.onTextEdit}
					color="white"
					fontSize="sm"
					data-key={`text-${props.index}`}
					data-type="text"
					data-index={props.index}
					onpaste={(e) => props.onPaste("text", props.index, e)}
				/>
			</Field.Root>
		</Flex>
	);
}
