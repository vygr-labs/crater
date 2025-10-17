import { Box } from "styled-system/jsx";
import type { MediaItem } from "~/types";
import Image from "../Image";
import Video from "../Video";

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
			class="disable-child-clicks"
			userSelect="none"
			px={4}
			py={1}
			mb="6"
			height="unset"
			data-index={props.index}
		>
			<Video src={props.video.path} about={props.video.title} controls />
		</Box>
	);
}
