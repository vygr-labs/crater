import { Box, Flex, HStack, VStack } from "styled-system/jsx";
import type { SongData, SongLyric } from "~/types/context";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { createEffect, createMemo, For } from "solid-js";
import { createStore } from "solid-js/store";
import { useAppContext } from "~/layouts/AppContext";
import { updateSongEdit } from "~/utils/store-helpers";
import { SONG_EDITOR_FOCUS_NAME } from "~/utils/constants";
import type { OpenEditData } from "~/types";
import { createAsyncMemo } from "solidjs-use";
import LyricEdit from "../app/song/LyricEdit";
import { useFocusContext } from "~/layouts/FocusContext";

type Props = {
	open: boolean;
	song: SongData;
	setOpen: (data: OpenEditData) => void;
};

type CreateSongData = {
	title: string;
	lyrics: SongLyric[];
};

function SongEditor() {
	const { appStore, setAppStore } = useAppContext();
	const [songMeta, setSongMeta] = createStore({
		title: "",
	});
	// const open = createMemo(() => appStore.songEdit.open);
	const song = createMemo(() => appStore.songEdit.song);
	const [lyrics, setLyrics] = createStore<SongLyric[]>([]);
	const fetchedSongLyrics = createAsyncMemo(async () => {
		const toFetch = song();
		if (!toFetch) return [];
		const lyrics = await window.electronAPI.fetchSongLyrics(toFetch.id);
		return lyrics;
	}, []);

	const { subscribeEvent, changeFocusPanel, currentPanel, previousPanel } =
		useFocusContext();
	const { name, coreFocusId, fluidFocusId, changeFocus } = subscribeEvent({
		name: SONG_EDITOR_FOCUS_NAME,
		defaultCoreFocus: 0,
		defaultFluidFocus: 0,
		handlers: {
			ArrowDown: ({
				coreFocusId,
				fluidFocusId,
				changeFocus,
				changeCoreFocus,
				changeFluidFocus,
			}) => {
				const newCoreFocusId = Math.min(
					(fluidFocusId ?? 0) + 1,
					lyrics.length - 1,
				);
				changeFluidFocus(newCoreFocusId);
			},
			ArrowUp: ({
				coreFocusId,
				fluidFocusId,
				changeFocus,
				changeCoreFocus,
				changeFluidFocus,
			}) => {
				const newCoreFocusId = Math.max((fluidFocusId ?? 0) - 1, 0);
				changeFluidFocus(newCoreFocusId);
			},
			Enter: ({
				coreFocusId,
				fluidFocusId,
				changeFocus,
				changeCoreFocus,
				changeFluidFocus,
			}) => {
				changeFocus(fluidFocusId);
			},
		},
		clickHandlers: {
			onClick: ({ changeFluidFocus, focusId, event }) => {
				if (typeof focusId === "number") {
					changeFluidFocus(focusId);
				}
			},
			// onDblClick: ({ changeFocus, focusId }) => {
			// 	if (typeof focusId === "number") {
			// 		changeFocus(focusId);
			// 		pushToLive(focusId);
			// 	}
			// },
		},
	});

	createEffect(() => {
		if (appStore.songEdit.open) {
			console.log("changing focus to song editor");
			changeFocusPanel(SONG_EDITOR_FOCUS_NAME);
		}
	});
	createEffect(() => {
		setLyrics(fetchedSongLyrics());
	});
	let containerRef!: HTMLDivElement;

	const closeModal = () => {
		const revert = previousPanel();
		setAppStore("songEdit", { open: false });
		if (revert) {
			changeFocusPanel(revert);
		}
	};

	const handleLabelEdit = (index: number, value: string) => {};
	const handleLyricEdit = (index: number, value: string) => {};

	const saveSong = () => {};

	return (
		<Dialog.Root
			lazyMount
			role="alertdialog"
			size="xl"
			placement="center"
			motionPreset="slide-in-top"
			open={appStore.songEdit.open}
			onOpenChange={closeModal}
		>
			<Dialog.Content h="80vh">
				<Dialog.Header>
					<Dialog.Title>Edit Song</Dialog.Title>
				</Dialog.Header>
				<Dialog.Body overflow="hidden">
					<div style={{ margin: "0 auto", width: "100%", height: "100%" }}>
						<Box h="full">
							<Flex justifyContent="center" h="full" pos="relative">
								<Box
									// left={0}
									// width={(4 / 12) * 100 + '%'}
									pos="absolute"
									w="full"
									height="100%"
									overflow="auto"
									mx={5}
									scrollBehavior="smooth"
								>
									<VStack alignItems="left" gap={4} pr={1} ref={containerRef}>
										<For each={lyrics}>
											{(lyric, index) => (
												<LyricEdit
													index={index()}
													{...lyric}
													onLabelEdit={(e) =>
														handleLabelEdit(
															index(),
															(e.target as HTMLInputElement).value,
														)
													}
													onTextEdit={(e) =>
														handleLyricEdit(
															index(),
															(e.target as HTMLTextAreaElement).value,
														)
													}
												/>
											)}
										</For>
									</VStack>
								</Box>
								{/* <Box
									left={(4.2 / 12) * 100 + '%'}
									width={(7.8 / 12) * 100 + '%'}
									height="100%"
									pos="absolute"
								>
									<AspectRatio bgColor="bg.emphasized" ratio={16 / 9} p={6}>
										<Box w="full" h="full" bgColor="transparent">
											{/* Preview content would go here *}
											<RenderLyric
												songData={currentLyric}
												hide={false}
												scope={'song-edit'}
											/>
										</Box>
									</AspectRatio>
								</Box> */}
							</Flex>
						</Box>
					</div>
				</Dialog.Body>
				<Dialog.Footer>
					<Box>
						<HStack>
							<Input
								maxW="60"
								placeholder="Insert title"
								variant="subtle"
								colorPalette="white"
								value={song()?.title}
								onInput={(e) => setSongMeta("title", e.currentTarget.value)}
								required
							/>
							{/* <DialogActionTrigger asChild> */}
							<Button variant="outline" onclick={closeModal}>
								Cancel
							</Button>
							{/* </DialogActionTrigger> */}
							<Button onclick={saveSong}>Save</Button>
						</HStack>
					</Box>
				</Dialog.Footer>
				{/* <DialogCloseTrigger /> */}
			</Dialog.Content>
		</Dialog.Root>
	);
}

export default SongEditor;
