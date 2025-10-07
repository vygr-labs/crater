import { HStack, VStack } from "styled-system/jsx";
import { Tabs } from "../ui/tabs";
import { IconButton } from "../ui/icon-button";
import { TbBible, TbMusic, TbPalette, TbPlus, TbPresentation, TbVideo } from "solid-icons/tb";
import SongSelection from "./song/SongSelection";
import ScriptureSelection from "./scripture/ScriptureSelection";
import ThemeSelection from "./theme/ThemeSelection";

export default function ControlsMain() {
    return (
        <VStack h="full">
			<Tabs.Root
				w="full"
				h="full"
				variant="plain"
				display="flex"
				flexDir="column"
				// defaultValue={DEFAULT_TAB}
				// value={currentTab}
				// onValueChange={changeKeyboardFocus}
			>
				<HStack pr={4}>
					<Tabs.List
						gap={2}
						w="full"
						bg="bg.muted"
						py="1"
						pl="2"
						fontFamily="heading"
					>
						<Tabs.Trigger value="songs" px={4} _focus={{ outline: 'none' }}>
							<TbMusic />
							Songs
						</Tabs.Trigger>
						<Tabs.Trigger value="scripture" px={4}>
							<TbBible />
							Scripture
						</Tabs.Trigger>
						<Tabs.Trigger value="media" px={4}>
							<TbVideo />
							Media
						</Tabs.Trigger>
						<Tabs.Trigger value="presentations" px={4}>
							<TbPresentation />
							Presentations
						</Tabs.Trigger>
						<Tabs.Trigger value="themes" px={4}>
							<TbPalette />
							Themes
						</Tabs.Trigger>
						<Tabs.Indicator rounded="l2" />
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
				>
					{/* {isPending ? <ControlsLoading /> : null} */}
					<Tabs.Content h="full" value="songs" py={0}>
						<SongSelection />
					</Tabs.Content>
					<Tabs.Content h="full" value="scripture" py={0}>
						<ScriptureSelection />
					</Tabs.Content>
					<Tabs.Content value="media" h="full" py={0}>
						{/* <MediaSelection /> */}
					</Tabs.Content>
					<Tabs.Content value="presentations">
						Manage your tasks for freelancers
					</Tabs.Content>
					<Tabs.Content value="themes" h="full" py={0}>
						<ThemeSelection />
					</Tabs.Content>
				</Tabs.ContentGroup>
			</Tabs.Root>
		</VStack>
    )
}