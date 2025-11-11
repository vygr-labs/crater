import { createEffect, onCleanup, onMount, splitProps } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import type Player from "video.js/dist/types/player";

interface Props extends JSX.VideoHTMLAttributes<HTMLVideoElement> {
	fluid?: boolean;
}

export default function Video(_props: Props) {
	const [props, rest] = splitProps(_props, ["src", "id", "fluid", "muted"]);
	let player: Player;

	onMount(() => {
		if (props.id) {
			player = videojs(props.id, {
				fluid: props.fluid,
				aspectRatio: "16:9",
			});
		}
	});

	onCleanup(() => {
		if (player && !player.isDisposed()) player.dispose();
	});

	return (
		<div data-vjs-player>
			<video
				id={props.id}
				class="video-js vjs-crater"
				src={"video://" + props.src}
				muted={typeof props.muted === "boolean" ? props.muted : true}
				{...rest}
			>
				{/* <source src={"video://" + props.src} /> */}
			</video>
		</div>
	);
}
