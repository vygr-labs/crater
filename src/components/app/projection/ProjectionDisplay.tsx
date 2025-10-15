import { Box } from "styled-system/jsx";
import LogoBackground from "./LogoBackground";
import RenderTheme from "../editor/RenderTheme";
import { RenderEditorContainer } from "../editor/ui/Container";
import { RenderEditorText } from "../editor/ui/Text";
import type { ExportedTheme } from "../editor/editor-types";

const themeRenderMap = {
	EditorContainer: RenderEditorContainer,
	EditorText: RenderEditorText,
};
export default function ProjectionDisplay() {
	// const displayData = useAppSelector(state => state.app.displayData)
	// const hideLive = useAppSelector(state => state.app.hideLive)

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
			<RenderTheme data={demoTheme} renderMap={themeRenderMap} />
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

const demoTheme: ExportedTheme = {
	nodes: [
		{
			id: "c93f0ca2-a539-4ad1-9989-14c5e29072d1",
			compName: "EditorContainer",
			data: {
				resize: {
					x: 1,
					y: 1,
					z: 1,
				},
			},
			style: {
				width: "98.67519162735849%",
				height: "100.42521158854167%",
				"background-color": "#4a1772",
				"z-index": 10,
				transform: "translate3d(0px, 0px, 0)",
				top: "0%",
				left: "0%",
			},
		},
		{
			id: "a039f99b-8069-4a11-b1f3-20c7564902fd",
			compName: "EditorText",
			data: {
				linkage: 3,
				text: "Making Progress on This",
				resize: {
					x: 1,
					y: 1,
					z: 1,
				},
			},
			style: {
				width: "160px",
				height: "50px",
				color: "rgba(255, 255, 255, 0.92)",
				"line-height": "20px",
				"text-align": "left",
				"z-index": 20,
				transform: "translate3d(0px, 0px, 0)",
				top: "32.17569986979167%",
				left: "29.253115743960972%",
			},
		},
	],
};
