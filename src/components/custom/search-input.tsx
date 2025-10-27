import { Box, type BoxProps } from "styled-system/jsx";
import { Input, type InputProps } from "../ui/input";
import {
	createEffect,
	createMemo,
	For,
	Match,
	Show,
	splitProps,
	Switch,
	type Setter,
} from "solid-js";
import { Text } from "../ui/text";
import { Highlight, useHighlight, type HighlightProps } from "@ark-ui/solid";
import { capitalizeFirstLetter } from "~/utils";

export interface StageMarkData {
	book?: string;
	chapter?: number;
	verse?: number;
	stage: number;
}

interface Props extends InputProps {
	firstBookMatch: string;
	setSearchRef: (el: HTMLInputElement) => void;
	scripture: StageMarkData;
}

export default function SearchInput(_props: Props) {
	const [props, inputProps] = splitProps(_props, [
		"firstBookMatch",
		"setSearchRef",
		"scripture",
	]);

	return (
		<Box w="full" pos="relative" fontSize={14}>
			<Input
				pos="relative"
				zIndex={10}
				variant="outline"
				// borderWidth={2}
				// borderColor="border.emphasized"
				rounded="none"
				border="unset"
				px="2"
				h="9"
				outline="none"
				w="full"
				_selection={{
					bgColor: "blue.600",
				}}
				ref={props.setSearchRef}
				{...inputProps}
			/>
		</Box>
	);
}
