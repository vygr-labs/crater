import { createEffect, onCleanup, onMount, splitProps } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import type Player from "video.js/dist/types/player";
import { logger } from "~/utils";

interface Props extends JSX.VideoHTMLAttributes<HTMLVideoElement> {
	fluid?: boolean;
	player?: Player;
	synchronize?: string[];
}

export default function Video(_props: Props) {
	const [props, rest] = splitProps(_props, [
		"src",
		"id",
		"fluid",
		"muted",
		"player",
		"synchronize",
	]);
	let player: Player;
	let channel: BroadcastChannel;

	onMount(() => {
		if (props.id && !props.player) {
			player = videojs(props.id, {
				fluid: props.fluid,
				aspectRatio: "16:9",
			});
		} else if (props.player) {
			player = props.player;
		}

		player.ready(player.play);

		if (props.synchronize && props.synchronize.length) {
			channel = new BroadcastChannel("sync-video-playback");
			player.on("play", () => {
				logger.info("HANDLING PLAY SYNCHRONIZATION");
				channel.postMessage({
					event: "play",
					sender: props.id,
					recipients: props.synchronize,
				});
			});

			player.on("pause", () => {
				logger.info("HANDLING PAUSE SYNCHRONIZATION");
				channel.postMessage({
					event: "pause",
					sender: props.id,
					recipients: props.synchronize,
				});
				// props.synchronize?.map((id) => {
				// 	const pl = videojs.getPlayer(id);
				// 	logger.info(["Synchronizing: ", pl, "PAUSE"]);
				// 	if (pl) {
				// 		pl.pause();
				// 	}
				// });
			});

			channel.addEventListener("message", (message) => {
				const syncData = message.data;
				console.log("Video sync received: ", syncData, message);
				if (
					syncData.sender !== props.id &&
					syncData.recipients.includes(props.id)
				) {
					logger.info([syncData.event, player, player.pause, player.play]);
					switch (syncData.event) {
						case "pause":
							player.pause();
							break;
						case "play":
							player.play();
							break;
						// case "seek":
						// 	player.
					}
				}
			});
		}
	});

	onCleanup(() => {
		if (channel) {
			channel.close();
		}
		logger.info(["Player: ", "Disposing Player"]);
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
