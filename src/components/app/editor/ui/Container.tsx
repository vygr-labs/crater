import { Box, Flex, HStack, VStack, type BoxProps } from "styled-system/jsx";
import { useNode } from "../Node";
import { useEditor } from "../Editor";
import {
	createEffect,
	createMemo,
	createSignal,
	Match,
	Show,
	Switch,
	type JSX,
} from "solid-js";
import {
	TbBorderRadius,
	TbPhoto,
	TbRadiusTopLeft,
	TbVideo,
	TbTrash,
} from "solid-icons/tb";
import { ControlIconBtn } from "./Buttons";
import {
	ColorUpdateInput,
	PopoverButton,
	SliderWithInput,
	SliderWithInputTwo,
} from "./Inputs";
import { token } from "styled-system/tokens";
import { defaultPalette } from "~/utils/constants";
import {
	AiOutlineRadiusBottomleft,
	AiOutlineRadiusBottomright,
	AiOutlineRadiusSetting,
	AiOutlineRadiusUpleft,
	AiOutlineRadiusUpright,
} from "solid-icons/ai";
import type { NodeSettings, RenderEditorItemProps } from "../editor-types";
import { HiSolidPhoto } from "solid-icons/hi";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Tabs } from "~/components/ui/tabs";
import { Slider } from "~/components/ui/slider";
import { NumberInput } from "~/components/ui/number-input";
import { IconButton } from "~/components/ui/icon-button";
import MediaContentLibrary from "~/components/custom/MediaContentLibrary";
import { useTabsContext } from "@ark-ui/solid";
import type { MediaItem } from "~/types";
import Image from "../../Image";
import Video from "../../Video";
import { css } from "styled-system/css";
import { CgDropOpacity } from "solid-icons/cg";

interface EditorContainerProps extends BoxProps {
	onMouseDown?: (e: MouseEvent) => void;
}

export default function EditorContainer(props: EditorContainerProps) {
	const { node, register, styles } = useNode();

	createEffect(() => {
		console.log("Here is the node: ", node);
	});

	return (
		<Box
			position="absolute"
			ref={register}
			style={styles()}
			transformOrigin="top left"
			overflow="hidden"
			onMouseDown={props.onMouseDown}
			// disabling child clicks so that the drag (target) is not any of the child elements.
			class="disable-child-clicks editor-node"
		>
			<Show when={node.data.overlayColor}>
				<Box bg={node.data.overlayColor} position="absolute" inset={0} />
			</Show>
			<Box pos="absolute" inset={0} style={{ opacity: node.data.bgOpacity }}>
				<Switch>
					<Match when={node.data.background?.type === "image"}>
						<Image
							class={css({ w: "full", h: "full" })}
							src={node.data.background.path}
							alt={node.data.background.title}
						/>
					</Match>
					<Match when={node.data.background?.type === "video"}>
						<Video
							id={node.compName + "-vid-" + node.id}
							src={node.data.background.path}
							about={node.data.background.title}
							controls={false}
							preload="auto"
							autoplay
							loop
						/>
					</Match>
				</Switch>
			</Box>
		</Box>
	);
}

export function RenderEditorContainer(props: RenderEditorItemProps) {
	createEffect(() => {
		console.log("Rendering node: ", props.node);
	});

	return (
		<Box
			position="absolute"
			style={props.node.style}
			transformOrigin="top left"
			overflow="hidden"
		>
			<Show when={props.node.data.overlayColor}>
				<Box bg={props.node.data.overlayColor} position="absolute" inset={0} />
			</Show>
			<Box
				pos="absolute"
				inset={0}
				style={{ opacity: props.node.data.bgOpacity }}
			>
				<Switch>
					<Match when={props.node.data.background?.type === "image"}>
						<Image
							class={css({ w: "full", h: "full" })}
							src={props.node.data.background.path}
							alt={props.node.data.background.title}
						/>
					</Match>
					<Match when={props.node.data.background?.type === "video"}>
						<Video
							id={props.node.compName + "-render-vid-" + props.node.id}
							src={props.node.data.background.path}
							about={props.node.data.background.title}
							controls={false}
							preload="auto"
							autoplay={props.extraData?.isProjectionDisplay}
							loop
						/>
					</Match>
				</Switch>
			</Box>
		</Box>
	);
}

