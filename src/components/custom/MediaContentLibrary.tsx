import { createVirtualizer } from "@tanstack/solid-virtual";
import { createMemo, For, Match, Switch, type Setter } from "solid-js";
import { createAsyncMemo } from "solidjs-use";
import { Box, VStack } from "styled-system/jsx";
import { useAppContext } from "~/layouts/AppContext";
import { getBaseFocusStyles, getFocusableStyles } from "~/utils";
import {
	THEME_EDITOR_FOCUS_NAME,
	THEMES_TAB_FOCUS_NAME,
} from "~/utils/constants";
import Image from "../app/Image";
import Video from "../app/Video";
import { Text } from "../ui/text";
import type { MediaItem } from "~/types";

interface Props {
	type: "image" | "video";
	selectedMedia?: MediaItem;
	setSelectedMedia: Setter<MediaItem | undefined>;
}
const NUM_OF_DISPLAY_LANES = 5;
const laneItemSize = 100 / NUM_OF_DISPLAY_LANES;

export default function MediaContentLibrary(props: Props) {
	let virtualizerParentRef!: HTMLDivElement;
	const { appStore, setAppStore } = useAppContext();

	const allMedia = createAsyncMemo(async () => {
		const updated = appStore.mediaUpdateTrigger;
		console.log("Re-running all media fetcher");
		const images = await window.electronAPI.getImages();
		const videos = await window.electronAPI.getVideos();
		// { images: [], videos: [] }
		console.log("ALL IMAGES & VIDEOS: ", images, videos);
		return [...images, ...videos];
	}, []);
	const filteredMedia = createMemo(() =>
		allMedia().filter((media) => media.type === props.type),
	);
	const rowVirtualizer = createMemo(() =>
		createVirtualizer({
			count: filteredMedia().length,
			getScrollElement: () => virtualizerParentRef,
			estimateSize: () => 100,
			overscan: 5,
			lanes: NUM_OF_DISPLAY_LANES,
		}),
	);

	const selectMediaId = (item: MediaItem) => {
		console.log("About to set container bg:", item);
		props.setSelectedMedia(item);
	};

	return (
		<Box ref={virtualizerParentRef}>
			<Switch>
				<Match when={filteredMedia().length}>
					<Box
						style={{
							height: `${rowVirtualizer().getTotalSize()}px`,
							width: "100%",
							position: "relative",
						}}
					>
						<For each={rowVirtualizer().getVirtualItems()}>
							{(virtualItem) => {
								const media = filteredMedia()[virtualItem.index];
								return (
									<Box
										px={1}
										py={2}
										w="full"
										h="full"
										class="disable-child-clicks"
										style={{
											position: "absolute",
											top: 0,
											height: `${virtualItem.size}px`,
											transform: `translateY(${virtualItem.start}px)`,
											left: `${virtualItem.lane * laneItemSize}%`,
											width: laneItemSize + "%",
											...getBaseFocusStyles(THEMES_TAB_FOCUS_NAME),
											...getFocusableStyles(
												THEMES_TAB_FOCUS_NAME,
												virtualItem.index === props.selectedMedia?.id &&
													props.selectedMedia.type === media.type,
												true,
												virtualItem.index === props.selectedMedia?.id &&
													props.selectedMedia.type === media.type,
											),
										}}
										data-panel={THEME_EDITOR_FOCUS_NAME}
										data-focusId={virtualItem.index}
										onclick={() => selectMediaId(media)}
									>
										{/* width: "full", height: "auto", aspectRatio: 16 / 9 */}
										<Switch>
											<Match when={media.type === "image"}>
												<Image src={media.path} alt={media.title} />
											</Match>
											<Match when={media.type === "video"}>
												<Video
													id={
														THEME_EDITOR_FOCUS_NAME +
														"-vid-" +
														virtualItem.index
													}
													src={media.path}
													about={media.title}
													preload="metadata"
												/>
											</Match>
										</Switch>
										<Text
											mt={1.5}
											textAlign="center"
											maxW="full"
											textStyle="sm"
											truncate
										>
											{media.title}
										</Text>
									</Box>
								);
							}}
						</For>
					</Box>
				</Match>
				<Match when={!filteredMedia().length}>
					<VStack gap={1} w="full" h="full" justifyContent="center">
						<Text textStyle="xl" color="gray.100">
							No Media in your Database
						</Text>
						<Text fontSize="sm" color="gray.400">
							Import one from your device by clicking the "+" button below
						</Text>
					</VStack>
				</Match>
			</Switch>
		</Box>
	);
}
