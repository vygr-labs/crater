// import {
// 	DialogActionTrigger,
// 	DialogBody,
// 	DialogCloseTrigger,
// 	DialogContent,
// 	DialogFooter,
// 	DialogHeader,
// 	DialogRoot,
// 	DialogTitle,
// } from '@/components/ui/dialog'
// import {
// 	Text,
// 	Box,
// 	Grid,
// 	GridItem,
// 	VStack,
// 	Flex,
// 	Input,
// 	HStack,
// 	StepsTitle,
// 	AspectRatio,
// } from '@chakra-ui/react'
// import { Button } from '../ui/button'
// import lz from 'lzutf8'
// import { toaster } from '../ui/toaster'
// import { Field } from '../ui/field'
// import {
// 	FormEvent,
// 	Key,
// 	KeyboardEvent,
// 	memo,
// 	useCallback,
// 	useEffect,
// 	useLayoutEffect,
// 	useRef,
// 	useState,
// } from 'react'
// import { CLOSE_SONG_EDIT, OpenEditData } from '../app/songs/SongSelection'
// import { SongData, SongLyric } from '@/context'
// import LyricEdit from './LyricEdit'
// import _ from 'lodash'
// import { useAppSelector } from '@/hooks/useRedux'
// import RenderLyric from '../app/songs/RenderLyric'
// import { getToastType } from '@/utils'
// import { useDispatch } from 'react-redux'
// import { changeFocusPanel, updateSongEdit } from '@/utils/redux/appSlice'

