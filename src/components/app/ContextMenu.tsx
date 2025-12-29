import { Box } from "styled-system/jsx";
import { Menu } from "../ui/menu";
import type { JSXElement, ParentProps, Ref } from "solid-js";
import { createSignal, onMount, Show } from "solid-js";

interface Props extends ParentProps {
	ref: Ref<Element>;
	content?: JSXElement;
	open: boolean;
	setOpen: (o: boolean) => void;
}

export default function ContextMenu(props: Props) {
	return (
		<Box w="full" h="full">
			<Menu.Root
				// open={props.open}
				// onOpenChange={(details) => {
				// 	props.setOpen(details.open);
				// }}
				// onSelect={() => {
				// 	props.setOpen(false);
				// }}
				// onPointerDownOutside={() => {
				// 	props.setOpen(false);
				// }}
			>
				<Menu.ContextTrigger
					asChild={(triggerProps) => (
						<Box
							w="full"
							h="full"
							overflow="auto"
							ref={props.ref}
							{...triggerProps()}
						>
							{props.children}
						</Box>
					)}
				></Menu.ContextTrigger>
				<Menu.Positioner>
					<Show when={props.content}>{props.content}</Show>
				</Menu.Positioner>
			</Menu.Root>
		</Box>
	);
}
