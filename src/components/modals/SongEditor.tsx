import { Box, Flex, HStack, VStack } from "styled-system/jsx";
import type { SongData, SongLyric } from "~/types/context";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import {
	createEffect,
	createMemo,
	createSignal,
	For,
	on,
	onCleanup,
	Show,
} from "solid-js";
import { createStore, produce, reconcile, unwrap } from "solid-js/store";
import { useAppContext } from "~/layouts/AppContext";
import { updateSongEdit } from "~/utils/store-helpers";
import { defaultPalette, SONG_EDITOR_FOCUS_NAME } from "~/utils/constants";
import type { OpenEditData } from "~/types";
import { createAsyncMemo, useDebounceFn } from "solidjs-use";
import LyricEdit from "../app/song/LyricEdit";
import { useFocusContext } from "~/layouts/FocusContext";
import { lineHeights } from "~/theme/tokens/line-heights";
import { getToastType, parseThemeData, toaster } from "~/utils";
import RenderTheme from "../app/editor/RenderTheme";
import { defaultThemeRenderMap } from "../app/projection/RenderProjection";
import { useDisplayStore } from "~/layouts/DisplayContext";
import { Field } from "../ui/field";
import { Text } from "../ui/text";
import { FiPlus, FiAlertCircle } from "solid-icons/fi";
import { Spinner } from "../ui/spinner";
import { useConfirm } from "./ConfirmDialog";

type Props = {
	open: boolean;
	song: SongData;
	setOpen: (data: OpenEditData) => void;
};

type CreateSongData = {
	title: string;
	lyrics: SongLyric[];
};

