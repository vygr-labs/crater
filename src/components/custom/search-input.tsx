import { Box } from "styled-system/jsx";
import { Input, type InputProps } from "../ui/input";
import { createEffect, createMemo, For, Show, type Setter } from "solid-js";
import { Text } from "../ui/text";
import { Highlight, useHighlight, type HighlightProps } from "@ark-ui/solid";

export interface StageMarkData {
	book?: string;
	chapter?: number;
	verse?: number;
	stage?: number;
	searching?: boolean;
	fullText?: string;
	portion?: string;
	stageLength?: number;
}

interface Props extends InputProps {
	firstBookMatch: string;
	setHighlightRef: (el: HTMLParagraphElement) => void;
	scripture: StageMarkData;
}

export default function SearchInput(props: Props) {
	// const inputRef = useRef<HTMLInputElement>(null)

	// useEffect(() => {
	// 	inputRef.current.select() // Select all text in the input when it mounts
	// }, [value])

	return (
		<Box w="full" pos="relative" fontSize={14}>
			<Input
				pos="relative"
				zIndex={10}
				variant="outline"
				ref={props.ref}
				// borderWidth={2}
				// borderColor="border.emphasized"
				rounded="none"
				border="unset"
				px="2"
				h="9"
				outline="none"
				w="full"
				_selection={{
					bgColor: "#3A3A3A",
				}}
				value={props.value}
				{...props}
			/>

			<Show when={props.scripture && props.scripture.searching}>
				<Text
					pos="absolute"
					top={0}
					left={0}
					border="unset"
					alignContent="center"
					rounded="none"
					px="2"
					h="9"
					outline="none"
					w="full"
					color="white"
				>
					<ScriptureHighlight {...props.scripture}></ScriptureHighlight>
				</Text>
			</Show>
		</Box>
	);
}

const ScriptureHighlight = (props: StageMarkData) => {
	const breakers = [" ", ":", ""];
	const chunks = createMemo(() => [
		props.book?.toString(),
		props.chapter?.toString(),
		props.verse?.toString(),
	]);
	return (
		<For each={chunks()}>
			{(text, index) => (
				<>
					<Show when={index() === props.stage} fallback={text}>
						{text?.slice(0, props.stageLength)}
						<Box as="mark" bgColor="blue.600" color="white">
							{text?.slice(props.stageLength)}
						</Box>
					</Show>
					{breakers[index()]}
				</>
			)}
		</For>
	);
};
