import { Index, onMount, onCleanup } from "solid-js";
import { Accordion } from "../ui/accordion";
import { Box, Flex, Grid } from "styled-system/jsx";
import { TbChevronDown, TbX } from "solid-icons/tb";
import { Dialog } from "../ui/dialog";
import { Portal } from "solid-js/web";
import { Button } from "../ui/button";
import { IconButton } from "../ui/icon-button";
import MenuBar from "./MenuBar";
import AppContextProvider, { useAppContext } from "~/layouts/AppContext";
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
import EditorContainer from "../app/editor/ui/Container";
import EditorText from "./editor/ui/Text";
import SchedulePanel from "./SchedulePanel";
import SongEditor from "../modals/SongEditor";
import { DisplayContextProvider } from "~/layouts/DisplayContext";
import { ConfirmDialogProvider } from "../modals/ConfirmDialog";
import { Splitter } from "../ui/splitter";
import { handleRemoteCommands } from "~/utils/remote-handlers";

const config = {
	EditorContainer,
	EditorText,
};

// Inner component that has access to AppContext
function RemoteHandlerSetup() {
	const { setAppStore } = useAppContext();
	
	onMount(() => {
		// Set up remote control event listeners
		const cleanup = handleRemoteCommands(setAppStore);
		
		onCleanup(() => {
			if (cleanup) cleanup();
		});
	});
	
	return null; // This component doesn't render anything
}

export default function AppControls() {
	onMount(() => {
		setTimeout(window.electronAPI.controlsWindowLoaded, 2000);
	});

	return (
		<AppContextProvider>
			<RemoteHandlerSetup />
			<FocusContextProvider>
				<ConfirmDialogProvider>
					<Box w="vw" h="vh" bg="bg.muted" pos="relative" overflow="hidden">
						<MenuBar />
						{/* Main layout with vertical splitter */}
						<Box w="full" h="11/12" pos="absolute" top="calc(100%/12)">
							<Splitter.Root
								defaultSize={[58, 42]}
								panels={[
									{ id: "panels", minSize: 30 },
									{ id: "controls", minSize: 20 },
								]}
								orientation="vertical"
								h="full"
							>
								{/* Top panels section */}
								<Splitter.Panel id="panels" w="full">
									<Splitter.Root
										defaultSize={[33, 34, 33]}
										panels={[
											{ id: "schedule", minSize: 15 },
											{ id: "preview", minSize: 20 },
											{ id: "live", minSize: 15 },
										]}
										orientation="horizontal"
										h="full"
									>
										<Splitter.Panel id="schedule" h="full" border="1px solid" borderColor="gray.700">
											<SchedulePanel />
										</Splitter.Panel>
										<Splitter.ResizeTrigger id="schedule:preview" />
										<Splitter.Panel id="preview" h="full" border="1px solid" borderColor="gray.700">
											<PreviewPanel />
										</Splitter.Panel>
										<Splitter.ResizeTrigger id="preview:live" />
										<Splitter.Panel id="live" h="full" border="1px solid" borderColor="gray.700">
											<LivePanel />
										</Splitter.Panel>
									</Splitter.Root>
								</Splitter.Panel>
								
								<Splitter.ResizeTrigger id="panels:controls" />
								
								{/* Bottom controls section */}
								<Splitter.Panel id="controls" w="full">
									<ControlsMain />
								</Splitter.Panel>
							</Splitter.Root>
						</Box>

						<AppSettingsDialog />
						<AppLoading />
						<NamingModal />

						{/* Song Editor Modal */}
						<DisplayContextProvider>
							<SongEditor />
						</DisplayContextProvider>

						{/* <Editor resolver={{ UserContainer, UserText, UserRootContainer }}>
							<ThemeEditor />
						</Editor> */}
						<Editor renderMap={config}>
							<ThemeEditor />
						</Editor>

						<RenderToaster />
					</Box>
				</ConfirmDialogProvider>
			</FocusContextProvider>
		</AppContextProvider>
	);
}
