import { Match, Switch } from "solid-js";
import LyricDisplay from "./song/LyricDisplay";
import ScriptureDisplay, { type DisplayScripture } from "./scripture/ScriptureDisplay";
import type { DisplayType } from "~/types";
import type { SongLyric } from "~/types/context";

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
                <LyricDisplay index={props.index} lyric={props.item as SongLyric} isFocusItem={props.isFocusItem} panelName={props.panelName} isCurrentPanel={props.isCurrentPanel} />
            </Match>
            <Match when={props.type === "scripture"}>
                <ScriptureDisplay index={props.index} scripture={props.item as DisplayScripture} isFocusItem={props.isFocusItem} panelName={props.panelName} isCurrentPanel={props.isCurrentPanel} />
            </Match>
        </Switch>
    )
}