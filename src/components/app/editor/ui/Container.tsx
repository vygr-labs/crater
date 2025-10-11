import { Box, styled, type BoxProps } from "styled-system/jsx";
import { useNode } from "../Node";
import { useEditor } from "../Editor";
import { createEffect, Show, type JSX } from "solid-js";
import { defaultPalette } from "~/utils/constants";
import { css } from "styled-system/css";
import { animated } from "solid-spring";
import { ColorUpdateInput } from "./Inputs";

interface EditorContainer extends BoxProps { }

export default function EditorContainer(props: EditorContainer) {
    const { editor } = useEditor();
    const { node, register, styles, bindDrag } = useNode();
    const magicNum = () => Object.keys(editor.nodes).findIndex(id => id === node.id)

    createEffect(() => {
        console.log("Here is the node: ", node)
    })

    return (
        <Box position="absolute" ref={register} class={css({ w: 50, h: 40, bgColor: "purple.800" })} {...bindDrag()} style={styles} transformOrigin="top left">
            {/* use:draggable */}
        </Box>
    )
}


export function EditorContainerSettings(props: EditorContainer) {
    const { editor, getters: { getSelectedNode }, setters: { setNodeStyle } } = useEditor();

    createEffect(() => {
        console.log("Here is the selected node: ", getSelectedNode())
    })

    return (
        <Show when={getSelectedNode()}>
            {
                selected => (
                    <Box>
                        <ColorUpdateInput label="Text Color" defaultValue={selected().style["background-color"]} styleKey="background-color" setStyle={(style: JSX.CSSProperties) => setNodeStyle(selected().id, style)} />
                    </Box>
                )
            }
        </Show>
    )
}

EditorContainer.config = {
    props: {
        width: 300,
        height: 300,
        // bgColor: defaultPalette
    },
    settings: EditorContainerSettings
}