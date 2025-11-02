import { Box, HStack, VStack, type BoxProps } from "styled-system/jsx";
import { useNode } from "../Node";
import { useEditor } from "../Editor";
import {
	createEffect,
	createMemo,
	createSignal,
	Match,
	onMount,
	Show,
	Switch,
	type JSX,
} from "solid-js";
import { TbBorderRadius, TbPhoto, TbRadiusTopLeft } from "solid-icons/tb";
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
import MediaContentLibrary from "~/components/custom/MediaContentLibrary";
import { useTabsContext } from "@ark-ui/solid";
import type { MediaItem } from "~/types";
import Image from "../../Image";
import Video from "../../Video";
import { css } from "styled-system/css";
import { CgDropOpacity } from "solid-icons/cg";

interface EditorContainer extends BoxProps {}

export default function EditorContainer(props: EditorContainer) {
	const { node, register, styles, bindDrag } = useNode();

	createEffect(() => {
		console.log("Here is the node: ", node);
	});

	return (
		<Box
			position="absolute"
			ref={register}
			{...bindDrag()}
			style={styles}
			transformOrigin="top left"
			overflow="hidden"
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
							autoplay
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
		editor,
		// getters: { getSelectedNode },
		setters: { setNodeStyle, setNodeData },
	} = useEditor();
	const styles = createMemo(() => {
		console.log("Recalculating Styles");
		return props.node?.style ?? {};
	});
	const [background, setBackground] = createSignal<MediaItem>();

	onMount(() => {
		console.log("Settings are being Mounted: ", props.node);
	});

	createEffect(() => {
		console.log("Here is the selected node: ", props.node);
	});

	createEffect(() => {
		if (props.node) {
			const bg = background();
			setNodeData(props.node.id, { background: bg });
			console.log("Background: ", bg);
			console.log(props.node.data);
		}
	});
	const setStyle = (styles: JSX.CSSProperties) =>
		setNodeStyle(props.node?.id, styles);
	const setData = (data: Record<string, any>) =>
		setNodeData(props.node?.id, data);

	const handleChangeBackground = () => {};

	return (
		<Show when={props.visible}>
			<HStack w="full" gap={4} rounded="md">
				<ColorUpdateInput
					styleKey="background-color"
					styles={styles()}
					setStyle={setStyle}
				/>

				<PopoverButton
					trigger={
						<ControlIconBtn>
							<TbBorderRadius />
						</ControlIconBtn>
					}
				>
					<VStack>
						<SliderWithInput
							styleKey="border-top-left-radius"
							label={<AiOutlineRadiusUpleft size={24} />}
							styles={styles()}
							setStyle={setStyle}
						/>
						<SliderWithInput
							styleKey="border-top-right-radius"
							label={<AiOutlineRadiusUpright size={24} />}
							styles={styles()}
							setStyle={setStyle}
						/>
						<SliderWithInput
							styleKey="border-bottom-left-radius"
							label={<AiOutlineRadiusBottomleft size={24} />}
							styles={styles()}
							setStyle={setStyle}
						/>
						<SliderWithInput
							styleKey="border-bottom-right-radius"
							label={<AiOutlineRadiusBottomright size={24} />}
							styles={styles()}
							setStyle={setStyle}
						/>
					</VStack>
				</PopoverButton>

				<PopoverButton
					trigger={
						<ControlIconBtn onclick={handleChangeBackground}>
							<HiSolidPhoto />
						</ControlIconBtn>
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
					<VStack>
						<PopoverButton
							trigger={
								<ControlIconBtn>
									<CgDropOpacity />
								</ControlIconBtn>
							}
						>
							<SliderWithInputTwo
								label={<CgDropOpacity size={16} />}
								sliderValue={[props.node.data.bgOpacity]}
								setValue={(v) => setData({ bgOpacity: v })}
								rootProps={{ step: 0.1, min: 0, max: 1 }}
							/>
						</PopoverButton>
					</VStack>
				</PopoverButton>
			</HStack>
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
