import { Box, HStack, styled, VStack, type BoxProps } from "styled-system/jsx";
import { useNode } from "../Node";
import { useEditor } from "../Editor";
import {
	createEffect,
	createMemo,
	For,
	Index,
	Match,
	onMount,
	Show,
	Switch,
	type JSX,
} from "solid-js";
import { css } from "styled-system/css";
import {
	TbContainer,
	TbPhoto,
	TbRadiusTopLeft,
	TbShadow,
	TbVideo,
} from "solid-icons/tb";
import { ColorPicker } from "~/components/ui/color-picker";
import { ControlIconBtn } from "./Buttons";
import { createStore } from "solid-js/store";
import { parseColor } from "@ark-ui/solid";
import {
	ColorUpdateInput,
	PopoverButton,
	RadioInput,
	SliderWithInput,
} from "./Inputs";
import { token } from "styled-system/tokens";
import { defaultPalette } from "~/utils/constants";
import { defineStyles } from "@pandacss/dev";
import { getNum } from "~/utils";
import { Text } from "~/components/ui/text";
import type { NodeSettings, RenderEditorItemProps } from "../editor-types";
import {
	BsTextCenter,
	BsTextLeft,
	BsTextParagraph,
	BsTextRight,
} from "solid-icons/bs";
import { ImTextHeight, ImTextWidth } from "solid-icons/im";
import { VsLink } from "solid-icons/vs";
import { FiLink } from "solid-icons/fi";
import GenericCombobox from "~/components/custom/combobox";
import { IconButton } from "~/components/ui/icon-button";
import { RadioGroup } from "~/components/ui/radio-group";
import { Field } from "~/components/ui/field";
import { Dynamic } from "solid-js/web";
import type { TextAlign } from "~/types";

interface EditorContainer extends BoxProps {}

export default function EditorText(props: EditorContainer) {
	const { node, register, styles, bindDrag } = useNode();

	createEffect(() => {
		console.log("Here is the node: ", node);
	});

	return (
		<Box
			position="absolute"
			ref={register}
			{...bindDrag()}
			style={styles}
			transformOrigin="top left"
		>
			<Text userSelect="none">{node.data.text}</Text>
			{/* use:draggable */}
		</Box>
	);
}

export function RenderEditorText(props: RenderEditorItemProps) {
	createEffect(() => {
		console.log("Rendering node: ", props.node);
	});

	return (
		<Box
			position="absolute"
			style={props.node.style}
			transformOrigin="top left"
		>
			<Text userSelect="none">{props.node.data.text}</Text>
			{/* use:draggable */}
		</Box>
	);
}

enum LINKAGES {
	SCRIPTURE_REFERENCE,
	SCRIPTURE_TEXT,
	SONG_LYRIC,
	CUSTOM,
}
const textLinkOptions = [
	{ value: LINKAGES.SCRIPTURE_REFERENCE, text: "Scripture Reference" },
	{ value: LINKAGES.SCRIPTURE_TEXT, text: "Scripture Text" },
	{ value: LINKAGES.SONG_LYRIC, text: "Lyric" },
	{ value: LINKAGES.CUSTOM, text: "Custom" },
];

const textAlignMap = {
	left: BsTextLeft,
	center: BsTextCenter,
	right: BsTextRight,
};

export interface EditorTextSettingsProps extends NodeSettings {}
export function EditorTextSettings(props: EditorTextSettingsProps) {
	const {
		editor,
		// getters: { getSelectedNode },
		setters: { setNodeStyle, setNodeData },
	} = useEditor();
	const styles = createMemo(() => {
		console.log("Recalculating Styles");
		return props.node?.style ?? {};
	});

	onMount(() => {
		console.log("Settings are being mounted for: ", props.node);
	});
	createEffect(() => {
		console.log("Here is the selected node: ", props.node);
	});

	return (
		<Show when={props.visible}>
			{(selected) => {
				console.log("getting setStyle fn for: ", selected());
				const setStyle = (styles: JSX.CSSProperties) =>
					setNodeStyle(props.node.id, styles);
				const setData = (data: Record<string, any>) =>
					setNodeData(props.node.id, data);
				return (
					<HStack w="full" gap={4} rounded="md">
						<GenericCombobox maxWidth={36} />

						<ColorUpdateInput
							styleKey="color"
							styles={styles()}
							setStyle={setStyle}
						/>

						<PopoverButton
							trigger={
								<ControlIconBtn>
									<BsTextParagraph />
								</ControlIconBtn>
							}
						>
							<HStack>
								<For each={Object.entries(textAlignMap)}>
									{([value, icon]) => (
										<IconButton
											variant={
												styles()["text-align"] === value ? "solid" : "surface"
											}
											size="md"
											onclick={() =>
												setStyle({ "text-align": value as TextAlign })
											}
										>
											<Dynamic component={icon} />
										</IconButton>
									)}
								</For>
								{/* <IconButton variant={styles()["text-align"] === "center" ? "solid" : "surface"} size="md">
									<BsTextCenter />
								</IconButton>
								<IconButton variant={styles()["text-align"] === "right" ? "solid" : "surface"} size="md">
									<BsTextRight />
								</IconButton> */}
							</HStack>
						</PopoverButton>

						<PopoverButton
							trigger={
								<ControlIconBtn>
									<ImTextHeight />
								</ControlIconBtn>
							}
						>
							<SliderWithInput
								styleKey="line-height"
								label={<ImTextHeight size={14} />}
								styles={styles()}
								setStyle={setStyle}
							/>
						</PopoverButton>

						<PopoverButton
							trigger={
								<ControlIconBtn>
									<ImTextWidth />
								</ControlIconBtn>
							}
						>
							<SliderWithInput
								styleKey="letter-spacing"
								label={<ImTextWidth size={16} />}
								styles={styles()}
								setStyle={setStyle}
								rootProps={{ max: 20 }}
							/>
						</PopoverButton>

						<PopoverButton
							trigger={
								<ControlIconBtn>
									<FiLink />
								</ControlIconBtn>
							}
						>
							<RadioInput
								options={textLinkOptions}
								label="Link Text"
								value={props.node.data.linkage}
								onValueChange={(d) => setData({ linkage: d.value })}
							/>

							<Switch>
								<Match when={props.node.data.linkage === LINKAGES.CUSTOM}>
									<Field.Root mt={4}>
										<Field.Label fontSize="xs" fontWeight={400}>
											Update Text
										</Field.Label>
										<Field.Textarea
											colorPalette="purple"
											bg="bg.muted"
											border="2px solid"
											borderColor="purple.700"
											py={1.5}
											px={3}
											value={props.node.data.text}
											oninput={(e) => setData({ text: e.target.value })}
											autoresize
										/>
										<Field.HelperText>Some additional Info</Field.HelperText>
										<Field.ErrorText>Error Info</Field.ErrorText>
									</Field.Root>
								</Match>
							</Switch>
						</PopoverButton>
					</HStack>
				);
			}}
		</Show>
	);
}

EditorText.config = {
	defaultData: {
		linkage: LINKAGES.CUSTOM,
		text: "Learning New Things",
		// bgColor: defaultPalette
	},
	defaultStyles: {
		width: "160px",
		height: "50px",
		color: token(`colors.whiteAlpha.900`),
		"line-height": "20px",
		"text-align": "left",
		"z-index": 20,
	},
	settings: EditorTextSettings,
};
