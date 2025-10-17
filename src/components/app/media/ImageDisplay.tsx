import { Box } from "styled-system/jsx";
import type { MediaItem } from "~/types";
import Image from "../Image";

interface Props {
	index: number;
	image: MediaItem;
	isFocusItem: boolean;
	panelName: string;
	isCurrentPanel: boolean;
}

export default function ImageDisplay(props: Props) {
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
			<Image src={props.image.path} alt={props.image.title} />
		</Box>
	);
}
