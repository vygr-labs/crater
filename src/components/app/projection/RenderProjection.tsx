import { Box } from "styled-system/jsx";
import LogoBackground from "./LogoBackground";
import RenderTheme from "../editor/RenderTheme";
import { RenderEditorContainer } from "../editor/ui/Container";
import { RenderEditorText } from "../editor/ui/Text";
import { useAppContext } from "~/layouts/AppContext";
import { Match, Switch } from "solid-js";
import RenderImage from "./RenderImage";

const themeRenderMap = {
	EditorContainer: RenderEditorContainer,
	EditorText: RenderEditorText,
};

export default function RenderProjection() {
	const { appStore } = useAppContext();

	return (
		<Box
			as="main"
			cursor="none"
			h="full"
			maxW="vw"
			maxH="vh"
			display="flex"
			flexDir="column"
			justifyContent="space-between"
			bg="transparent"
			color="white"
			transition="0.5s ease-in-out"
			opacity="1"
			translateY="0"
			classList={{
				"clear-display": appStore.hideLive,
			}}
		>
			<LogoBackground />
			{/* Live Display */}
			<Switch>
				<Match when={appStore.displayData?.type === "scripture"}>
					<RenderTheme
						data={JSON.parse(appStore.scriptureTheme?.theme_data ?? "{}")}
						renderMap={themeRenderMap}
					/>
				</Match>
				<Match when={appStore.displayData?.type === "song"}>
					<RenderTheme
						data={JSON.parse(appStore.songTheme?.theme_data ?? "{}")}
						renderMap={themeRenderMap}
					/>
				</Match>
				<Match when={appStore.displayData?.type === "image"}>
					<RenderImage imageData={appStore.displayData?.image} />
				</Match>
			</Switch>
		</Box>
	);
}
