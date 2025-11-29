import { For, Show, createMemo } from "solid-js";
import { Box, Flex, HStack, VStack } from "styled-system/jsx";
import { useEditor } from "../Editor";
import { Text } from "~/components/ui/text";
import { IconButton } from "~/components/ui/icon-button";
import {
	TbEye,
	TbEyeOff,
	TbLock,
	TbLockOpen,
	TbTrash,
	TbCopy,
	TbArrowUp,
	TbArrowDown,
	TbTextCaption,
	TbContainer,
} from "solid-icons/tb";
import { css } from "styled-system/css";
import type { EditorNode, NodeId } from "../editor-types";

interface LayerItemProps {
	node: EditorNode;
	isSelected: boolean;
	onSelect: (id: NodeId) => void;
	onDelete: (id: NodeId) => void;
	onDuplicate: (id: NodeId) => void;
	onMoveUp: (id: NodeId) => void;
	onMoveDown: (id: NodeId) => void;
	onToggleVisibility: (id: NodeId) => void;
	onToggleLock: (id: NodeId) => void;
	index: number;
	total: number;
}

function LayerItem(props: LayerItemProps) {
	const isHidden = () => props.node.data.isHidden ?? false;
	const isLocked = () => props.node.data.isLocked ?? false;

	const getIcon = () => {
		switch (props.node.compName) {
			case "EditorText":
				return <TbTextCaption size={14} />;
			case "EditorContainer":
				return <TbContainer size={14} />;
			default:
				return <TbContainer size={14} />;
		}
	};

	const getLabel = () => {
		if (props.node.data.layerName) return props.node.data.layerName;
		switch (props.node.compName) {
			case "EditorText":
				return `Text ${props.index + 1}`;
			case "EditorContainer":
				return `Container ${props.index + 1}`;
			default:
				return `Layer ${props.index + 1}`;
		}
	};

	return (
		<Flex
			px={2}
			py={1.5}
			gap={2}
			alignItems="center"
			cursor="pointer"
			bg={props.isSelected ? "purple.900/50" : "transparent"}
			borderLeft="2px solid"
			borderLeftColor={props.isSelected ? "purple.500" : "transparent"}
			_hover={{ bg: props.isSelected ? "purple.900/50" : "gray.700/50" }}
			opacity={isHidden() ? 0.5 : 1}
			onClick={() => props.onSelect(props.node.id)}
			class="layer-item"
		>
			<Box color="gray.400">{getIcon()}</Box>
			<Text
				flex="1"
				fontSize="xs"
				truncate
				color={isHidden() ? "gray.500" : "gray.200"}
			>
				{getLabel()}
			</Text>

			<HStack
				gap={0.5}
				class="layer-actions"
				opacity={0}
				_groupHover={{ opacity: 1 }}
			>
				<IconButton
					size="2xs"
					variant="ghost"
					onClick={(e) => {
						e.stopPropagation();
						props.onToggleVisibility(props.node.id);
					}}
					title={isHidden() ? "Show" : "Hide"}
				>
					{isHidden() ? <TbEyeOff size={12} /> : <TbEye size={12} />}
				</IconButton>
				<IconButton
					size="2xs"
					variant="ghost"
					onClick={(e) => {
						e.stopPropagation();
						props.onToggleLock(props.node.id);
					}}
					title={isLocked() ? "Unlock" : "Lock"}
				>
					{isLocked() ? <TbLock size={12} /> : <TbLockOpen size={12} />}
				</IconButton>
				<IconButton
					size="2xs"
					variant="ghost"
					disabled={props.index === 0}
					onClick={(e) => {
						e.stopPropagation();
						props.onMoveUp(props.node.id);
					}}
					title="Move Up"
				>
					<TbArrowUp size={12} />
				</IconButton>
				<IconButton
					size="2xs"
					variant="ghost"
					disabled={props.index === props.total - 1}
					onClick={(e) => {
						e.stopPropagation();
						props.onMoveDown(props.node.id);
					}}
					title="Move Down"
				>
					<TbArrowDown size={12} />
				</IconButton>
				<IconButton
					size="2xs"
					variant="ghost"
					onClick={(e) => {
						e.stopPropagation();
						props.onDuplicate(props.node.id);
					}}
					title="Duplicate"
				>
					<TbCopy size={12} />
				</IconButton>
				<IconButton
					size="2xs"
					variant="ghost"
					colorPalette="red"
					onClick={(e) => {
						e.stopPropagation();
						props.onDelete(props.node.id);
					}}
					title="Delete"
				>
					<TbTrash size={12} />
				</IconButton>
			</HStack>
		</Flex>
	);
}

export interface LayersPanelProps {
	onDelete: (id: NodeId) => void;
	onDuplicate: (id: NodeId) => void;
	onMoveUp: (id: NodeId) => void;
	onMoveDown: (id: NodeId) => void;
	onToggleVisibility: (id: NodeId) => void;
	onToggleLock: (id: NodeId) => void;
}

export default function LayersPanel(props: LayersPanelProps) {
	const {
		editor,
		getters: { getSelectedNode },
		helpers: { selectNode },
	} = useEditor();

	// Get sorted node IDs to avoid recreating array on every node property change
	const sortedNodeIds = createMemo(() => {
		return Object.keys(editor.nodes).sort((idA, idB) => {
			const zA = parseInt(String(editor.nodes[idA]?.style?.["z-index"] ?? 0));
			const zB = parseInt(String(editor.nodes[idB]?.style?.["z-index"] ?? 0));
			return zB - zA;
		});
	});

	return (
		<Box
			w="200px"
			h="full"
			bg="gray.900"
			borderRight="1px solid"
			borderRightColor="gray.800"
			overflow="hidden"
			display="flex"
			flexDirection="column"
		>
			<Box px={3} py={2} borderBottom="1px solid" borderBottomColor="gray.800">
				<Text
					fontSize="xs"
					fontWeight="semibold"
					color="gray.400"
					textTransform="uppercase"
				>
					Layers
				</Text>
			</Box>
			<Box flex="1" overflow="auto">
				<VStack gap={0} alignItems="stretch">
					<Show
						when={sortedNodeIds().length > 0}
						fallback={
							<Box p={3}>
								<Text fontSize="xs" color="gray.500" textAlign="center">
									No elements yet
								</Text>
							</Box>
						}
					>
						<For each={sortedNodeIds()}>
							{(nodeId, index) => {
								const node = () => editor.nodes[nodeId];
								return (
									<Show when={node()}>
										<Box
											class={css({
												"& .layer-actions": { opacity: 0 },
												"&:hover .layer-actions": { opacity: 1 },
											})}
										>
											<LayerItem
												node={node()!}
												index={index()}
												total={sortedNodeIds().length}
												isSelected={getSelectedNode()?.id === nodeId}
												onSelect={selectNode}
												onDelete={props.onDelete}
												onDuplicate={props.onDuplicate}
												onMoveUp={props.onMoveUp}
												onMoveDown={props.onMoveDown}
												onToggleVisibility={props.onToggleVisibility}
												onToggleLock={props.onToggleLock}
											/>
										</Box>
									</Show>
								);
							}}
						</For>
					</Show>
				</VStack>
			</Box>
		</Box>
	);
}
