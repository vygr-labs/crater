import { createEffect, createMemo, createSignal } from "solid-js"
import { useAppContext } from "~/layouts/AppContext"
import type { GroupCategory, GroupType } from "~/types"
import { Dialog } from "../ui/dialog"
import { Field } from "../ui/field"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import type { DialogOpenChangeDetails } from "@ark-ui/solid"
import { Portal } from "solid-js/web"
import { Box, Flex } from "styled-system/jsx"
import { produce } from "solid-js/store"
import Editor, { useEditor } from "../app/editor/Editor"
import { Toolbox } from "../app/editor/ui/Toolbox"
import RenderEditor from "../app/editor/ui/RenderEditor"
import RenderEditorSettings from "../app/editor/ui/RenderEditorSettings"
import { useFps } from "solidjs-use"

interface Props {
    open: boolean
    setOpen: (open: boolean) => void
    type: GroupType
    group: GroupCategory
    onAddGroup: (type: GroupType, group: GroupCategory, name: string) => void
}

export default function ThemeEditor() {
    const [name, setName] = createSignal('')
    const { appStore, setAppStore } = useAppContext()
    const type = createMemo(() => appStore.themeEditor.type);
    const open = createMemo(() => appStore.themeEditor.open);
    const {selected} = useEditor();

    const onSubmit = (e: SubmitEvent) => {
        e.preventDefault()
        setName('');
        // onDialogOpen({ open: false });
    }

    const onDialogOpen = (e: DialogOpenChangeDetails) =>
        setAppStore("themeEditor", { open: e.open })

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
                <Dialog.Content onSubmit={onSubmit}>
                    <Box as="form">
                        <Dialog.Header>
                            <Dialog.Title textTransform="capitalize">
                                Theme Editor - {selected?.id}
                                Frames Per Second: {fps()}
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
                            <Button variant="outline" onClick={() => onDialogOpen({ open: false })}>Cancel</Button>
                            {/* </DialogActionTrigger> */}
                            {/* <DialogActionTrigger asChild> */}
                            <Button type="submit">Save</Button>
                            {/* </DialogActionTrigger> */}
                        </Dialog.Footer>
                    </Box>
                    <Dialog.CloseTrigger />
                </Dialog.Content>
            </Dialog.Positioner>
            {/* </Portal> */}
        </Dialog.Root>
    )
}
