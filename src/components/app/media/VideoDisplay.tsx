import { Box } from "styled-system/jsx";
import type { MediaItem } from "~/types";
import VideoThumbnail from "../VideoThumbnail";

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
			userSelect="none"
			px={4}
			py={1}
			mb="6"
			height="unset"
			data-index={props.index}
		>
			<VideoThumbnail
				src={props.video.path}
				about={props.video.title}
			/>
		</Box>
	);
}
