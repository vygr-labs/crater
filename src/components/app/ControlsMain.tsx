import { createEffect, createMemo, Show } from "solid-js";
import { HStack, VStack } from "styled-system/jsx";
import { Tabs } from "../ui/tabs";
import type { SongData } from "~/types/context";
import { IconButton } from "../ui/icon-button";
import {
	TbBible,
	TbBook2,
	TbMusic,
	TbPalette,
	TbPlus,
	TbPresentation,
	TbVideo,
} from "solid-icons/tb";
import SongSelection from "./song/SongSelection";
import ScriptureSelection from "./scripture/ScriptureSelection";
import StrongsSelection from "./strongs/StrongsSelection";
import {
	useFocusContext,
	type FocusEventHandlerFn,
} from "~/layouts/FocusContext";
import {
	DEFAULT_PANEL,
	defaultPalette,
	GLOBAL_FOCUS_NAME,
	LIVE_PANEL_FOCUS_NAME,
	MEDIA_TAB_FOCUS_NAME,
	PRESENTATIONS_TAB_FOCUS_NAME,
	PREVIEW_PANEL_FOCUS_NAME,
	SCHEDULE_PANEL_FOCUS_NAME,
	SCRIPTURE_TAB_FOCUS_NAME,
	SONGS_TAB_FOCUS_NAME,
	STRONGS_TAB_FOCUS_NAME,
	THEMES_TAB_FOCUS_NAME,
} from "~/utils/constants";
import ThemeSelection from "./theme/ThemeSelection";
import {
	addToSchedule,
	toggleClearDisplay,
	toggleLogo,
} from "~/utils/store-helpers";
import { useAppContext } from "~/layouts/AppContext";
import { unwrap } from "solid-js/store";
import MediaSelection from "./media/MediaSelection";

