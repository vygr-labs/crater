import { Box } from "styled-system/jsx";
import { Dynamic, For } from "solid-js/web";
import type { EditorRenderMap, ExportedTheme, ThemeRenderMap } from "./editor-types";

interface Props {
	data: ExportedTheme;
	renderMap: ThemeRenderMap;
}
export default function RenderTheme(props: Props) {
	return (
		<Box pos="relative" w="full" h="full" bgColor="bg.muted">
			<For each={props.data.nodes}>{(node) => <Dynamic component={props.renderMap[node.compName]} node={node} />}</For>
		</Box>
	);
}
