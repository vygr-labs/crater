import { Box, HStack } from "styled-system/jsx";
import { Menu } from "../ui/menu";
import { ImPlus } from "solid-icons/im";
import { TbChevronDown, TbChevronRight, TbSettings } from "solid-icons/tb";
import { createSignal, type JSXElement, type Ref } from "solid-js";
import ContextMenu from "./ContextMenu";

interface Props {
	open: boolean;
    contextMenuContent: JSXElement
    actionBarMenu: JSXElement
    children: JSXElement
    ref: Ref<Element>;
}

export default function ControlTabDisplay(props: Props) {
    return (
     <>
			<Box
				w="3/4"
				h="full"
				pos="absolute"
				right="0"
				border="1px solid"
				borderColor="gray.700"
				pb={7}
			>
				<ContextMenu open={props.open} content={props.contextMenuContent} ref={props.ref}>
					{props.children}
				</ContextMenu>

				{/* Bottom controls for right panel */}
				<HStack
					gap={0}
					position="fixed"
					bottom={0}
					w="full"
					h={6}
					bg="gray.700"
				>
                    {props.actionBarMenu}
				</HStack>
			</Box>
		</>   
    )
}