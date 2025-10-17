import { Match, Switch } from "solid-js";
import LyricDisplay from "./song/LyricDisplay";
import ScriptureDisplay, {
	type DisplayScripture,
} from "./scripture/ScriptureDisplay";
import type { DisplayType, MediaItem } from "~/types";
import type { SongLyric } from "~/types/context";
import ImageDisplay from "./media/ImageDisplay";
import VideoDisplay from "./media/VideoDisplay";

interface Props {
	type?: DisplayType;
	index: number;
	item: any;
	isFocusItem: boolean;
	isCurrentPanel: boolean;
	panelName: string;
}

export default function ItemDisplay(props: Props) {
	return (
		<Switch>
			<Match when={props.type === "song"}>
				<LyricDisplay
					index={props.index}
					lyric={props.item as SongLyric}
					isFocusItem={props.isFocusItem}
					panelName={props.panelName}
					isCurrentPanel={props.isCurrentPanel}
				/>
			</Match>
			<Match when={props.type === "scripture"}>
				<ScriptureDisplay
					index={props.index}
					scripture={props.item as DisplayScripture}
					isFocusItem={props.isFocusItem}
					panelName={props.panelName}
					isCurrentPanel={props.isCurrentPanel}
				/>
			</Match>
			<Match when={props.type === "image"}>
				<ImageDisplay
					index={props.index}
					image={props.item as MediaItem}
					isFocusItem={props.isFocusItem}
					panelName={props.panelName}
					isCurrentPanel={props.isCurrentPanel}
				/>
			</Match>
			<Match when={props.type === "video"}>
				<VideoDisplay
					index={props.index}
					video={props.item as MediaItem}
					isFocusItem={props.isFocusItem}
					panelName={props.panelName}
					isCurrentPanel={props.isCurrentPanel}
				/>
			</Match>
		</Switch>
	);
}
