import { Box } from "styled-system/jsx";
import { useEditor } from "../Editor";
import { Dynamic, For, Match, Switch } from "solid-js/web";
import NodeProvider, { NodeContext } from "../Node";
import { createEffect } from "solid-js";

export default function RenderEditorSettings() {
    const { editor, getters: { getSelectedNode } } = useEditor();    

    createEffect(() => {
        console.log("selectedNode has changed", getSelectedNode(), getSelectedNode()?.comp.config.settings)
    })

    return (
        <Switch>
            <Match when={getSelectedNode()}>
                <Dynamic component={getSelectedNode()?.comp.config.settings} />
            </Match>
        </Switch>
    )
}