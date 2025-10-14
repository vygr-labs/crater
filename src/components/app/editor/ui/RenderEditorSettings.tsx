import { Box } from "styled-system/jsx";
import { useEditor } from "../Editor";
import { Dynamic, For, Match, Switch } from "solid-js/web";
import NodeProvider, { NodeContext } from "../Node";
import { createEffect, createMemo, Show } from "solid-js";

export default function RenderEditorSettings() {
	const {
		getters: { getSelectedNode, getRenderMap },
	} = useEditor();

	createEffect(() => {
		console.log("selectedNode has changed", getSelectedNode(), getSelectedNode()?.comp.config.settings);
	});

	return (
		<For each={Object.values(getRenderMap())}>
			{(comp) => {
				const isCurrent = () => getSelectedNode()?.compName === comp.name;
				return <Dynamic component={comp.config.settings} node={isCurrent() ? getSelectedNode() : null} visible={isCurrent()} />;
			}}
		</For>
	);
}
