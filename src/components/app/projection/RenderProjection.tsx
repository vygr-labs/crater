import { Box } from "styled-system/jsx";
import LogoBackground from "./LogoBackground";
import RenderTheme from "../editor/RenderTheme";
import { RenderEditorContainer } from "../editor/ui/Container";
import { RenderEditorText } from "../editor/ui/Text";
import { useAppContext } from "~/layouts/AppContext";
import { Match, Switch } from "solid-js";
import RenderImage from "./RenderImage";
import { parseThemeData } from "~/utils";

export const defaultThemeRenderMap = {
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
				<Match when={appStore.displayData.displayContent?.type === "scripture"}>
					<RenderTheme
						data={parseThemeData(
							appStore.displayData.scriptureTheme?.theme_data,
						)}
						renderMap={defaultThemeRenderMap}
					/>
				</Match>
				<Match when={appStore.displayData.displayContent?.type === "song"}>
					<RenderTheme
						data={parseThemeData(appStore.displayData.songTheme?.theme_data)}
						renderMap={defaultThemeRenderMap}
					/>
				</Match>
				<Match when={appStore.displayData.displayContent?.type === "image"}>
					<RenderImage imageData={appStore.displayData.displayContent?.image} />
				</Match>
			</Switch>
		</Box>
	);
}