import { Box, Flex, HStack, VStack } from "styled-system/jsx";
import type { SongData, SongLyric } from "~/types/context";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { createEffect, For } from "solid-js";
import { createStore } from "solid-js/store";
import { useAppContext } from "~/layouts/AppContext";
import { updateSongEdit } from "~/utils/store-helpers";
import { CLOSE_SONG_EDIT } from "~/utils/constants";

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
	const [edited, setEdited] = createStore<CreateSongData>({
		title: "",
		lyrics: [],
	});
	// const [title, setTitle] = useState('')
	// const [lyrics, setLyrics] = useState<SongLyric[]>([])
	let containerRef!: HTMLDivElement;
	const [focusedKey, setFocusedKey] = useState<string | null>(null);
	const { appStore, setAppStore } = useAppContext();
	const currentSongTheme = () => appStore.songTheme;
	const [currentLyric, setCurrentLyric] = useState({
		label: "",
		text: [],
	});
	const open = () => appStore.songEdit.open;
	const song = () => appStore.songEdit.song;
	// const { open, song } = useAppSelector(state => state.app.songEdit)

	const closeModal = () => updateSongEdit(setAppStore, CLOSE_SONG_EDIT);

	function saveSong(e: FormEvent) {
		e.preventDefault();
		if (song) {
			window.electronAPI
				.updateSong({
					songId: song.id,
					newTitle: edited.title,
					newLyrics: edited.lyrics,
				})
				.then(({ success, message }) => {
					closeModal();
					// toaster.create({
					// 	type: getToastType(success),
					// 	title: message,
					// })
					setEdited("title", "");
					console.log(success, message);
				});
		} else {
			window.electronAPI
				.createSong({ title: edited.title, lyrics: edited.lyrics })
				.then(({ success, message, songId }) => {
					closeModal();
					// toaster.create({
					// 	type: getToastType(success),
					// 	title: message,
					// })
					setEdited("title", "");
					console.log(success, message);
				});
		}
	}

	const addNewLyric = () => {
		setEdited("lyrics", (prev) => [...prev, { label: "", text: [] }]);
	};

	createEffect(() => {
		if (open()) {
			dispatch(changeFocusPanel("song-edit"));
			if (song()) {
				setEdited("title", song()?.title);
				window.electronAPI.fetchSongLyrics(song.id).then((data) => {
					setEdited("lyrics", data);
				});
			} else {
				addNewLyric();
			}
		} else {
			dispatch(changeFocusPanel("songs"));
			setEdited("title", "");
			setEdited("lyrics", []);
		}
	}, [open, song, dispatch, addNewLyric]);

	const handleKeyDown = (e: globalThis.KeyboardEvent) => {
		// Handle arrow keys, delete key, and backspace key
		if (
			e.key !== "ArrowDown" &&
			e.key !== "ArrowUp" &&
			e.key !== "Delete" &&
			e.key !== "Backspace"
		)
			return;

		const target = e.target as HTMLInputElement | HTMLTextAreaElement;
		const value = target.value;
		const pos = target.selectionStart || 0;
		const key: string | null = target.getAttribute("data-key");
		let nextKey = "";

		if (!key) return;

		const [type, strIndex] = key.split("-");
		const index = parseInt(strIndex);

		// Handle delete key - deletes lyric group regardless of content
		if (e.key === "Delete") {
			// Only delete if there's more than one lyric
			if (edited.lyrics.length > 1) {
				e.preventDefault();
				const newLyrics = edited.lyrics.filter((_, i) => i !== index);
				setEdited("lyrics", newLyrics);

				// Set focus to the previous lyric or next available lyric
				if (index > 0) {
					setFocusedKey(`${type}-${index - 1}`);
				} else if (newLyrics.length > 0) {
					setFocusedKey(`${type}-0`);
				}
			}
			return;
		}

		// Handle backspace key - only deletes if lyric is empty and on label input
		if (e.key === "Backspace" && type === "label" && pos === 0) {
			// Only delete if there's more than one lyric and both label and text are empty
			if (edited.lyrics.length > 1) {
				const currentLyric = edited.lyrics[index];
				const isLyricEmpty =
					!currentLyric.label.trim() &&
					currentLyric.text.every((line) => !line.trim());

				if (isLyricEmpty) {
					e.preventDefault();
					const newLyrics = edited.lyrics.filter((_, i) => i !== index);
					setEdited("lyrics", newLyrics);

					// Set focus to the previous lyric's label or next available lyric
					if (index > 0) {
						setFocusedKey(`label-${index - 1}`);
					} else if (newLyrics.length > 0) {
						setFocusedKey(`label-0`);
					}
				}
			}
			return;
		}

		if (e.key === "ArrowDown") {
			// For input (label), always move to textarea below
			if (type === "label") {
				e.preventDefault();
				nextKey = `text-${index}`;
			}
			// For textarea, check if we're at the last line
			else if (type === "text") {
				const textAfter = value.substring(pos);
				const nextNewline = textAfter.indexOf("\n");

				// If no newline after cursor, we're at the last line
				if (nextNewline === -1) {
					e.preventDefault();
					// Move to next lyric's label, create new lyric if needed
					if (index + 1 > edited.lyrics.length - 1) {
						addNewLyric();
					}
					nextKey = `label-${index + 1}`;
				}
			}
		} else if (e.key === "ArrowUp") {
			// For textarea, check if we're at the first line
			if (type === "text") {
				const textBefore = value.substring(0, pos);
				const lastNewline = textBefore.lastIndexOf("\n");

				// If no newline before cursor, we're at the first line
				if (lastNewline === -1) {
					e.preventDefault();
					nextKey = `label-${index}`;
				}
			}
			// For input (label), move to previous lyric's textarea
			else if (type === "label" && index > 0) {
				e.preventDefault();
				nextKey = `text-${index - 1}`;
			}
		}

		if (nextKey) {
			setFocusedKey(nextKey);
		}
	};

	const handleMouseClick = (e: MouseEvent) => {
		const target = e.target as HTMLInputElement | HTMLTextAreaElement;
		const key: string | null = target.getAttribute("data-key");

		if (key) {
			setFocusedKey(key);
		}
	};

	createEffect(() => {
		const element = containerRef;
		if (element) {
			element.addEventListener("keydown", handleKeyDown);
			element.addEventListener("click", handleMouseClick);
			return () => {
				element.removeEventListener("keydown", handleKeyDown);
				element.removeEventListener("click", handleMouseClick);
			};
		}
	}, [handleKeyDown, handleMouseClick]);

	createEffect(() => {
		if (focusedKey) {
			const nextEl = document.querySelector(
				`[data-key="${focusedKey}"]`,
			) as HTMLInputElement;

			// Only focus if the element is not already focused (to avoid interfering with mouse clicks)
			if (nextEl && document.activeElement !== nextEl) {
				nextEl.focus();
			}

			if (edited.lyrics.length) {
				setCurrentLyric(edited.lyrics[parseInt(focusedKey.split("-")[1])]);
			}
		}
	});

	function handleLabelEdit(index: number, value: string) {
		const newLyrics = [...edited.lyrics];
		newLyrics[index] = { ...newLyrics[index], label: value };
		setEdited("lyrics", newLyrics);
	}

	function handleLyricEdit(index: number, value: string) {
		const newLyrics = [...edited.lyrics];
		newLyrics[index] = { ...newLyrics[index], text: value.split("\n") };
		setEdited("lyrics", newLyrics);
	}

	return (
		<Dialog.Root
			lazyMount
			role="alertdialog"
			size="xl"
			placement="center"
			motionPreset="slide-in-top"
			open={open()}
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
										<For each={edited.lyrics}>
											{(lyric, index) => (
												<LyricEdit
													key={index}
													index={index}
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
					<Box as="form" onSubmit={saveSong}>
						<HStack>
							<Input
								maxW="60"
								placeholder="Insert title"
								variant="subtle"
								colorPalette="white"
								value={edited.title}
								onInput={(e) => setEdited("title", e.currentTarget.value)}
								required
							/>
							{/* <DialogActionTrigger asChild> */}
							<Button variant="outline">Delete</Button>
							{/* </DialogActionTrigger> */}
							<Button type="submit">Save</Button>
						</HStack>
					</Box>
				</Dialog.Footer>
				{/* <DialogCloseTrigger /> */}
			</Dialog.Content>
		</Dialog.Root>
	);
}

export default SongEditor;