export default function ControlsMain() {
	const { changeFocusPanel, subscribeEvent, currentPanel } = useFocusContext();
	const { appStore, setAppStore, settings } = useAppContext();
	const handleAddToSchedule = () => {
		if (appStore.previewItem) {
			addToSchedule(setAppStore, [{ ...appStore.previewItem }]);
		}
		console.log("Schedule Updated: ", appStore.scheduleItems);
	};

	const handleShortcutT: FocusEventHandlerFn = ({ event }) => {
		if (event.ctrlKey) {
			console.log("Adding Item: ");
			handleAddToSchedule();
		}
	};

	const handleShortcutL: FocusEventHandlerFn = ({ event }) => {
		console.log("handling shortcut: ", event);
		if (event.ctrlKey) {
			toggleLogo(setAppStore);
		}
	};

	const handleShortcutC: FocusEventHandlerFn = ({ event }) => {
		console.log("handling shortcut: ", event);
		if (event.ctrlKey) {
			toggleClearDisplay(setAppStore);
		}
	};

	// Panel switching shortcuts (Ctrl+1 through Ctrl+8)
	const handleShortcut1: FocusEventHandlerFn = ({ event }) => {
		if (event.ctrlKey) {
			changeFocusPanel(SCHEDULE_PANEL_FOCUS_NAME);
		}
	};

	const handleShortcut2: FocusEventHandlerFn = ({ event }) => {
		if (event.ctrlKey) {
			changeFocusPanel(PREVIEW_PANEL_FOCUS_NAME);
		}
	};

	const handleShortcut3: FocusEventHandlerFn = ({ event }) => {
		if (event.ctrlKey) {
			changeFocusPanel(LIVE_PANEL_FOCUS_NAME);
		}
	};

	const handleShortcut4: FocusEventHandlerFn = ({ event }) => {
		if (event.ctrlKey) {
			changeFocusPanel(SONGS_TAB_FOCUS_NAME);
		}
	};

	const handleShortcut5: FocusEventHandlerFn = ({ event }) => {
		if (event.ctrlKey) {
			changeFocusPanel(SCRIPTURE_TAB_FOCUS_NAME);
		}
	};

	const handleShortcut6: FocusEventHandlerFn = ({ event }) => {
		if (event.ctrlKey) {
			changeFocusPanel(STRONGS_TAB_FOCUS_NAME);
		}
	};

	const handleShortcut7: FocusEventHandlerFn = ({ event }) => {
		if (event.ctrlKey) {
			changeFocusPanel(MEDIA_TAB_FOCUS_NAME);
		}
	};

	const handleShortcut8: FocusEventHandlerFn = ({ event }) => {
		if (event.ctrlKey) {
			changeFocusPanel(THEMES_TAB_FOCUS_NAME);
		}
	};

	// Modal shortcuts
	const handleShortcutE: FocusEventHandlerFn = ({ event }) => {
		if (event.ctrlKey) {
			// If current preview item is a song, open it for editing
			const previewItem = appStore.previewItem;
			if (previewItem?.type === "song" && previewItem.metadata) {
				setAppStore("songEdit", { open: true, song: previewItem.metadata as SongData });
			} else {
				// Otherwise just open the editor (will be empty or use default)
				setAppStore("songEdit", { open: true, song: null });
			}
		}
	};

	// New song shortcut (Ctrl+N)
	const handleShortcutN: FocusEventHandlerFn = ({ event }) => {
		if (event.ctrlKey) {
			setAppStore("songEdit", { open: true, song: null });
		}
	};

	const handleShortcutComma: FocusEventHandlerFn = ({ event }) => {
		if (event.ctrlKey) {
			setAppStore("openSettings", true);
		}
	};

	const { name, coreFocusId, fluidFocusId, changeFluidFocus } = subscribeEvent({
		name: GLOBAL_FOCUS_NAME,
		defaultCoreFocus: 0,
		defaultFluidFocus: 0,
		handlers: {
			t: handleShortcutT,
			T: handleShortcutT,
			c: handleShortcutC,
			C: handleShortcutC,
			l: handleShortcutL,
			L: handleShortcutL,
			// Panel switching shortcuts (Ctrl+1-8)
			"1": handleShortcut1,
			"2": handleShortcut2,
			"3": handleShortcut3,
			"4": handleShortcut4,
			"5": handleShortcut5,
			"6": handleShortcut6,
			"7": handleShortcut7,
			"8": handleShortcut8,
			// Modal shortcuts
			e: handleShortcutE,
			E: handleShortcutE,
			n: handleShortcutN,
			N: handleShortcutN,
			",": handleShortcutComma,
		},
		global: true,
	});

	// Track which tabs are valid for switching
	const tabPanels = createMemo(() => {
		const panels = [
			SONGS_TAB_FOCUS_NAME,
			SCRIPTURE_TAB_FOCUS_NAME,
			...(settings.showStrongsTab ? [STRONGS_TAB_FOCUS_NAME] : []),
			MEDIA_TAB_FOCUS_NAME,
			THEMES_TAB_FOCUS_NAME,
		];
		return panels;
	});

	// Derive controlled tab value from currentPanel
	const controlledTabValue = createMemo(() => {
		const panel = currentPanel();
		return panel && tabPanels().includes(panel) ? panel : undefined;
	});

	return (
		<VStack h="full">
			<Tabs.Root
				w="full"
				h="full"
				variant="line"
				colorPalette={defaultPalette}
				display="flex"
				flexDir="column"
				defaultValue={DEFAULT_PANEL}
				value={controlledTabValue()}
				onValueChange={({ value }) => {
					console.log("About to change panel: ", value);
					changeFocusPanel(value);
				}}
			>
				<HStack pr={4}>
					<Tabs.List
						gap={2}
						w="full"
						bg="bg.muted"
						// py="1"
						pl="2"
						fontFamily="heading"
						css={{
							"& [data-part=trigger]": {
								px: 4,
								_focus: { outline: "none" },
							},
						}}
					>
						<Tabs.Trigger value={SONGS_TAB_FOCUS_NAME}>
							<TbMusic />
							Songs
						</Tabs.Trigger>
						<Tabs.Trigger value={SCRIPTURE_TAB_FOCUS_NAME} px={4}>
							<TbBible />
							Scripture
						</Tabs.Trigger>
						<Show when={settings.showStrongsTab}>
							<Tabs.Trigger value={STRONGS_TAB_FOCUS_NAME} px={4}>
								<TbBook2 />
								Strong's
							</Tabs.Trigger>
						</Show>
						<Tabs.Trigger value={MEDIA_TAB_FOCUS_NAME} px={4}>
							<TbVideo />
							Media
						</Tabs.Trigger>
						{/* <Tabs.Trigger value={PRESENTATIONS_TAB_FOCUS_NAME} px={4}>
							<TbPresentation />
							Presentations
						</Tabs.Trigger> */}
						<Tabs.Trigger value={THEMES_TAB_FOCUS_NAME} px={4}>
							<TbPalette />
							Themes
						</Tabs.Trigger>
						<Tabs.Indicator />
					</Tabs.List>

					<IconButton
						variant="subtle"
						size="xs"
						onClick={handleAddToSchedule}
						disabled={!appStore.previewItem}
					>
						<TbPlus />
					</IconButton>
				</HStack>
				<Tabs.ContentGroup
					bg="bg.muted"
					h="full"
					fontFamily="body"
					pos="relative"
					gap={0}
				>
					<Tabs.Content h="full" value={SONGS_TAB_FOCUS_NAME} py={0}>
						<SongSelection />
					</Tabs.Content>
					<Tabs.Content h="full" value={SCRIPTURE_TAB_FOCUS_NAME} py={0}>
						<ScriptureSelection />
					</Tabs.Content>
					<Show when={settings.showStrongsTab}>
						<Tabs.Content h="full" value={STRONGS_TAB_FOCUS_NAME} py={0}>
							<StrongsSelection />
						</Tabs.Content>
					</Show>
					<Tabs.Content value={MEDIA_TAB_FOCUS_NAME} h="full" py={0}>
						<MediaSelection />
					</Tabs.Content>
					{/* <Tabs.Content value={PRESENTATIONS_TAB_FOCUS_NAME}>
						Manage your tasks for freelancers
					</Tabs.Content> */}
					<Tabs.Content value={THEMES_TAB_FOCUS_NAME} h="full" py={0}>
						<ThemeSelection />
					</Tabs.Content>
				</Tabs.ContentGroup>
			</Tabs.Root>
		</VStack>
	);
}
