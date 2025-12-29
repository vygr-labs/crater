import { Box } from "styled-system/jsx";
import * as CustomContextMenu from "../ui/custom-context-menu";
import type { JSXElement, ParentProps, Ref } from "solid-js";

interface Props extends ParentProps {
	ref: Ref<Element>;
	content?: JSXElement;
	open: boolean;
	setOpen: (o: boolean) => void;
}

export default function ContextMenu(props: Props) {
	return (
		<Box w="full" h="full">
			<CustomContextMenu.Root
				open={props.open}
				onOpenChange={(open) => {
					props.setOpen(open);
				}}
			>
				<CustomContextMenu.Trigger ref={props.ref}>
					{props.children}
				</CustomContextMenu.Trigger>
				<CustomContextMenu.Content>
					{props.content}
				</CustomContextMenu.Content>
			</CustomContextMenu.Root>
		</Box>
	);
}
