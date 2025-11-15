import { Box } from "styled-system/jsx";
import type { MediaItem } from "~/types";
import Image from "../Image";
import { css } from "styled-system/css";
import Video from "../Video";
import { PANEL_VIDEO_ID, WINDOW_VIDEO_ID } from "~/utils/constants";

interface Props {
	videoData?: MediaItem;
}

export default function RenderVideo(props: Props) {
	return (
		<Box w="full" h="full">
			<Video
				// id={"live-window-vid-" + props.videoData?.id}
				id={WINDOW_VIDEO_ID}
				synchronize={[PANEL_VIDEO_ID]}
				src={props.videoData?.path}
				about={props.videoData?.title}
				controls={false}
				preload="auto"
				// autoplay
				// loop
				muted={false}
			/>
		</Box>
	);
}
