import type { JSXElement, ParentProps, Ref } from "solid-js";
import { Button, type ButtonProps } from "~/components/ui/button";
import { defaultPalette } from "~/utils/constants";
import { useEditor } from "../Editor";
import { Box, Divider, HStack } from "styled-system/jsx";
import { IoText } from "solid-icons/io";
import {
	TbContainer,
	TbPhoto,
	TbRadiusTopLeft,
	TbShadow,
	TbTextCaption,
} from "solid-icons/tb";
import EditorContainer from "./Container";
import { IconButton, type IconButtonProps } from "~/components/ui/icon-button";
import { ColorPicker } from "~/components/ui/color-picker";
import { FaSolidBezierCurve } from "solid-icons/fa";
import RenderEditorSettings from "./RenderEditorSettings";
import EditorText from "./Text";
import type { EditorRenderComponent } from "../editor-types";

interface ControlBtnProps extends ParentProps {
	editorComponent: EditorRenderComponent;
	extraProps?: ButtonProps;
}

const AddNodeBtn = (props: ControlBtnProps) => {
	const { connectors } = useEditor();
	return (
		<IconButton
			size="sm"
			variant="surface"
			colorPalette={defaultPalette}
			onclick={() => connectors.create(props.editorComponent)}
			{...props.extraProps}
		>
			{props.children}
		</IconButton>
	);
};

export const Toolbox = () => {
	let containerBtnRef!: HTMLButtonElement;

	return (
		<HStack gap={5} mb={3} h={10} position="relative" zIndex={1000}>
			{/* border="2px solid" borderColor="bg.emphasized" */}
			{/* bg="gray.900" py={2.5} px={3} */}
			{/* <ControlBtn connector={ref => connectors.create(ref, <EditorText text="Blank text" />)}>
					<IoText /> Text
				</ControlBtn> */}
			<HStack gap={3}>
				<AddNodeBtn editorComponent={EditorContainer}>
					<TbContainer />
				</AddNodeBtn>

				<AddNodeBtn editorComponent={EditorText}>
					<TbTextCaption />
				</AddNodeBtn>
			</HStack>
			<Divider
				orientation="vertical"
				thickness="2"
				h={7}
				color="bg.emphasized"
			/>
			<RenderEditorSettings />
			{/* <ControlBtn>
                <TbShadow />
                Select BG
            </ControlBtn> */}
		</HStack>
	);
};
