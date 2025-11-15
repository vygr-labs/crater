import { Box } from "styled-system/jsx";
import LogoBackground from "./LogoBackground";
import RenderTheme from "../editor/RenderTheme";
import { RenderEditorContainer } from "../editor/ui/Container";
import { RenderEditorText } from "../editor/ui/Text";
import { useAppContext } from "~/layouts/AppContext";
import { Match, Show, Switch } from "solid-js";
import RenderImage from "./RenderImage";
import { parseThemeData } from "~/utils";
import RenderVideo from "./RenderVideo";
import { Text } from "~/components/ui/text";

export const defaultThemeRenderMap = {
	EditorContainer: RenderEditorContainer,
	EditorText: RenderEditorText,
};

const NoThemeError = (props: { type: string }) => (
	<Text
		fontSize="6xl"
		textTransform="uppercase"
		h="full"
		alignContent="center"
		textAlign="center"
	>
		Default {props.type} theme has not been set
	</Text>
);

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
			<Box
				w="full"
				h="full"
				style={{
					opacity: appStore.showLogo ? 0 : 1,
					visibility: appStore.showLogo ? "hidden" : "visible",
				}}
			>
				{/* Live Display */}
				<Switch>
					<Match
						when={appStore.displayData.displayContent?.type === "scripture"}
					>
						<Show
							when={appStore.displayData.scriptureTheme}
							fallback={<NoThemeError type="scripture" />}
						>
							<RenderTheme
								data={parseThemeData(
									appStore.displayData.scriptureTheme?.theme_data,
								)}
								renderMap={defaultThemeRenderMap}
								extraProps={{ isProjectionDisplay: true }}
							/>
						</Show>
					</Match>
					<Match when={appStore.displayData.displayContent?.type === "song"}>
						<Show
							when={appStore.displayData.songTheme}
							fallback={<NoThemeError type="song" />}
						>
							<RenderTheme
								data={parseThemeData(
									appStore.displayData.songTheme?.theme_data,
								)}
								renderMap={defaultThemeRenderMap}
								extraProps={{ isProjectionDisplay: true }}
							/>
						</Show>
					</Match>
					<Match when={appStore.displayData.displayContent?.type === "image"}>
						<RenderImage
							imageData={appStore.displayData.displayContent?.image}
						/>
					</Match>
					<Match when={appStore.displayData.displayContent?.type === "video"}>
						<RenderVideo
							videoData={appStore.displayData.displayContent?.video}
						/>
					</Match>
				</Switch>
			</Box>
		</Box>
	);
}
