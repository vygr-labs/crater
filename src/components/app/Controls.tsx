import { Index } from "solid-js";
import { Accordion } from "../ui/accordion";
import { Box } from "styled-system/jsx";
import { TbChevronDown, TbX } from "solid-icons/tb";
import { Dialog } from "../ui/dialog";
import { Portal } from "solid-js/web";
import { Button } from "../ui/button";
import { IconButton } from "../ui/icon-button";

export default function AppControls() {
    return (
        <Box p={10}>
            <Accordion.Root collapsible size="sm" defaultValue={['React']}>
                <Index each={['React', 'Solid', 'Vue', 'Svelte']}>
                    {(item) => (
                        <Accordion.Item value={item()}>
                            <Accordion.ItemTrigger>
                                <Box as="span" flex={1}>What is {item()}?</Box>
                                <Accordion.ItemIndicator>
                                    <TbChevronDown />
                                </Accordion.ItemIndicator>
                            </Accordion.ItemTrigger>
                            <Accordion.ItemContent>
                                <Box pt={2} pb={4}>
                                    {item()} is a JavaScript library for building user interfaces.
                                </Box>
                            </Accordion.ItemContent>
                        </Accordion.Item>
                    )}
                </Index>
            </Accordion.Root>

            <Dialog.Root>
      <Dialog.Trigger asChild={triggerProps => (
        <Button variant="outline" size="sm" {...triggerProps()}>
          Open Dialog
        </Button>
      )}>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Dialog Title</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </Dialog.Body>
            <Dialog.Footer>
                <Button variant="outline">Cancel</Button>
              <Button>Save</Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild={
                triggerProps => <IconButton variant="ghost" children={<TbX />} size="sm" {...triggerProps()} />
            }>
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
        </Box>
    )
}