const createNewLyric = (): SongLyric => ({ label: "", text: [] });

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
		totalLength += lines[i] + (i === 0 ? 0 : 1);
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
		current: 0,
	});
	const song = createMemo(() => appStore.songEdit.song);
	const [lyrics, setLyrics] = createStore<SongLyric[]>([]);
	const [history, setHistory] = createSignal<SongLyric[][]>([]);
	const [historyIndex, setHistoryIndex] = createSignal(-1);
	const [titleError, setTitleError] = createSignal(false);
	const [isSaving, setIsSaving] = createSignal(false);
	const [isLoading, setIsLoading] = createSignal(false);

	const fetchedSongLyrics = createAsyncMemo(async () => {
		const toFetch = song();
		if (!toFetch) return null;
		setIsLoading(true);
		try {
			const lyrics = await window.electronAPI.fetchSongLyrics(toFetch.id);
			console.log("Fetched Updated Lyrics: ", lyrics);
			return [...lyrics];
		} finally {
			setIsLoading(false);
		}
	}, null);
	const { setDisplayStore } = useDisplayStore();

	let titleInputEl!: HTMLInputElement;

	// Check if there are unsaved changes
	// Since every edit calls saveToHistory(), we can check if historyIndex > 0
	// historyIndex 0 = initial state (no changes), > 0 means changes were made
	const hasUnsavedChanges = createMemo(() => {
		return historyIndex() > 0;
	});

	// Debounced preview update
	const debouncedPreviewUpdate = useDebounceFn(
		(label: string, text: string[]) => {
			setDisplayStore("displayContent", {
				song: { label, text },
			});
		},
		150,
	);

	// Save to history for undo/redo
	const saveToHistory = () => {
		const currentHistory = history().slice(0, historyIndex() + 1);
		setHistory([...currentHistory, structuredClone(unwrap(lyrics))]);
		setHistoryIndex(currentHistory.length);
	};

	const undo = () => {
		if (historyIndex() > 0) {
			const newIndex = historyIndex() - 1;
			setHistoryIndex(newIndex);
			setLyrics(reconcile(history()[newIndex]));
		}
	};

	const redo = () => {
		if (historyIndex() < history().length - 1) {
			const newIndex = historyIndex() + 1;
			setHistoryIndex(newIndex);
			setLyrics(reconcile(history()[newIndex]));
		}
	};

	const canUndo = createMemo(() => historyIndex() > 0);
	const canRedo = createMemo(() => historyIndex() < history().length - 1);

	const { confirm } = useConfirm();

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
				const el = event.target as HTMLElement;
				const { type, index } = getInputData(el);
				if (!type || !index) return;

				if (type === "label") {
					// Moving from label to text within the same section - don't change focus index
					event.preventDefault();
					const nextEl = document.getElementById(
						"song-edit-text-" + index,
					) as HTMLTextAreaElement;
					if (nextEl) {
						nextEl.setSelectionRange(0, 0);
						nextEl.focus();
					}
				} else if (type === "text") {
					const target = el as HTMLTextAreaElement;
					const { lines, currentLine } = getLineData(target);
					if (currentLine === lines.length - 1) {
						// At the last line of text, move to next section
						event.preventDefault();
						const nextIndex = parseInt(index) + 1;
						const next = document.getElementById(
							"song-edit-label-" + nextIndex,
						) as HTMLInputElement;
						if (next) {
							next.setSelectionRange(0, 0);
							next.focus();
							// Only change focus and scroll when actually moving to a new section
							changeFluidFocus(nextIndex);
							scrollToSection(nextIndex);
						} else {
							// Add new lyric section
							saveToHistory();
							setLyrics(lyrics.length, createNewLyric());
							setTimeout(() => {
								const next = document.getElementById(
									"song-edit-label-" + nextIndex,
								) as HTMLInputElement;
								if (next) {
									next.focus();
									changeFluidFocus(nextIndex);
									scrollToSection(nextIndex);
								}
							}, 0);
						}
					}
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
				const el = event.target as HTMLElement;
				const { type, index } = getInputData(el);
				if (!type || !index) return;

				if (type === "label") {
					// Moving from label to previous section's text
					event.preventDefault();
					const prevIndex = parseInt(index) - 1;
					const prevEl = document.getElementById(
						"song-edit-text-" + prevIndex,
					) as HTMLTextAreaElement;
					if (prevEl) {
						const { lines } = getLineData(prevEl);
						let relativeLinePos = lines
							.slice(0, lines.length - 1)
							.reduce((l, f) => l + f + 1, 0);
						if (relativeLinePos === 1) {
							relativeLinePos = 0;
						}
						prevEl.setSelectionRange(relativeLinePos, relativeLinePos);
						prevEl.focus();
						// Only change focus and scroll when actually moving to a new section
						changeFluidFocus(prevIndex);
						scrollToSection(prevIndex);
					}
				} else if (type === "text") {
					const target = el as HTMLTextAreaElement;
					const { lines, currentLine } = getLineData(target);
					if (currentLine === 0) {
						// At the first line of text, move to label of same section - don't change focus index
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
			Escape: ({ event }) => {
				event.preventDefault();
				closeModal();
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

	// Keyboard shortcuts (Ctrl+S to save, Ctrl+Z to undo, Ctrl+Y to redo)
	const handleKeyDown = (e: KeyboardEvent) => {
		if (!appStore.songEdit.open) return;

		if (e.ctrlKey || e.metaKey) {
			if (e.key === "s") {
				e.preventDefault();
				saveSong();
			} else if (e.key === "z" && !e.shiftKey) {
				e.preventDefault();
				undo();
			} else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
				e.preventDefault();
				redo();
			}
		}
	};

	createEffect(() => {
		if (typeof document === "undefined") return;

		if (appStore.songEdit.open) {
			document.addEventListener("keydown", handleKeyDown);
		} else {
			document.removeEventListener("keydown", handleKeyDown);
		}
	});

	onCleanup(() => {
		if (typeof document === "undefined") return;
		document.removeEventListener("keydown", handleKeyDown);
	});

	// Effect to initialize lyrics when fetchedSongLyrics changes (async data arrives)
	createEffect(() => {
		// Only run when modal is open
		if (!appStore.songEdit.open) return;

		const fetchedLyrics = fetchedSongLyrics();
		// Skip if still loading or no data yet
		if (isLoading()) return;

		const initialLyrics =
			fetchedLyrics && fetchedLyrics.length > 0
				? structuredClone(fetchedLyrics)
				: [createNewLyric()];

		setLyrics(reconcile(initialLyrics));
		// Initialize history with fresh copy
		setHistory([structuredClone(initialLyrics)]);
		setHistoryIndex(0);
	});

	// Effect to handle modal open - set up focus and title
	createEffect(
		on(
			() => appStore.songEdit.open,
			(isOpen) => {
				if (isOpen) {
					changeFocusPanel(SONG_EDITOR_FOCUS_NAME);
					titleInputEl.value = appStore.songEdit.song?.title || "";
					setTitleError(false);
				}
			},
			{ defer: false },
		),
	);

	let containerRef!: HTMLDivElement;

	// Auto-scroll to section
	const scrollToSection = (index: number) => {
		if (!containerRef) return;
		const section = containerRef.children[index] as HTMLElement;
		if (section) {
			section.scrollIntoView({ behavior: "smooth", block: "nearest" });
		}
	};

	// Reset modal data - clear immediately to ensure clean state on reopen
	const resetModalData = () => {
		console.log("Resetting Modal");
		setLyrics([]);
		setHistory([]);
		setHistoryIndex(-1);
		console.log(lyrics, history);
	};

	const closeModal = () => {
		if (hasUnsavedChanges()) {
			confirm({
				title: "Unsaved Changes",
				message: "You have unsaved changes. Are you sure you want to close?",
				confirmText: "Discard",
				cancelText: "Keep Editing",
				confirmColorPalette: "red",
				onConfirm: () => {
					const revert = previousPanel();
					setAppStore("songEdit", { open: false });
					resetModalData();
					if (revert) {
						changeFocusPanel(revert);
					}
				},
			});
			return;
		}
		const revert = previousPanel();
		setAppStore("songEdit", { open: false });
		resetModalData();
		if (revert) {
			changeFocusPanel(revert);
		}
	};

	// Prevent default outside click behavior when there are unsaved changes
	const handleInteractOutside = (e: Event) => {
		if (hasUnsavedChanges()) {
			e.preventDefault();
			closeModal();
		}
	};

	const handleLabelEdit = (index: number, value: string) => {
		saveToHistory();
		setLyrics(index, "label", value);
	};

	const handleTextEdit = (index: number, val: string) => {
		saveToHistory();
		const value = val.split("\n");
		setLyrics(index, "text", value);
		// Debounced preview update
		debouncedPreviewUpdate(lyrics[index].label, value);
	};

	const handleDeleteSection = (index: number) => {
		if (lyrics.length <= 1) return; // Keep at least one section
		saveToHistory();
		setLyrics(produce((l) => l.splice(index, 1)));
	};

	const handleDuplicateSection = (index: number) => {
		saveToHistory();
		const toDuplicate = { ...lyrics[index], text: [...lyrics[index].text] };
		setLyrics(produce((l) => l.splice(index + 1, 0, toDuplicate)));
	};

	const handleAddSection = () => {
		saveToHistory();
		setLyrics(lyrics.length, createNewLyric());
		setTimeout(() => {
			const newSection = document.getElementById(
				"song-edit-label-" + (lyrics.length - 1),
			) as HTMLInputElement;
			if (newSection) newSection.focus();
			scrollToSection(lyrics.length - 1);
		}, 0);
	};

	const saveSong = () => {
		const nSong = song();
		const songTitle = titleInputEl.value.trim();

		if (!songTitle) {
			setTitleError(true);
			titleInputEl.focus();
			toaster.create({
				type: "error",
				title: "Please enter a song title",
			});
			return;
		}

		setTitleError(false);
		setIsSaving(true);

		if (nSong) {
			window.electronAPI
				.updateSong({
					songId: nSong.id,
					newTitle: songTitle,
					newLyrics: unwrap(lyrics),
				})
				.then(({ success, message }) => {
					setIsSaving(false);
					if (success) {
						// Reset history to mark as saved
						setHistory([structuredClone(unwrap(lyrics))]);
						setHistoryIndex(0);
					}
					closeModalWithoutConfirm();
					toaster.create({
						type: getToastType(success),
						title: message,
					});
				});
		} else {
			window.electronAPI
				.createSong({ title: songTitle, lyrics: unwrap(lyrics) })
				.then(({ success, message, songId }) => {
					setIsSaving(false);
					closeModalWithoutConfirm();
					toaster.create({
						type: getToastType(success),
						title: message,
					});
				});
		}
		titleInputEl.value = "";
		setAppStore("songsUpdateCounter", (former) => ++former);
	};

	const closeModalWithoutConfirm = () => {
		const revert = previousPanel();
		setAppStore("songEdit", { open: false });
		resetModalData();
		if (revert) {
			changeFocusPanel(revert);
		}
	};

	const handlePaste = (
		type: "label" | "text",
		index: number,
		event: ClipboardEvent,
	) => {
		const pastedText = event.clipboardData?.getData("text") ?? "";

		// Handle different line ending formats
		const normalizedText = pastedText
			.replace(/\r\n/g, "\n")
			.replace(/\r/g, "\n");

		if (type === "label" && normalizedText.includes("\n\n")) {
			// Pasting multiple sections
			event.preventDefault();
			saveToHistory();

			const sections = normalizedText.split("\n\n").filter((s) => s.trim());
			const lyricGroups = sections.map((section) => {
				const lines = section.trim().split("\n");
				// First line could be a label if it's short, otherwise it's lyrics
				const firstLine = lines[0] || "";
				const isLabel = firstLine.length < 30 && lines.length > 1;

				return {
					label: isLabel ? firstLine : "",
					text: isLabel ? lines.slice(1) : lines,
				};
			});

			if (lyricGroups.length > 0) {
				// Replace from current index onwards
				setLyrics(
					produce((l) => {
						l.splice(index, l.length - index, ...lyricGroups);
					}),
				);
			}
		}
		// For single-line or text field pastes, let default behavior handle it
	};

	return (
		<Dialog.Root
			size="xl"
			placement="center"
			motionPreset="slide-in-top"
			open={appStore.songEdit.open}
			closeOnEscape={false}
			onInteractOutside={handleInteractOutside}
		>
			<Dialog.Backdrop />
			<Dialog.Positioner>
				<Dialog.Content h="85vh" maxW="70vw">
					<Dialog.Header pb={2} borderBottomWidth="1px" borderColor="gray.800">
						<HStack justifyContent="space-between" w="full">
							<HStack gap={3}>
								<Dialog.Title fontSize="lg" fontWeight="semibold">
									{song() ? "Edit Song" : "Create New Song"}
								</Dialog.Title>
								<Text fontSize="sm" color="gray.500">
									{lyrics.length} {lyrics.length === 1 ? "section" : "sections"}
								</Text>
							</HStack>
							<HStack gap={2}>
								<Show when={hasUnsavedChanges()}>
									<HStack gap={1} color="yellow.500" fontSize="xs">
										<FiAlertCircle size={12} />
										<Text>Unsaved changes</Text>
									</HStack>
								</Show>
								<Button
									size="xs"
									variant="ghost"
									disabled={!canUndo()}
									onClick={undo}
									title="Undo (Ctrl+Z)"
								>
									Undo
								</Button>
								<Button
									size="xs"
									variant="ghost"
									disabled={!canRedo()}
									onClick={redo}
									title="Redo (Ctrl+Y)"
								>
									Redo
								</Button>
							</HStack>
						</HStack>
					</Dialog.Header>
					<Dialog.Body overflow="hidden" p={0}>
						<Flex h="full">
							{/* Lyrics Editor Panel */}
							<Box
								flex="1"
								h="full"
								maxW={650}
								overflow="auto"
								borderRightWidth="1px"
								borderColor="gray.800"
								p={4}
								scrollBehavior="smooth"
							>
								{/* Loading State */}
								<Show when={isLoading()}>
									<Flex h="full" alignItems="center" justifyContent="center">
										<VStack gap={3}>
											<Spinner size="lg" colorPalette={defaultPalette} />
											<Text color="gray.400">Loading lyrics...</Text>
										</VStack>
									</Flex>
								</Show>

								{/* Empty State */}
								<Show when={!isLoading() && lyrics.length === 0}>
									<Flex h="full" alignItems="center" justifyContent="center">
										<VStack gap={3}>
											<Text color="gray.400">No lyrics yet</Text>
											<Button
												size="sm"
												colorPalette={defaultPalette}
												onClick={handleAddSection}
											>
												<FiPlus size={14} />
												Add first section
											</Button>
										</VStack>
									</Flex>
								</Show>

								{/* Lyrics Editor */}
								<Show when={!isLoading() && lyrics.length > 0}>
									<VStack alignItems="stretch" gap={3} ref={containerRef}>
										<For each={lyrics}>
											{(lyric, index) => (
												<LyricEdit
													index={index()}
													{...lyric}
													canDelete={lyrics.length > 1}
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
													onActiveEl={() => setSongMeta("current", index())}
													onPaste={handlePaste}
													onDelete={handleDeleteSection}
													onDuplicate={handleDuplicateSection}
												/>
											)}
										</For>

										{/* Add Section Button */}
										<Button
											w="full"
											variant="outline"
											colorPalette="gray"
											onClick={handleAddSection}
											py={6}
											borderStyle="dashed"
										>
											<FiPlus size={16} />
											Add section
										</Button>
									</VStack>
								</Show>

								{/* Keyboard hint */}
								<Box mt={4} pt={3} borderTopWidth="1px" borderColor="gray.800">
									<Text fontSize="xs" color="gray.500" textAlign="center">
										Use ↑↓ to navigate • Press ↓ at the end to add a new section
										• Ctrl+S to save
									</Text>
								</Box>
							</Box>

							{/* Preview Panel */}
							<Box
								// w="45%"
								// maxW="full"
								flex={1}
								h="full"
								py={4}
								px={6}
								display="flex"
								flexDirection="column"
								bgColor="gray.950"
							>
								<Box fontSize="sm" color="gray.400" mb={3} fontWeight="medium">
									Live Preview
								</Box>
								<Box
									flex="1"
									display="flex"
									alignItems="center"
									justifyContent="center"
								>
									<Box
										w="full"
										// maxW="400px"
										border="3px solid"
										borderColor={`${defaultPalette}.700`}
										borderRadius="md"
										overflow="hidden"
										shadow="lg"
									>
										<Box aspectRatio={16 / 9} bgColor="transparent">
											<RenderTheme
												data={parseThemeData(
													appStore.displayData.songTheme?.theme_data,
												)}
												renderMap={defaultThemeRenderMap}
											/>
										</Box>
									</Box>
								</Box>
							</Box>
						</Flex>
					</Dialog.Body>
					<Dialog.Footer pt={3} borderTopWidth="1px" borderColor="gray.800">
						<HStack justifyContent="flex-end" w="full" gap={6}>
							{/* Title Input */}
							<HStack gap={2}>
								<Input
									w="360px"
									placeholder="Enter song title..."
									variant="outline"
									size="sm"
									colorPalette={titleError() ? "red" : defaultPalette}
									borderColor={titleError() ? "red.500" : undefined}
									ref={titleInputEl}
									fontWeight="medium"
									onInput={() => setTitleError(false)}
									required
								/>
								<Show when={titleError()}>
									<Text fontSize="sm" color="red.400">
										Title is required
									</Text>
								</Show>
							</HStack>

							{/* Action Buttons */}
							<HStack gap={2}>
								<Button variant="ghost" onClick={closeModal}>
									Cancel
								</Button>
								<Button
									colorPalette={defaultPalette}
									onClick={saveSong}
									disabled={isSaving()}
								>
									<Show
										when={isSaving()}
										fallback={song() ? "Save Changes" : "Create Song"}
									>
										<Spinner size="sm" />
										Saving...
									</Show>
								</Button>
							</HStack>
						</HStack>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Positioner>
		</Dialog.Root>
	);
}

export default SongEditor;
