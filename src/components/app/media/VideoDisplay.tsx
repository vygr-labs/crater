import { Box } from "styled-system/jsx";
import type { MediaItem } from "~/types";
import Image from "../Image";
import Video from "../Video";
import {
	LIVE_PANEL_FOCUS_NAME,
	PANEL_VIDEO_ID,
	WINDOW_VIDEO_ID,
} from "~/utils/constants";

interface Props {
	index: number;
	video: MediaItem;
	isFocusItem: boolean;
	panelName: string;
	isCurrentPanel: boolean;
}

export default function VideoDisplay(props: Props) {
	return (
		<Box
			// class="disable-child-clicks" // re-enable after implementing video controls
			userSelect="none"
			px={4}
			py={1}
			mb="6"
			height="unset"
			data-index={props.index}
		>
			<Video
				id={
					props.panelName === LIVE_PANEL_FOCUS_NAME
						? PANEL_VIDEO_ID
						: props.panelName + "-vid-" + props.index
				}
				synchronize={[WINDOW_VIDEO_ID]}
				src={props.video.path}
				about={props.video.title}
				controls
				preload="auto"
			/>
		</Box>
	);
}
