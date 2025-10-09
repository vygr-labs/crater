import { createEffect, createMemo, createSignal } from "solid-js"
import { useAppContext } from "~/layouts/AppContext"
import type { GroupCategory, GroupType } from "~/types"
import { Dialog } from "../ui/dialog"
import { Field } from "../ui/field"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import type { DialogOpenChangeDetails } from "@ark-ui/solid"
import { Portal } from "solid-js/web"
import { Box } from "styled-system/jsx"
import { produce } from "solid-js/store"

interface Props {
	open: boolean
	setOpen: (open: boolean) => void
	type: GroupType
	group: GroupCategory
	onAddGroup: (type: GroupType, group: GroupCategory, name: string) => void
}

export default function NamingModal() {
	const [name, setName] = createSignal('')
	const { appStore, setAppStore } = useAppContext()
    const type = createMemo(() => appStore.namingModal.type);
    const group = createMemo(() => appStore.namingModal.group);
    const open = createMemo(() => appStore.namingModal.open);

	const handleAddGroup = () => {
        console.log("Should add group: ", name(), type())
        setAppStore(produce(store => {
            const subGroups = store.displayGroups[type()][group()].subGroups
    
            if (subGroups) {
                const groupInfo = {
                    name: name(),
                    items: [],
                    id: subGroups.length
                }
                subGroups.push(groupInfo)
            }
        }))

		// if (group === 'favorite') {
		// 	createFavorite(groupInfo)
		// } else if (group === 'collection') {
		// 	createCollection(groupInfo)
		// }
	}

	const onSubmit = (e: SubmitEvent) => {
		e.preventDefault()
		handleAddGroup()
		setName('');
        onDialogOpen({ open: false });
	}

	const onDialogOpen = (e: DialogOpenChangeDetails) =>
		setAppStore("namingModal", { open: e.open, type: type(), group: group() })

	return (
		<Dialog.Root
			placement="center"
			motionPreset="slide-in-top"
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
                                {group() === 'collection'
                                    ? `new ${type()} collection`
                                    : `new list of favorite ${type()}s`}
                            </Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Field label={`Name`}>
                                <Input
                                    placeholder="My Star"
                                    variant="outline"
                                    value={name()}
                                    onChange={e => setName(e.target.value)}
                                />
                            </Field>
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
