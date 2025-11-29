import { Show } from "solid-js";
import { Box, Divider, HStack } from "styled-system/jsx";
import { IconButton } from "~/components/ui/icon-button";
import { Button } from "~/components/ui/button";
import { Tooltip } from "~/components/ui/tooltip";
import {
	TbArrowBackUp,
	TbArrowForwardUp,
	TbTrash,
	TbCopy,
	TbContainer,
	TbTextCaption,
	TbAlignLeft,
	TbAlignCenter,
	TbAlignRight,
	TbAlignBoxLeftTop,
	TbAlignBoxCenterMiddle,
	TbAlignBoxBottomCenter,
	TbArrowsVertical,
	TbArrowsHorizontal,
	TbLayersSubtract,
	TbLayersIntersect,
	TbZoomIn,
	TbZoomOut,
	TbZoomReset,
} from "solid-icons/tb";
import {
	AiOutlineVerticalAlignTop,
	AiOutlineVerticalAlignMiddle,
	AiOutlineVerticalAlignBottom,
} from "solid-icons/ai";
import { useEditor } from "../Editor";
import type { NodeId } from "../editor-types";
import EditorContainer from "./Container";
import EditorText from "./Text";
import { defaultPalette } from "~/utils/constants";

interface AddNodeBtnProps {
	editorComponent: any;
	children: any;
	title: string;
}

const AddNodeBtn = (props: AddNodeBtnProps) => {
	const { connectors } = useEditor();
	return (
		<Tooltip.Root openDelay={300} closeDelay={0}>
			<Tooltip.Trigger
				asChild={(triggerProps) => (
					<IconButton
						{...triggerProps()}
						size="sm"
						rounded="xs"
						variant="surface"
						colorPalette={defaultPalette}
						onClick={() => connectors.create(props.editorComponent)}
					>
						{props.children}
					</IconButton>
				)}
			/>
			<Tooltip.Positioner>
				<Tooltip.Content>
					<Tooltip.Arrow>
						<Tooltip.ArrowTip />
					</Tooltip.Arrow>
					{props.title}
				</Tooltip.Content>
			</Tooltip.Positioner>
		</Tooltip.Root>
	);
};

interface ToolbarBtnProps {
	onClick: () => void;
	disabled?: boolean;
	children: any;
	title: string;
	colorPalette?: string;
}

const ToolbarBtn = (props: ToolbarBtnProps) => (
	<Tooltip.Root openDelay={300} closeDelay={0}>
		<Tooltip.Trigger
			asChild={(triggerProps) => (
				<IconButton
					{...triggerProps()}
					size="xs"
					variant="ghost"
					disabled={props.disabled}
					onClick={props.onClick}
					colorPalette={props.colorPalette}
				>
					{props.children}
				</IconButton>
			)}
		/>
		<Tooltip.Positioner>
			<Tooltip.Content>
				<Tooltip.Arrow>
					<Tooltip.ArrowTip />
				</Tooltip.Arrow>
				{props.title}
			</Tooltip.Content>
		</Tooltip.Positioner>
	</Tooltip.Root>
);

export interface EnhancedToolbarProps {
	canUndo: boolean;
	canRedo: boolean;
	hasSelection: boolean;
	zoom: number;
	onUndo: () => void;
	onRedo: () => void;
	onDelete: () => void;
	onDuplicate: () => void;
	onAlignLeft: () => void;
	onAlignCenterH: () => void;
	onAlignRight: () => void;
	onAlignTop: () => void;
	onAlignCenterV: () => void;
	onAlignBottom: () => void;
	onBringToFront: () => void;
	onSendToBack: () => void;
	onZoomIn: () => void;
	onZoomOut: () => void;
	onZoomReset: () => void;
}

