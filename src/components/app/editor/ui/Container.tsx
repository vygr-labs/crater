import { Box, HStack, VStack, type BoxProps } from "styled-system/jsx";
import { useNode } from "../Node";
import { useEditor } from "../Editor";
import { createEffect, createMemo, Match, onMount, Show, Switch, type JSX } from "solid-js";
import { TbBorderRadius, TbPhoto, TbRadiusTopLeft } from "solid-icons/tb";
import { ControlIconBtn } from "./Buttons";
import { ColorUpdateInput, PopoverButton, SliderWithInput } from "./Inputs";
import { token } from "styled-system/tokens";
import { defaultPalette } from "~/utils/constants";
import { AiOutlineRadiusBottomleft, AiOutlineRadiusBottomright, AiOutlineRadiusSetting, AiOutlineRadiusUpleft, AiOutlineRadiusUpright } from "solid-icons/ai";
import type { NodeSettings, RenderEditorItemProps } from "../editor-types";
import { HiSolidPhoto } from "solid-icons/hi";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";

interface EditorContainer extends BoxProps {}

export default function EditorContainer(props: EditorContainer) {
	const { node, register, styles, bindDrag } = useNode();

	createEffect(() => {
		console.log("Here is the node: ", node);
	});

	return (
		<Box position="absolute" ref={register} {...bindDrag()} style={styles} transformOrigin="top left" />
	);
}

export function RenderEditorContainer(props: RenderEditorItemProps) {
	createEffect(() => {
		console.log("Rendering node: ", props.node);
	});

	return (
		<Box position="absolute" style={props.node.style} transformOrigin="top left" />
	);
}

export interface EditorContainerSettings extends NodeSettings {}
export function EditorContainerSettings(props: EditorContainerSettings) {
	const {
		editor,
		// getters: { getSelectedNode },
		setters: { setNodeStyle },
	} = useEditor();
	const styles = createMemo(() => {
		console.log("Recalculating Styles");
		return props.node?.style ?? {};
	});

	onMount(() => {
		console.log("Settings are being Mounted: ", props.node);
	});

	createEffect(() => {
		console.log("Here is the selected node: ", props.node);
	});
	const setStyle = (styles: JSX.CSSProperties) => setNodeStyle(props.node?.id, styles);

	const handleChangeBackground = () => {}
 
	return (
		<Show when={props.visible}>
			<HStack w="full" gap={4} rounded="md">
				<ColorUpdateInput styleKey="background-color" styles={styles()} setStyle={setStyle} />

				<PopoverButton
					trigger={
						<ControlIconBtn>
							<TbBorderRadius />
						</ControlIconBtn>
					}
				>
					<VStack>
						<SliderWithInput styleKey="border-top-left-radius" label={<AiOutlineRadiusUpleft size={24} />} styles={styles()} setStyle={setStyle} />
						<SliderWithInput styleKey="border-top-right-radius" label={<AiOutlineRadiusUpright size={24} />} styles={styles()} setStyle={setStyle} />
						<SliderWithInput styleKey="border-bottom-left-radius" label={<AiOutlineRadiusBottomleft size={24} />} styles={styles()} setStyle={setStyle} />
						<SliderWithInput styleKey="border-bottom-right-radius" label={<AiOutlineRadiusBottomright size={24} />} styles={styles()} setStyle={setStyle} />
					</VStack>
				</PopoverButton>

				<PopoverButton
					enabled={false}
					trigger={
						<ControlIconBtn onclick={handleChangeBackground}>
							<HiSolidPhoto />
						</ControlIconBtn>
					}
				>
					<VStack>
						<Button>Change Background</Button>
					</VStack>
				</PopoverButton>
			</HStack>
		</Show>
	);
}

EditorContainer.config = {
	defaultData: {
		// bgColor: defaultPalette
	},
	defaultStyles: {
		width: "50px",
		height: "160px",
		"background-color": token(`colors.${defaultPalette}.800`),
		"z-index": 10,
	},
	settings: EditorContainerSettings,
};
