import { Box } from "styled-system/jsx";
import { Dynamic, For } from "solid-js/web";
import type {
	EditorRenderMap,
	ExportedTheme,
	ThemeRenderMap,
} from "./editor-types";

interface Props {
	data: ExportedTheme;
	renderMap: ThemeRenderMap;
	extraProps?: Record<string, any>;
}
export default function RenderTheme(props: Props) {
	return (
		<Box
			pos="relative"
			w="full"
			h="full"
			bgColor="transparent"
			overflow="hidden"
		>
			<For each={props.data?.nodes ?? []}>
				{(node) => (
					<Dynamic
						component={props.renderMap[node.compName]}
						node={node}
						extraData={props.extraProps}
					/>
				)}
			</For>
		</Box>
	);
}
