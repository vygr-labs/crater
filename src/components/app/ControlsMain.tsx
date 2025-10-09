import { HStack, VStack } from "styled-system/jsx";
import { Tabs } from "../ui/tabs";
import { IconButton } from "../ui/icon-button";
import { TbBible, TbMusic, TbPalette, TbPlus, TbPresentation, TbVideo } from "solid-icons/tb";
import SongSelection from "./song/SongSelection";
import ScriptureSelection from "./scripture/ScriptureSelection";
import ThemeSelection from "./theme/ThemeSelection";
import { useFocusContext } from "~/layouts/FocusContext";
import { DEFAULT_PANEL, defaultPalette, MEDIA_TAB_FOCUS_NAME, PRESENTATIONS_TAB_FOCUS_NAME, SCRIPTURE_TAB_FOCUS_NAME, SONGS_TAB_FOCUS_NAME, THEMES_TAB_FOCUS_NAME } from "~/utils/constants";

export default function ControlsMain() {
	const { changeFocusPanel } = useFocusContext();

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
				onValueChange={({ value }) => changeFocusPanel(value)}
			>
				<HStack pr={4}>
					<Tabs.List
						gap={2}
						w="full"
						bg="bg.muted"
						// py="1"
						pl="2"
						fontFamily="heading"
					>
						<Tabs.Trigger value={SONGS_TAB_FOCUS_NAME} px={4} _focus={{ outline: 'none' }}>
							<TbMusic />
							Songs
						</Tabs.Trigger>
						<Tabs.Trigger value={SCRIPTURE_TAB_FOCUS_NAME} px={4}>
							<TbBible />
							Scripture
						</Tabs.Trigger>
						<Tabs.Trigger value={MEDIA_TAB_FOCUS_NAME} px={4}>
							<TbVideo />
							Media
						</Tabs.Trigger>
						<Tabs.Trigger value={PRESENTATIONS_TAB_FOCUS_NAME} px={4}>
							<TbPresentation />
							Presentations
						</Tabs.Trigger>
						<Tabs.Trigger value={THEMES_TAB_FOCUS_NAME} px={4}>
							<TbPalette />
							Themes
						</Tabs.Trigger>
						<Tabs.Indicator />
					</Tabs.List>

					<IconButton
						variant="subtle"
						size="xs"
						// onClick={() => handleAddToSchedule()}
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
					{/* {isPending ? <ControlsLoading /> : null} */}
					<Tabs.Content h="full" value={SONGS_TAB_FOCUS_NAME} py={0}>
						<SongSelection />
					</Tabs.Content>
					<Tabs.Content h="full" value={SCRIPTURE_TAB_FOCUS_NAME} py={0}>
						<ScriptureSelection />
					</Tabs.Content>
					<Tabs.Content value={MEDIA_TAB_FOCUS_NAME} h="full" py={0}>
						{/* <MediaSelection /> */}
					</Tabs.Content>
					<Tabs.Content value={PRESENTATIONS_TAB_FOCUS_NAME}>
						Manage your tasks for freelancers
					</Tabs.Content>
					<Tabs.Content value={THEMES_TAB_FOCUS_NAME} h="full" py={0}>
						<ThemeSelection />
					</Tabs.Content>
				</Tabs.ContentGroup>
			</Tabs.Root>
		</VStack>
    )
}