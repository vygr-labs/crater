import { Box } from "styled-system/jsx";
import type { MediaItem } from "~/types";
import Image from "../Image";
import { css } from "styled-system/css";

interface Props {
	imageData?: MediaItem;
}

export default function RenderImage(props: Props) {
	return (
		<Box w="full" h="full">
			<Image
				class={css({
					bg: "black",
					objectFit: "contain",
					w: "full",
					h: "full",
				})}
				alt={props.imageData?.title}
				src={props.imageData?.path}
			/>
		</Box>
	);
}
