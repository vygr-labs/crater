import { createEffect, createMemo, createSignal } from "solid-js";
import { useAppContext } from "~/layouts/AppContext";
import type { GroupCategory, GroupType, ThemeInput } from "~/types";
import { Dialog } from "../ui/dialog";
import { Field, GenericField } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import type { DialogOpenChangeDetails } from "@ark-ui/solid";
import { Portal } from "solid-js/web";
import { Box, Flex } from "styled-system/jsx";
import { produce } from "solid-js/store";
import Editor, { useEditor } from "../app/editor/Editor";
import { Toolbox } from "../app/editor/ui/Toolbox";
import RenderEditor from "../app/editor/ui/RenderEditor";
import RenderEditorSettings from "../app/editor/ui/RenderEditorSettings";
import { useFps } from "solidjs-use";
import screenshotDiv from "html2canvas";
import { getKeyByValue, getToastType, toaster } from "~/utils";

interface Props {
	open: boolean;
	setOpen: (open: boolean) => void;
	type: GroupType;
	group: GroupCategory;
	onAddGroup: (type: GroupType, group: GroupCategory, name: string) => void;
}

export default function ThemeEditor() {
	const [name, setName] = createSignal("");
	const { appStore, setAppStore } = useAppContext();
	const type = createMemo(() => appStore.themeEditor.type);
	const open = createMemo(() => appStore.themeEditor.open);
	const initial = createMemo(() => appStore.themeEditor.initial);
	const {
		getters: { getRootRef },
		helpers: { exportTheme, loadTheme },
	} = useEditor();

	createEffect(() => {
		const reset = initial();
		console.log("Loading Theme: ", initial());
		loadTheme(reset ? JSON.parse(reset.theme_data) : undefined);
		setName(reset?.title ?? "");
	});

	const saveTheme = async () => {
		// e.preventDefault();
		const themeName = name();
		const rootRef = getRootRef();
		if (!rootRef || !themeName) return;

		const themeData = exportTheme();
		const formerTheme = initial();
		const canvas = await screenshotDiv(rootRef);
		let preview: ArrayBuffer;
		canvas.toBlob(async (blob) => {
			if (blob) {
				preview = await blob.arrayBuffer();
			}
			console.log("Here is the preview blob: ", preview);

			const theme: ThemeInput = {
				title: themeName,
				author: "Eyetu Kingsley",
				type: type(),
				theme_data: JSON.stringify(themeData),
				preview,
			};
			console.log("THEME TO ADD: ", theme);
			if (formerTheme === null) {
				const response = await window.electronAPI.addTheme(theme);
				console.log("Theme Added Successfully: ", response);
			} else {
				const { success, message, updatedTheme } =
					await window.electronAPI.updateTheme(formerTheme.id, theme);
				// const key = getKeyByValue(defaultThemes, formerTheme.id)
				// if (key && updatedTheme) {
				// 	if (key.startsWith('scripture')) {
				// 		dispatch(changeScriptureTheme(updatedTheme))
				// 	} else if (key.startsWith('song')) {
				// 		dispatch(changeSongTheme(updatedTheme))
				// 	}
				// }
				console.log("Updated Theme: ", updatedTheme);
				// dispatch(bustMediaCache([updatedTheme.preview_path]))

				// dispatch(updateThemeEditor({ open: false }))
				toaster.create({
					type: getToastType(success),
					title: message,
				});
				setName("");

				console.log(theme, success);
			}
			onDialogOpen({ open: false });
		});
	};

	const onDialogOpen = (e: DialogOpenChangeDetails) =>
		setAppStore("themeEditor", { open: e.open });

	const fps = useFps();
	return (
		<Dialog.Root
			placement="center"
			motionPreset="slide-in-top"
			size="xl"
			open={open()}
			onOpenChange={onDialogOpen}
		>
			{/* <Portal> */}
			<Dialog.Backdrop />
			<Dialog.Positioner>
				<Dialog.Content>
					<Box>
						<Dialog.Header>
							<Dialog.Title textTransform="capitalize">
								{type()} Theme Editor Frames Per Second: {fps()}
							</Dialog.Title>
						</Dialog.Header>
						<Dialog.Body>
							{/* <Editor renderMap={config}> */}
							<Flex>
								<Box w="full">
									<Toolbox />
									<RenderEditor />
								</Box>
								{/* <Box w="1/3">
                                        <RenderEditorSettings />
                                    </Box> */}
							</Flex>
							{/* </Editor> */}
						</Dialog.Body>
						<Dialog.Footer>
							{/* <DialogActionTrigger asChild> */}
							<GenericField maxW="xs">
								<Input
									placeholder="Name your theme"
									variant="subtle"
									value={name()}
									onChange={(e) => setName(e.target.value)}
								/>
							</GenericField>
							<Button
								variant="outline"
								onclick={() => onDialogOpen({ open: false })}
							>
								Cancel
							</Button>
							{/* </DialogActionTrigger> */}
							{/* <DialogActionTrigger asChild> */}
							<Button type="submit" onclick={saveTheme}>
								Save
							</Button>
							{/* </DialogActionTrigger> */}
						</Dialog.Footer>
					</Box>
					<Dialog.CloseTrigger />
				</Dialog.Content>
			</Dialog.Positioner>
			{/* </Portal> */}
		</Dialog.Root>
	);
}
