import { Box, Flex, HStack, VStack } from "styled-system/jsx";
import type { SongData, SongLyric } from "~/types/context";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { createEffect, createMemo, For } from "solid-js";
import { createStore, unwrap } from "solid-js/store";
import { useAppContext } from "~/layouts/AppContext";
import { updateSongEdit } from "~/utils/store-helpers";
import { SONG_EDITOR_FOCUS_NAME } from "~/utils/constants";
import type { OpenEditData } from "~/types";
import { createAsyncMemo } from "solidjs-use";
import LyricEdit from "../app/song/LyricEdit";
import { useFocusContext } from "~/layouts/FocusContext";
import { lineHeights } from "~/theme/tokens/line-heights";
import { getToastType, toaster } from "~/utils";

type Props = {
	open: boolean;
	song: SongData;
	setOpen: (data: OpenEditData) => void;
};

type CreateSongData = {
	title: string;
	lyrics: SongLyric[];
};

const NEW_LYRIC: SongLyric = { label: "", text: [] };

const getInputData = (element: HTMLElement) => {
	const type = element.getAttribute("data-type");
	const index = element.getAttribute("data-index");

	return { type, index };
};

const getLineData = (target: HTMLInputElement | HTMLTextAreaElement) => {
	const lines = target.value.split("\n").map((line) => line.length);
	let currentLine = 0;
	let totalLength = 0;
	for (let i = 0; i < lines.length; i++) {
		totalLength += lines[i] + (i === 0 ? 0 : 1); // i+1 to account for the \n
		// if (i === lines.length - 1) totalLength += 1; // it seems an invisible character is added to the last line because el.selectionStart is always larger
		console.log("looping: ", i, lines[i], totalLength);
		if (totalLength >= (target.selectionStart ?? 0)) {
			currentLine = i;
			break;
		}
	}
	return { lines, currentLine };
};