export interface EditorContainerSettings extends NodeSettings {}
export function EditorContainerSettings(props: EditorContainerSettings) {
	const {
		setters: { setNodeStyle, setNodeData },
	} = useEditor();
	const styles = createMemo(() => props.node?.style ?? {});
	const [background, setBackground] = createSignal<MediaItem>();

	createEffect(() => {
		if (props.node) {
			const bg = background();
			if (bg) {
				setNodeData(props.node.id, { background: bg });
			}
		}
	});

	const setStyle = (newStyles: JSX.CSSProperties) =>
		setNodeStyle(props.node?.id, newStyles);
	const setData = (data: Record<string, any>) =>
		setNodeData(props.node?.id, data);

	// Helper for border radius
	const getBorderRadius = (corner: string) => {
		const value =
			styles()[`border-${corner}-radius` as keyof JSX.CSSProperties];
		return parseFloat(String(value)) || 0;
	};

	const setBorderRadius = (corner: string, value: number) => {
		setStyle({
			[`border-${corner}-radius`]: `${value}px`,
		} as JSX.CSSProperties);
	};

	// Section wrapper
	const SettingsSection = (sectionProps: { title: string; children: any }) => (
		<Box>
			<Text
				fontSize="2xs"
				color="gray.500"
				textTransform="uppercase"
				letterSpacing="wide"
				mb={2}
			>
				{sectionProps.title}
			</Text>
			{sectionProps.children}
		</Box>
	);

	// Row component
	const SettingsRow = (rowProps: { label?: string; children: any }) => (
		<Flex alignItems="center" justifyContent="space-between" gap={2} py={1}>
			{rowProps.label && (
				<Text fontSize="xs" color="gray.400" minW="70px">
					{rowProps.label}
				</Text>
			)}
			<Flex flex="1" gap={1} justifyContent="flex-end" alignItems="center">
				{rowProps.children}
			</Flex>
		</Flex>
	);

	return (
		<Show when={props.visible}>
			<VStack gap={4} alignItems="stretch" w="full">
				{/* Background Section */}
				<SettingsSection title="Background">
					<VStack gap={2} alignItems="stretch">
						<SettingsRow label="Color">
							<ColorUpdateInput
								styleKey="background-color"
								styles={styles()}
								setStyle={setStyle}
							/>
						</SettingsRow>

						<SettingsRow label="Opacity">
							<Slider.Root
								w="100px"
								min={0}
								max={1}
								step={0.05}
								value={[props.node.data.bgOpacity ?? 1]}
								onValueChange={(v) => setData({ bgOpacity: v.value[0] })}
							>
								<Slider.Control cursor="pointer">
									<Slider.Track>
										<Slider.Range />
									</Slider.Track>
									<Slider.Thumb index={0}>
										<Slider.HiddenInput />
									</Slider.Thumb>
								</Slider.Control>
							</Slider.Root>
							<Text
								fontSize="xs"
								color="gray.400"
								minW="30px"
								textAlign="right"
							>
								{((props.node.data.bgOpacity ?? 1) * 100).toFixed(0)}%
							</Text>
						</SettingsRow>
					</VStack>
				</SettingsSection>

				{/* Media Section */}
				<SettingsSection title="Media">
					<PopoverButton
						trigger={
							<Button
								alignItems="center"
								gap={2}
								p={2}
								bg="gray.800"
								rounded="md"
								cursor="pointer"
								border="1px dashed"
								borderColor="gray.700"
								_hover={{ borderColor: "gray.600", bg: "gray.750" }}
								w="full"
								justifyContent="center"
								fontSize="xs"
								color="gray.400"
							>
								<HiSolidPhoto size={16} color="var(--colors-gray-400)" />
								{props.node.data.background
									? "Change Media"
									: "Add Image/Video"}
							</Button>
						}
					>
						<Tabs.Root defaultValue="images" w="md">
							<Tabs.List>
								<Tabs.Trigger value="images">Images</Tabs.Trigger>
								<Tabs.Trigger value="videos">Videos</Tabs.Trigger>
							</Tabs.List>
							<Box minH={64}>
								<Tabs.Content value="images">
									<MediaContentLibrary
										type="image"
										selectedMedia={background()}
										setSelectedMedia={setBackground}
									/>
								</Tabs.Content>
								<Tabs.Content value="videos">
									<MediaContentLibrary
										type="video"
										selectedMedia={background()}
										setSelectedMedia={setBackground}
									/>
								</Tabs.Content>
							</Box>
						</Tabs.Root>
					</PopoverButton>

					<Show when={props.node.data.background}>
						<Flex
							mt={2}
							p={2}
							bg="gray.800"
							rounded="md"
							alignItems="center"
							gap={2}
						>
							<Box w={8} h={8} rounded="sm" overflow="hidden" bg="gray.700">
								<Show when={props.node.data.background?.type === "image"}>
									<Image
										src={props.node.data.background?.path}
										alt="Background"
										class={css({ w: "full", h: "full", objectFit: "cover" })}
									/>
								</Show>
								<Show when={props.node.data.background?.type === "video"}>
									<Flex alignItems="center" justifyContent="center" h="full">
										<TbVideo size={14} />
									</Flex>
								</Show>
							</Box>
							<Text fontSize="xs" color="gray.300" flex="1" truncate>
								{props.node.data.background?.title || "Media"}
							</Text>
							<IconButton
								size="2xs"
								variant="ghost"
								colorPalette="red"
								onClick={() => setData({ background: undefined })}
							>
								<TbTrash size={12} />
							</IconButton>
						</Flex>
					</Show>
				</SettingsSection>

				{/* Border Radius Section */}
				<SettingsSection title="Border Radius">
					<VStack gap={2} alignItems="stretch">
						<HStack gap={2}>
							<Flex flex="1" alignItems="center" gap={1}>
								<AiOutlineRadiusUpleft
									size={12}
									color="var(--colors-gray-500)"
								/>
								<NumberInput.Root
									size="xs"
									maxW="full"
									value={getBorderRadius("top-left").toString()}
									onValueChange={(v) =>
										setBorderRadius("top-left", v.valueAsNumber)
									}
									min={0}
									max={100}
								>
									<NumberInput.Input
										class={css({
											bg: "gray.800",
											borderColor: "gray.700",
											fontSize: "xs",
											h: "28px",
										})}
									/>
								</NumberInput.Root>
							</Flex>
							<Flex flex="1" alignItems="center" gap={1}>
								<AiOutlineRadiusUpright
									size={12}
									color="var(--colors-gray-500)"
								/>
								<NumberInput.Root
									size="xs"
									maxW="full"
									value={getBorderRadius("top-right").toString()}
									onValueChange={(v) =>
										setBorderRadius("top-right", v.valueAsNumber)
									}
									min={0}
									max={100}
								>
									<NumberInput.Input
										class={css({
											bg: "gray.800",
											borderColor: "gray.700",
											fontSize: "xs",
											h: "28px",
										})}
									/>
								</NumberInput.Root>
							</Flex>
						</HStack>
						<HStack gap={2}>
							<Flex flex="1" alignItems="center" gap={1}>
								<AiOutlineRadiusBottomleft
									size={12}
									color="var(--colors-gray-500)"
								/>
								<NumberInput.Root
									size="xs"
									maxW="full"
									value={getBorderRadius("bottom-left").toString()}
									onValueChange={(v) =>
										setBorderRadius("bottom-left", v.valueAsNumber)
									}
									min={0}
									max={100}
								>
									<NumberInput.Input
										class={css({
											bg: "gray.800",
											borderColor: "gray.700",
											fontSize: "xs",
											h: "28px",
										})}
									/>
								</NumberInput.Root>
							</Flex>
							<Flex flex="1" alignItems="center" gap={1}>
								<AiOutlineRadiusBottomright
									size={12}
									color="var(--colors-gray-500)"
								/>
								<NumberInput.Root
									size="xs"
									maxW="full"
									value={getBorderRadius("bottom-right").toString()}
									onValueChange={(v) =>
										setBorderRadius("bottom-right", v.valueAsNumber)
									}
									min={0}
									max={100}
								>
									<NumberInput.Input
										class={css({
											bg: "gray.800",
											borderColor: "gray.700",
											fontSize: "xs",
											h: "28px",
										})}
									/>
								</NumberInput.Root>
							</Flex>
						</HStack>
					</VStack>
				</SettingsSection>
			</VStack>
		</Show>
	);
}

EditorContainer.config = {
	defaultData: {
		bgOpacity: 1,
		// bgColor: defaultPalette
	},
	defaultStyles: {
		width: "15%",
		height: "20%",
		"background-color": token(`colors.${defaultPalette}.800`),
		"z-index": 10,
		"--scale-z": 1,
		"--translate-z": "0px",
	},
	settings: EditorContainerSettings,
};
