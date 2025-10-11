import type { ParentProps, Ref } from "solid-js"
import { Button, type ButtonProps } from "~/components/ui/button";
import { defaultPalette } from "~/utils/constants";
import { useEditor } from "../Editor";
import { HStack } from "styled-system/jsx";
import { IoText } from "solid-icons/io";
import { TbContainer, TbShadow } from "solid-icons/tb";
import EditorContainer from "./Container";

interface ControlBtnProps extends ParentProps {
    connector?: (ref: HTMLElement) => void;
    extraProps?: ButtonProps;
    ref: Ref<HTMLButtonElement>;
}

const ControlBtn = (props: ControlBtnProps) => (
    <Button
        ref={props.ref}
        size="sm"
        variant="surface"
        colorPalette={defaultPalette}
        {...props.extraProps}
    >
        {props.children}
    </Button>
)

export const Toolbox = () => {
    const { connectors } = useEditor()
    let containerBtnRef!: HTMLButtonElement

    const handleClick = () => {
        connectors.create(containerBtnRef, EditorContainer);
    }

    return (
        <HStack gap={3} mb={3}>
            {/* bg="gray.900" py={2.5} px={3} */}
            {/* <ControlBtn connector={ref => connectors.create(ref, <EditorText text="Blank text" />)}>
					<IoText /> Text
				</ControlBtn> */}
            <ControlBtn
                ref={containerBtnRef}
                extraProps={{
                    onclick: handleClick
                }}
            >
                <TbContainer /> Container
            </ControlBtn>
            {/* <ControlBtn>
                <TbShadow />
                Select BG
            </ControlBtn> */}
        </HStack>
    )
}
