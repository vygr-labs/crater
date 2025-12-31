import { createEffect, createMemo, createSignal, Show } from "solid-js";
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
		// Don't trigger if any modal is open
		if (appStore.songEdit.open || appStore.themeEditor.open) return;
		if (event.ctrlKey) {
			console.log("Adding Item: ");
			handleAddToSchedule();
		}
	};

	const handleShortcutL: FocusEventHandlerFn = ({ event }) => {
		console.log("handling shortcut: ", event);
		// Don't trigger if any modal is open
		if (appStore.songEdit.open || appStore.themeEditor.open) return;
		if (event.ctrlKey) {
			toggleLogo(setAppStore);
		}
	};

	const handleShortcutC: FocusEventHandlerFn = ({ event }) => {
		console.log("handling shortcut: ", event);
		// Don't trigger if any modal is open
		if (appStore.songEdit.open || appStore.themeEditor.open) return;
		if (event.ctrlKey) {
			toggleClearDisplay(setAppStore);
		}
	};

	// Panel switching shortcuts (Ctrl+1 through Ctrl+8)
	const handleNumberShortcut = (num: number, event: KeyboardEvent) => {
		if (!event.ctrlKey) return;
		event.preventDefault();

		const tabs = tabPanels();
		// 1-based index for tabs
		if (num <= tabs.length) {
			changeFocusPanel(tabs[num - 1]);
		} else {
			// Panels after tabs
			const panelIndex = num - tabs.length;
			if (panelIndex === 1) changeFocusPanel(SCHEDULE_PANEL_FOCUS_NAME);
			else if (panelIndex === 2) changeFocusPanel(PREVIEW_PANEL_FOCUS_NAME);
			else if (panelIndex === 3) changeFocusPanel(LIVE_PANEL_FOCUS_NAME);
		}
	};

	const handleShortcut1: FocusEventHandlerFn = ({ event }) => handleNumberShortcut(1, event);
	const handleShortcut2: FocusEventHandlerFn = ({ event }) => handleNumberShortcut(2, event);
	const handleShortcut3: FocusEventHandlerFn = ({ event }) => handleNumberShortcut(3, event);
	const handleShortcut4: FocusEventHandlerFn = ({ event }) => handleNumberShortcut(4, event);
	const handleShortcut5: FocusEventHandlerFn = ({ event }) => handleNumberShortcut(5, event);
	const handleShortcut6: FocusEventHandlerFn = ({ event }) => handleNumberShortcut(6, event);
	const handleShortcut7: FocusEventHandlerFn = ({ event }) => handleNumberShortcut(7, event);
	const handleShortcut8: FocusEventHandlerFn = ({ event }) => handleNumberShortcut(8, event);

	const handleShortcutTab: FocusEventHandlerFn = ({ event }) => {
		if (!event.ctrlKey) return;
		event.preventDefault();

		const tabs = tabPanels();
		const current = currentPanel();
		const currentIndex = tabs.indexOf(current || "");

		if (currentIndex === -1) {
			// If not in a tab, go to the first tab
			changeFocusPanel(tabs[0]);
			return;
		}

		if (event.shiftKey) {
			// Previous
			const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
			changeFocusPanel(tabs[prevIndex]);
		} else {
			// Next
			const nextIndex = (currentIndex + 1) % tabs.length;
			changeFocusPanel(tabs[nextIndex]);
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
			Tab: handleShortcutTab,
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

	// Track the active tab separately so it doesn't deselect when focus moves to other panels (like Preview/Live)
	const [activeTab, setActiveTab] = createSignal(DEFAULT_PANEL);

	createEffect(() => {
		const panel = currentPanel();
		if (panel && tabPanels().includes(panel)) {
			setActiveTab(panel);
		}
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
				value={activeTab()}
				onValueChange={({ value }) => {
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
