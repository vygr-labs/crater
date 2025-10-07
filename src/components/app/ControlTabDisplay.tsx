import { Box, HStack } from "styled-system/jsx";
import { Menu } from "../ui/menu";
import { ImPlus } from "solid-icons/im";
import { TbChevronDown, TbChevronRight, TbSettings } from "solid-icons/tb";
import { createSignal, type JSXElement, type Ref } from "solid-js";

interface Props {
    contextMenuContent: JSXElement
    actionBarMenu: JSXElement
    children: JSXElement
    ref: Ref<Element>;
}

export default function ControlTabDisplay(props: Props) {
    const [contextOpen, setContextOpen] = createSignal(false);

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
				<Box w="full" h="full" tabIndex={0}>
					<Menu.Root open={contextOpen()}>
						<Menu.ContextTrigger asChild={triggerProps => (
							<Box w="full" h="full" overflow="auto" ref={props.ref} {...triggerProps()}>
                                {props.children}
								{/* <Virtuoso
									style={{ height: '100%' }}
									ref={virtuosoRef}
									totalCount={filteredSongs.length}
									itemContent={itemContent}
									overscan={20} // Increased overscan for smoother scrolling
									defaultItemHeight={30}
									followOutput={navigatedSong !== null}
								/> */}
							</Box>
                        )}>
						</Menu.ContextTrigger>
							<Menu.Positioner>
								{props.contextMenuContent}
							</Menu.Positioner>
					</Menu.Root>
				</Box>

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