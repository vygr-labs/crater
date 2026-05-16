import { Box } from "styled-system/jsx";
import type { MediaItem } from "~/types";
import VideoStage from "../VideoStage";

interface Props {
	videoData?: MediaItem;
}

export default function RenderVideo(props: Props) {
	return (
		<Box w="full" h="full">
			<VideoStage
				src={props.videoData?.path ?? ""}
				about={props.videoData?.title}
				autoplay
			/>
		</Box>
	);
}
