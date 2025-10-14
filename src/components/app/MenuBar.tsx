// import {
// 	Box,
// 	HStack,
// 	Icon,
// 	IconButton,
// 	Switch,
// 	SwitchCheckedChangeDetails,
// 	Text,
// } from '@chakra-ui/react'
// import { SegmentedControl } from '@/components/ui/segmented-control'
// import { GrClear } from 'react-icons/gr'
// import { TfiLayoutMediaLeftAlt } from 'react-icons/tfi'
// import { FaChevronDown } from 'react-icons/fa'
// import { IoMdSettings } from 'react-icons/io'
// import { Button } from '@/components/ui/button'
// import {
// 	MenuContent,
// 	MenuItem,
// 	MenuRoot,
// 	MenuTrigger,
// } from '@/components/ui/menu'
// import { ChakraValueChangeDetails } from '@/utils/types'
// import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
// import {
// 	updateAppLoading,
// 	toggleClearDisplay,
// 	toggleLogo,
// 	triggerSongsUpdate,
// 	toggleLive,
// } from '@/utils/redux/appSlice'
// import { TbArrowsRightDown } from 'react-icons/tb'
// import { toaster } from '../ui/toaster'
// import { getToastType } from '@/utils'
// import { useTransition } from 'react'
// import { defaultPalette } from '@/utils/constants'
import { HStack } from 'styled-system/jsx';
import { useAppContext } from '~/layouts/AppContext'
import { Menu } from '../ui/menu';
import { Button } from '../ui/button';
import { Icon } from '../ui/icon';
import { FaSolidChevronDown } from 'solid-icons/fa';
import { IconButton } from '../ui/icon-button';
import { ArkSwitch } from '../ui/switch';
import { Text } from '../ui/text';
import { TbArrowsRightDown, TbClearAll } from 'solid-icons/tb';
import { TiSortNumerically } from 'solid-icons/ti';
import { defaultPalette } from '~/utils/constants';
import { IoSettings } from 'solid-icons/io';
import { Portal } from 'solid-js/web';
import { toggleClearDisplay, toggleLive, toggleLogo } from '~/utils/store-helpers';
import type { SwitchCheckedChangeDetails } from '@ark-ui/solid';
import { BsDisplayFill } from 'solid-icons/bs';
import { unwrap } from 'solid-js/store';

export type Props = {
	// openAppSettings: () => void
}

export default function MenuBar(props: Props) {
	// const isHidden = useAppSelector(state => state.app.hideLive)
	// const showLogo = useAppSelector(state => state.app.showLogo)
	// const isLive = useAppSelector(state => state.app.isLive)
	// const bounds = useAppSelector(state => state.settings.projectionBounds)
	// const dispatch = useAppDispatch()
	// const [isPending, startTransition] = useTransition()
	const { appStore, setAppStore, settings, updateSettings } = useAppContext();

	function openImportDialog() {
		setAppStore("loading", { reason: 'Importing Database...', isLoading: true })
		window.electronAPI.importEswSongs().then(({ success, message }) => {
			console.log('Result from Dialog: ', message)
			// toaster.create({
			//     type: getToastType(success),
			//     title: message,
			// })

			setAppStore("songsUpdateCounter", former => former++)
			setAppStore("loading", { reason: 'Finished task', isLoading: false })
		})
	}

	function handleLiveToggle() {
		toggleLive(setAppStore); // toggleLive(setAppStore, checked)
		if (appStore.isLive) {
			window.electronAPI.closeProjectionWindow()
		} else {
			console.log(settings.projectionBounds);
			window.electronAPI.openProjectionWindow(unwrap(settings.projectionBounds))
		}
	}


	return (
		<HStack
			w="full"
			h="1/12"
			px="4"
			pos="absolute"
			top="0"
			justify="space-between"
		>
			<HStack gap={3}>
				<Menu.Root>
					<Menu.Trigger asChild={parentProps => (
						<Button variant="outline" size="sm" {...parentProps}>
							Schedule
							<Icon fontSize="sm">
								<FaSolidChevronDown />
							</Icon>
						</Button>
					)}>
					</Menu.Trigger>
					<Portal>
						<Menu.Positioner>
							<Menu.Content>
								<Menu.Item value="new">New</Menu.Item>
								<Menu.Item value="new-win">Save</Menu.Item>
								<Menu.Item value="open-file">Save as...</Menu.Item>
								<Menu.Item value="new-file">Open</Menu.Item>
							</Menu.Content>
						</Menu.Positioner>
					</Portal>
				</Menu.Root>

				<IconButton
					bgColor="gray.800"
					color="white"
					size="sm"
					onClick={() => {
						setAppStore("openSettings", true)
					}}
				>
					<IoSettings />
				</IconButton>

				<Button
					colorPalette="black"
					variant="outline"
					onClick={openImportDialog}
				>
					<TbArrowsRightDown /> Import
				</Button>
			</HStack>
			<HStack gap={6}>
				<HStack gap={3}>
					<Button
						onClick={() => toggleLogo(setAppStore)}
						variant={appStore.showLogo ? 'solid' : 'surface'}
						colorPalette={defaultPalette}
					>
						<Icon fontSize="2xl" aria-label="Show Logo">
							<TiSortNumerically />
						</Icon>
						<Text textStyle="xs">Logo</Text>
					</Button>

					<Button
						onClick={() =>
							toggleClearDisplay(setAppStore)
						}
						variant={appStore.hideLive ? 'solid' : 'surface'}
						colorPalette="red"
					>
						<Icon fontSize="2xl" aria-label="Clear Display">
							<TbClearAll />
						</Icon>
						<Text textStyle="xs">Clear</Text>
					</Button>
				</HStack>

				<Button variant={appStore.isLive ? "solid" : "surface"} colorPalette={defaultPalette} onclick={handleLiveToggle}>
					<BsDisplayFill /> Go Live
				</Button>
				{/* <ArkSwitch.Root
					size="lg"
					checked={appStore.isLive}
					onCheckedChange={handleLiveToggle}
					flexDir="column"
				>
					<ArkSwitch.HiddenInput />
					<ArkSwitch.Control>
						<ArkSwitch.Thumb />
					</ArkSwitch.Control>
					<ArkSwitch.Label fontSize="xs">Go Live</ArkSwitch.Label>
				</ArkSwitch.Root> */}
			</HStack>
		</HStack>
	)
}