export default function EnhancedToolbar(props: EnhancedToolbarProps) {
	return (
		<HStack
			gap={2}
			px={3}
			py={2}
			bg="gray.900"
			borderBottom="1px solid"
			borderBottomColor="gray.800"
			flexWrap="wrap"
		>
			{/* Add Elements */}
			<HStack gap={2}>
				<AddNodeBtn editorComponent={EditorContainer} title="Add Container">
					<TbContainer size={16} />
				</AddNodeBtn>
				<AddNodeBtn editorComponent={EditorText} title="Add Text">
					<TbTextCaption size={16} />
				</AddNodeBtn>
			</HStack>

			<Divider orientation="vertical" h={6} />

			{/* Undo/Redo */}
			<HStack gap={1}>
				<ToolbarBtn
					onClick={props.onUndo}
					disabled={!props.canUndo}
					title="Undo (Ctrl+Z)"
				>
					<TbArrowBackUp size={16} />
				</ToolbarBtn>
				<ToolbarBtn
					onClick={props.onRedo}
					disabled={!props.canRedo}
					title="Redo (Ctrl+Y)"
				>
					<TbArrowForwardUp size={16} />
				</ToolbarBtn>
			</HStack>

			<Divider orientation="vertical" h={6} />

			{/* Selection Actions */}
			<HStack gap={1}>
				<ToolbarBtn
					onClick={props.onDuplicate}
					disabled={!props.hasSelection}
					title="Duplicate (Ctrl+D)"
				>
					<TbCopy size={16} />
				</ToolbarBtn>
				<ToolbarBtn
					onClick={props.onDelete}
					disabled={!props.hasSelection}
					title="Delete (Del)"
					colorPalette="red"
				>
					<TbTrash size={16} />
				</ToolbarBtn>
			</HStack>

			<Divider orientation="vertical" h={6} />

			{/* Horizontal Alignment */}
			<HStack gap={1}>
				<ToolbarBtn
					onClick={props.onAlignLeft}
					disabled={!props.hasSelection}
					title="Align Left"
				>
					<TbAlignLeft size={16} />
				</ToolbarBtn>
				<ToolbarBtn
					onClick={props.onAlignCenterH}
					disabled={!props.hasSelection}
					title="Align Center (Horizontal)"
				>
					<TbAlignCenter size={16} />
				</ToolbarBtn>
				<ToolbarBtn
					onClick={props.onAlignRight}
					disabled={!props.hasSelection}
					title="Align Right"
				>
					<TbAlignRight size={16} />
				</ToolbarBtn>
			</HStack>

			<Divider orientation="vertical" h={6} />

			{/* Vertical Alignment */}
			<HStack gap={1}>
				<ToolbarBtn
					onClick={props.onAlignTop}
					disabled={!props.hasSelection}
					title="Align Top"
				>
					<AiOutlineVerticalAlignTop size={16} />
				</ToolbarBtn>
				<ToolbarBtn
					onClick={props.onAlignCenterV}
					disabled={!props.hasSelection}
					title="Align Center (Vertical)"
				>
					<AiOutlineVerticalAlignMiddle size={16} />
				</ToolbarBtn>
				<ToolbarBtn
					onClick={props.onAlignBottom}
					disabled={!props.hasSelection}
					title="Align Bottom"
				>
					<AiOutlineVerticalAlignBottom size={16} />
				</ToolbarBtn>
			</HStack>

			<Divider orientation="vertical" h={6} />

			{/* Layer Order */}
			<HStack gap={1}>
				<ToolbarBtn
					onClick={props.onBringToFront}
					disabled={!props.hasSelection}
					title="Bring to Front"
				>
					<TbLayersSubtract size={16} />
				</ToolbarBtn>
				<ToolbarBtn
					onClick={props.onSendToBack}
					disabled={!props.hasSelection}
					title="Send to Back"
				>
					<TbLayersIntersect size={16} />
				</ToolbarBtn>
			</HStack>

			<Divider orientation="vertical" h={6} />

			{/* Zoom */}
			<HStack gap={1}>
				<ToolbarBtn onClick={props.onZoomOut} title="Zoom Out">
					<TbZoomOut size={16} />
				</ToolbarBtn>
				<Box
					fontSize="xs"
					color="gray.400"
					minW="45px"
					textAlign="center"
					userSelect="none"
				>
					{Math.round(props.zoom * 100)}%
				</Box>
				<ToolbarBtn onClick={props.onZoomIn} title="Zoom In">
					<TbZoomIn size={16} />
				</ToolbarBtn>
				<ToolbarBtn onClick={props.onZoomReset} title="Reset Zoom (100%)">
					<TbZoomReset size={16} />
				</ToolbarBtn>
			</HStack>
		</HStack>
	);
}
