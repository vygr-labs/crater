import { Index } from "solid-js";
import { Accordion } from "../ui/accordion";
import { Box, Grid } from "styled-system/jsx";
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

export default function AppControls() {
    return (
        <AppContextProvider>
            <Box w="vw" h="vh" bg="bg.muted" pos="relative" overflow="hidden">
                <MenuBar />
                <Grid
				w="full"
				h="7/12"
				columns={3}
				pos="absolute"
				top="calc(100%/12)"
			>
				<Box h="full" border="1px solid" borderColor="gray.700">
					{/* <ScheduleComponent /> */}
				</Box>
				<Box h="full" border="1px solid" borderColor="gray.700">
					{/* <PreviewComponent /> */}
				</Box>
				<Box h="full" border="1px solid" borderColor="gray.700">
					{/* <LiveComponent /> */}
				</Box>
			</Grid>
            <Box w="full" h="4/12" pos="absolute" bottom="0">
				<ControlsMain />
			</Box>
			<AppSettingsDialog />
			<AppLoading />

			{/* Song Editor Modal */}
			{/* <SongEditor /> */}

			{/* <Editor resolver={{ UserContainer, UserText, UserRootContainer }}>
				<ThemeEditor />
			</Editor> */}

			{/* Naming Modal */}
			{/* <NamingModal /> */}
            </Box>
        </AppContextProvider>
    )
}