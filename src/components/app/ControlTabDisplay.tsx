import { Box, HStack } from "styled-system/jsx";
import { Menu } from "../ui/menu";
import { ImPlus } from "solid-icons/im";
import { TbChevronDown, TbChevronRight, TbSettings } from "solid-icons/tb";
import { createSignal, Show, type JSXElement, type Ref } from "solid-js";
import ContextMenu from "./ContextMenu";
import { Text } from "../ui/text";

interface Props {
	open: boolean;
	setOpen: (o: boolean) => void;
	contextMenuContent: JSXElement;
	actionBarMenu: JSXElement;
	children: JSXElement;
	ref: Ref<Element>;
	centerContent?: JSXElement;
}

export default function ControlTabDisplay(props: Props) {
	return (
		<>
			<Box
				w="3/4"
				h="full"
				pos="absolute"
				right="0"
				borderLeft="1px solid"
				borderLeftColor="gray.800"
				pb={7}
				bg="gray.950/30"
			>
				<ContextMenu
					open={props.open}
					setOpen={props.setOpen}
					content={props.contextMenuContent}
					ref={props.ref}
				>
					{props.children}
				</ContextMenu>

				{/* Bottom controls for right panel */}
				<HStack
					gap={0}
					position="fixed"
					bottom={0}
					w="full"
					h={6}
					bg="gray.800"
					borderTop="1px solid"
					borderTopColor="gray.700"
					justify="space-between"
				>
					{/* Left side - action buttons */}
					<HStack gap={0}>{props.actionBarMenu}</HStack>

					{/* Center - optional content like song count */}
					<Show when={props.centerContent}>
						<Box pos="absolute" left="50%" transform="translateX(-50%)">
							{props.centerContent}
						</Box>
					</Show>

					{/* Right side - placeholder for balance */}
					<Box />
				</HStack>
			</Box>
		</>
	);
}