function SongEditor() {
	const { appStore, setAppStore } = useAppContext();
	const [songMeta, setSongMeta] = createStore({
		// title: "",
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

	let titleInputEl!: HTMLInputElement;

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
				event,
			}) => {
				const newCoreFocusId = Math.min(
					(fluidFocusId ?? 0) + 1,
					lyrics.length - 1,
				);
				changeFluidFocus(newCoreFocusId);
				console.log(event);
				const el = event.target as HTMLElement;
				const { type, index } = getInputData(el);
				if (!type || !index) return;

				if (type === "label") {
					event.preventDefault();
					const target = el as HTMLInputElement;
					const nextEl = document.getElementById(
						"song-edit-text-" + index,
					) as HTMLTextAreaElement;
					console.log(nextEl, nextEl.selectionStart, nextEl.value.length);
					if (nextEl) {
						nextEl.setSelectionRange(0, 0);
						nextEl.focus();
					}
					console.log(nextEl, nextEl.selectionStart, nextEl.value.length);
				} else if (type === "text") {
					const target = el as HTMLTextAreaElement;
					console.log(target.value);
					const { lines, currentLine } = getLineData(target);
					console.log(
						target.selectionStart,
						currentLine,
						lines,
						target.value.split("\n"),
					);
					if (currentLine === lines.length - 1) {
						event.preventDefault();
						const next = document.getElementById(
							"song-edit-label-" + (parseInt(index) + 1),
						) as HTMLInputElement;
						if (next) {
							next.setSelectionRange(0, 0);
							next.focus();
						} else {
							console.log("Addingg New Lyric");
							setLyrics(lyrics.length, NEW_LYRIC);
							const next = document.getElementById(
								"song-edit-label-" + (parseInt(index) + 1),
							) as HTMLInputElement;
							console.log(next);
							next.focus();
						}
					}
					// if (currentLine < lines.length) {
					// 	const lineEnds = lines
					// 		.slice(0, currentLine + 1)
					// 		.reduce((l, f) => l + f, 0);
					//
					// 	const nextLinePoint =
					// 		lines[currentLine + 1] >= relativeLinePos
					// 			? relativeLinePos
					// 			: lines[currentLine + 1];
					// 	const nextSelection = lineEnds + nextLinePoint + (currentLine + 1); // to represent the number of new-lines to account for
					// 	console.log(lineEnds, nextLinePoint, currentLine + 1);
					// 	console.log(nextSelection, currentLine, lines[currentLine]);
					// 	target.setSelectionRange(nextSelection, nextSelection);
					// }
					// if (target.selectionStart)
				}
			},
			ArrowUp: ({
				coreFocusId,
				fluidFocusId,
				changeFocus,
				changeCoreFocus,
				changeFluidFocus,
				event,
			}) => {
				const newCoreFocusId = Math.max((fluidFocusId ?? 0) - 1, 0);
				console.log(newCoreFocusId);
				changeFluidFocus(newCoreFocusId);
				console.log(event);

				const el = event.target as HTMLElement;
				const { type, index } = getInputData(el);
				if (!type || !index) return;

				if (type === "label") {
					event.preventDefault();
					const target = el as HTMLInputElement;
					const prevEl = document.getElementById(
						"song-edit-text-" + (parseInt(index) - 1),
					) as HTMLTextAreaElement;
					if (prevEl) {
						console.log(prevEl, prevEl.selectionStart, prevEl.value.length);
						if (prevEl) {
							const { lines } = getLineData(prevEl);
							let relativeLinePos = lines
								.slice(0, lines.length - 1)
								.reduce((l, f) => l + f + 1, 0);
							if (relativeLinePos === 1) {
								relativeLinePos = 0;
							}
							console.log(relativeLinePos);
							prevEl.setSelectionRange(relativeLinePos, relativeLinePos);
							prevEl.focus();
						}
						console.log(prevEl, prevEl.selectionStart, prevEl.value.length);
					}
				} else if (type === "text") {
					const target = el as HTMLTextAreaElement;
					const { lines, currentLine } = getLineData(target);
					console.log(target.selectionStart, currentLine, lines);
					if (currentLine === 0) {
						event.preventDefault();
						const former = document.getElementById(
							"song-edit-label-" + index,
						) as HTMLInputElement;
						if (former) {
							former.setSelectionRange(0, 0);
							former.focus();
						}
					}
				}
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
			setLyrics(fetchedSongLyrics());
			console.log("changing focus to song editor");
			changeFocusPanel(SONG_EDITOR_FOCUS_NAME);
			titleInputEl.value = appStore.songEdit.song?.title || "";
		}
	});

	let containerRef!: HTMLDivElement;

	const closeModal = () => {
		const revert = previousPanel();
		setAppStore("songEdit", { open: false });
		setLyrics([]);
		if (revert) {
			changeFocusPanel(revert);
		}
	};

	const handleLabelEdit = (index: number, value: string) => {
		setLyrics(index, "label", value);
	};
	const handleTextEdit = (index: number, value: string) => {
		setLyrics(index, "text", value.split("\n"));
	};

	const saveSong = () => {
		const nSong = song();
		const songTitle = titleInputEl.value;
		if (!songTitle) return;
		console.log(songMeta, nSong);
		if (nSong) {
			window.electronAPI
				.updateSong({
					songId: nSong.id,
					newTitle: songTitle,
					newLyrics: unwrap(lyrics),
				})
				.then(({ success, message }) => {
					closeModal();
					toaster.create({
						type: getToastType(success),
						title: message,
					});
					console.log(success, message);
				});
		} else {
			window.electronAPI
				.createSong({ title: songTitle, lyrics: unwrap(lyrics) })
				.then(({ success, message, songId }) => {
					closeModal();
					toaster.create({
						type: getToastType(success),
						title: message,
					});
					console.log(success, message);
				});
		}
		titleInputEl.value = "";
		setAppStore("songsUpdateCounter", (former) => ++former);
	};

	return (
		<Dialog.Root
			size="xl"
			placement="center"
			motionPreset="slide-in-top"
			open={appStore.songEdit.open}
			onOpenChange={closeModal}
		>
			<Dialog.Backdrop />
			<Dialog.Positioner>
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
															handleTextEdit(
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
									ref={titleInputEl}
									// onInput={(e) => setSongMeta("title", e.currentTarget.value)}
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
			</Dialog.Positioner>
		</Dialog.Root>
	);
}

export default SongEditor;
