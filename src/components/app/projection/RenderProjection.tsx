import { Box } from "styled-system/jsx";
import LogoBackground from "./LogoBackground";
import RenderTheme from "../editor/RenderTheme";
import { RenderEditorContainer } from "../editor/ui/Container";
import { RenderEditorText } from "../editor/ui/Text";
import { useAppContext } from "~/layouts/AppContext";

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
			// class={`${hideLive ? 'clear-display' : ''}`}
		>
			{/* <LogoBackground /> */}
			{/* Live Display */}
			<RenderTheme
				data={JSON.parse(appStore.songTheme?.theme_data ?? "{}")}
				renderMap={themeRenderMap}
			/>
			{/* {displayData?.type === 'scripture' ? (
                            <RenderScripture
                                scriptureData={displayData?.scripture}
                                hide={hideLive}
                            />
                        ) : displayData?.type === 'song' ? (
                            <RenderLyric songData={displayData?.song} hide={hideLive} />
                        ) : displayData?.type === 'image' ? (
                            <RenderImage imageData={displayData?.image} hide={hideLive} />
                        ) : null} */}
		</Box>
	);
}
