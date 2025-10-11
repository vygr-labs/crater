import { Index } from "solid-js";
import { Accordion } from "../ui/accordion";
import { Box, Flex, Grid } from "styled-system/jsx";
import { TbChevronDown, TbX } from "solid-icons/tb";
import { Dialog } from "../ui/dialog";
import { Portal } from "solid-js/web";
import { Button } from "../ui/button";
import { IconButton } from "../ui/icon-button";
import MenuBar from "./MenuBar";
import AppContextProvider from "~/layouts/AppContext";
import AppLoading from "../modals/AppLoading";
import { AppSettingsDialog } from "../modals/AppSettingsDialog";
import ControlsMain from "./ControlsMain";
import FocusContextProvider from "~/layouts/FocusContext";
import PreviewPanel from "./PreviewPanel";
import NamingModal from "../modals/NamingModal";
import LivePanel from "./LivePanel";
import RenderToaster from "./RenderToaster";
import ThemeEditor from "../modals/ThemeEditor";
import Editor from "./editor/Editor";
import EditorContainer from "../app/editor/ui/Container"

const config = {
    EditorContainer
}

export default function AppControls() {
	return (
		<AppContextProvider>
			<FocusContextProvider>
				<Box w="vw" h="vh" bg="bg.muted" pos="relative" overflow="hidden">
					<MenuBar />
					<Flex
						w="full"
						h="7/12"
						columns={3}
						pos="absolute"
						top="calc(100%/12)"
					>
						<Box w="1/3" h="full" border="1px solid" borderColor="gray.700">
							{/* <ScheduleComponent /> */}
						</Box>
						<Box w="1/3" h="full" border="1px solid" borderColor="gray.700">
							<PreviewPanel />
						</Box>
						<Box w="1/3" h="full" border="1px solid" borderColor="gray.700">
							<LivePanel />
						</Box>
					</Flex>

					<Box w="full" h="4/12" pos="absolute" bottom="0">
						<ControlsMain />
					</Box>

					<AppSettingsDialog />
					<AppLoading />
					<NamingModal />

					{/* Song Editor Modal */}
					{/* <SongEditor /> */}

					{/* <Editor resolver={{ UserContainer, UserText, UserRootContainer }}>
						<ThemeEditor />
					</Editor> */}
					<Editor renderMap={config}>
						<ThemeEditor />
					</Editor>

					<RenderToaster />
				</Box>
			</FocusContextProvider>
		</AppContextProvider>
	)
}