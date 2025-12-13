import {
	Box,
	Flex,
	HStack,
	styled,
	VStack,
	type BoxProps,
} from "styled-system/jsx";
import { useNode } from "../Node";
import { useEditor } from "../Editor";
import {
	batch,
	createEffect,
	createMemo,
	For,
	Index,
	Match,
	on,
	onMount,
	Show,
	Switch,
	type Accessor,
	type JSX,
} from "solid-js";
import { css } from "styled-system/css";
import {
	TbContainer,
	TbFocusAuto,
	TbLetterCase,
	TbLetterCaseLower,
	TbLetterCaseToggle,
	TbLetterCaseUpper,
	TbPhoto,
	TbRadiusTopLeft,
	TbShadow,
	TbTextResize,
	TbVideo,
} from "solid-icons/tb";
import { ColorPicker } from "~/components/ui/color-picker";
import { ControlIconBtn } from "./Buttons";
import { createStore } from "solid-js/store";
import { parseColor } from "@ark-ui/solid";
import {
	ColorUpdateInput,
	PopoverButton,
	RadioInput,
	SliderWithInput,
} from "./Inputs";
import { token } from "styled-system/tokens";
import { defaultPalette, neutralPalette } from "~/utils/constants";
import { defineStyles } from "@pandacss/dev";
import { getNum, getReference } from "~/utils";
import { Text } from "~/components/ui/text";
import type { NodeSettings, RenderEditorItemProps } from "../editor-types";
import {
	BsTextCenter,
	BsTextLeft,
	BsTextParagraph,
	BsTextRight,
} from "solid-icons/bs";
import { BiRegularVerticalCenter } from "solid-icons/bi";
import { ImTextHeight, ImTextWidth } from "solid-icons/im";
import { VsLink } from "solid-icons/vs";
import { FiLink } from "solid-icons/fi";
import GenericCombobox from "~/components/custom/combobox";
import { IconButton } from "~/components/ui/icon-button";
import { RadioGroup } from "~/components/ui/radio-group";
import { Field } from "~/components/ui/field";
import { Slider } from "~/components/ui/slider";
import { Tooltip } from "~/components/ui/tooltip";
import { Dynamic } from "solid-js/web";
import type { ScriptureVerse, TextAlign } from "~/types";
import { useAppContext } from "~/layouts/AppContext";
import type { SongLyric } from "~/types/context";
import {
	AiOutlineVerticalAlignTop,
	AiOutlineVerticalAlignMiddle,
	AiOutlineVerticalAlignBottom,
	AiOutlineStop,
} from "solid-icons/ai";
import { createAsyncMemo, useDebounceFn, useThrottleFn } from "solidjs-use";
import TextFill from "~/utils/textfill";
import GenericNumberInput from "~/components/custom/number-input";
import { FaSolidBold } from "solid-icons/fa";
import { useDisplayStore } from "~/layouts/DisplayContext";

interface EditorTextProps extends BoxProps {
	onMouseDown?: (e: MouseEvent) => void;
}

enum LINKAGES {
	SCRIPTURE_REFERENCE,
	SCRIPTURE_TEXT,
	SONG_LYRIC,
	CUSTOM,
}

const LINKAGE_DEFAULTS = {
	[LINKAGES.CUSTOM]: ["Custom Text Here"],
	[LINKAGES.SCRIPTURE_REFERENCE]: ["Genesis 1:1"],
	[LINKAGES.SCRIPTURE_TEXT]: [
		"In the beginning, God created the Heavens & the Earth",
	],
	[LINKAGES.SONG_LYRIC]: ["We Worship the Most High God - El-Elohe Israel"],
};

export default function EditorText(props: EditorTextProps) {
	const {
		getters: { getDemoLyric, getDemoScripture },
	} = useEditor();
	const {
		node,
		register,
		styles,
		actions: { setStyle },
	} = useNode();

	const textArr: Accessor<string[]> = createMemo(() => {
		console.log(
			"getting all text",
			node.data.linkage,
			getDemoLyric(),
			getDemoScripture(),
		);
		if (node.data.linkage === LINKAGES.CUSTOM) {
			return [node.data.text] as string[];
		} else {
			if (node.data.linkage === LINKAGES.SONG_LYRIC) {
				return getDemoLyric().text;
			} else if (node.data.linkage === LINKAGES.SCRIPTURE_TEXT) {
				return [getDemoScripture().text];
			} else if (node.data.linkage === LINKAGES.SCRIPTURE_REFERENCE) {
				return [getReference(getDemoScripture())];
			}
			return [];
		}
	});

	const dynamicSizeUpdate = ({
		parent,
		newFontSize,
		newLineHeight,
		newLetterSpacing,
		oldDisplayStyle,
	}: {
		parent: HTMLElement;
		newFontSize: number;
		newLineHeight: number;
		newLetterSpacing: number;
		oldDisplayStyle: string;
	}) => {
		// Check if values actually changed to prevent unnecessary updates
		const currentFontSize = parseFloat(
			String(node.style["font-size"]).replace("px", ""),
		);
		const currentLineHeight = parseFloat(String(node.style["line-height"]));

		// Only update if values are different (with small tolerance for floating point)
		const fontSizeChanged = Math.abs(currentFontSize - newFontSize) > 0.1;
		const lineHeightChanged =
			!isNaN(newLineHeight) &&
			Math.abs(currentLineHeight - newLineHeight) > 0.01;

		if (fontSizeChanged || lineHeightChanged) {
			batch(() => {
				if (fontSizeChanged) {
					setStyle({
						"font-size": newFontSize + "px",
						display: oldDisplayStyle,
					});
				}
				if (lineHeightChanged) {
					setStyle({ "line-height": newLineHeight });
				}
				if (!isNaN(newLetterSpacing)) {
					setStyle({ "letter-spacing": newLetterSpacing.toString() });
				}
			});
		}
	};

	// Track only specific properties that should trigger resize
	createEffect(
		on(
			() => [
				node.style.width,
				node.style.height,
				node.style["font-weight"],
				node.data.autoResize,
				node.data.maxFontSize,
				textArr(),
			],
			() => {
				const element = node.el;
				const isResize = node.data.autoResize;
				const maxFontSize = node.data.maxFontSize ?? 0;

				// use a promise to ensure that it is run after the element is rendered
				Promise.resolve().then(() => {
					if (element && isResize) {
						TextFill(element, {
							innerTag: "p",
							correctLineHeightOffset: false,
							success: dynamicSizeUpdate,
							maxFontPixels: maxFontSize,
						});
					}
				});
			},
		),
	);

	return (
		<Box
			position="absolute"
			ref={register}
			style={styles()}
			transformOrigin="top left"
			onMouseDown={props.onMouseDown}
			class="editor-node"
		>
			<Text userSelect="none" w="full" h="full" alignContent="inherit">
				<For each={textArr()}>
					{(line, index) => (
						<>
							{line}
							<Show when={index() < textArr().length - 1}>
								<br />
							</Show>
						</>
					)}
				</For>
			</Text>
			{/* use:draggable */}
		</Box>
	);
}

export function RenderEditorText(props: RenderEditorItemProps) {
	createEffect(() => {
		console.log("Rendering node: ", props.node);
	});
	let textNodeRenderRef!: HTMLDivElement;

	const textArr: Accessor<string[]> = createMemo(() => {
		let displayText: string[] = [];
		if (props.node.data.linkage === LINKAGES.CUSTOM) {
			displayText = [props.node.data.text];
		} else {
			const { displayStore } = useDisplayStore();
			const displayContent = displayStore.displayContent;
			console.log(displayContent, displayContent?.song);
			// const displayData = appStore.liveItem
			if (displayContent) {
				if (
					props.node.data.linkage === LINKAGES.SONG_LYRIC &&
					displayContent.type === "song" &&
					displayContent.song
				) {
					displayText = displayContent.song.text;
				} else if (
					displayContent.type === "scripture" &&
					displayContent.scripture
				) {
					if (props.node.data.linkage === LINKAGES.SCRIPTURE_TEXT) {
						displayText = [displayContent.scripture.text];
					} else if (props.node.data.linkage === LINKAGES.SCRIPTURE_REFERENCE) {
						displayText = [getReference(displayContent.scripture)];
					}
				}
			}
		}

		if (!displayText.length && !props.extraData?.isProjectionDisplay) {
			displayText = LINKAGE_DEFAULTS[props.node.data.linkage as LINKAGES];
		}

		return displayText;
	});

	createEffect(() => {
		if (textNodeRenderRef && props.node.data.autoResize && textArr()) {
			console.log("Resizing Element: ");
			// resize leads to font: 0 when element is not rendered (i.e. you switch away from the themes tab to the songs tab. you could add a reactive variable linked to the current tab that triggers this effect and ensures a re-render)
			TextFill(textNodeRenderRef, {
				innerTag: "p",
				correctLineHeightOffset: false, // allows modification of top css value which interferes with drag & drop
				maxFontPixels: props.node.data.maxFontSize ?? 0,
			});
		}
	});

	return (
		<Box
			position="absolute"
			style={props.node.style}
			transformOrigin="top left"
			ref={textNodeRenderRef}
		>
			<Text userSelect="none" w="full" h="full" alignContent="inherit">
				<For each={textArr()}>
					{(line, index) => (
						<>
							{line}
							<Show when={index() < textArr().length - 1}>
								<br />
							</Show>
						</>
					)}
				</For>
			</Text>
		</Box>
	);
}

const textLinkOptions: { value: number; text: string }[] = [
	{ value: LINKAGES.SCRIPTURE_REFERENCE, text: "Scripture Reference" },
	{ value: LINKAGES.SCRIPTURE_TEXT, text: "Scripture Text" },
	{ value: LINKAGES.SONG_LYRIC, text: "Lyric" },
	{ value: LINKAGES.CUSTOM, text: "Custom" },
];

const textAlignMap = {
	left: BsTextLeft,
	center: BsTextCenter,
	right: BsTextRight,
};

const alignContentMap = {
	start: AiOutlineVerticalAlignTop,
	center: AiOutlineVerticalAlignMiddle,
	end: AiOutlineVerticalAlignBottom,
};

const textTransformMap = {
	uppercase: TbLetterCaseUpper,
	lowercase: TbLetterCaseLower,
	capitalize: TbLetterCase,
	initial: AiOutlineStop,
};

const weightMap = [100, 200, 300, 400, 500, 600, 700, 800, 900];

// Section wrapper for settings groups
const SettingsSection = (props: { title: string; children: any }) => (
	<Box>
		<Text
			fontSize="2xs"
			color="gray.500"
			textTransform="uppercase"
			letterSpacing="wide"
			mb={2}
		>
			{props.title}
		</Text>
		{props.children}
	</Box>
);

// Row component for inline settings
const SettingsRow = (props: {
	label?: string;
	children: any;
	alignItems?: string;
}) => (
	<Flex
		alignItems={props.alignItems || "center"}
		justifyContent="space-between"
		gap={2}
		py={1}
	>
		{props.label && (
			<Text fontSize="xs" color="gray.400" minW="70px">
				{props.label}
			</Text>
		)}
		<Flex flex="1" gap={1} justifyContent="flex-end" alignItems="center">
			{props.children}
		</Flex>
	</Flex>
);

export interface EditorTextSettingsProps extends NodeSettings {}
export function EditorTextSettings(props: EditorTextSettingsProps) {
	const {
		setters: { setNodeStyle, setNodeData },
	} = useEditor();
	const styles = createMemo(() => props.node?.style ?? {});

	const allFonts = createAsyncMemo(async () => {
		return await window.electronAPI.getSystemFonts();
	}, []);

	const comboboxFonts = createMemo(() => {
		return allFonts().map((font) => ({
			title: font.name,
			value: font.familyName,
		}));
	});

	const setStyle = (newStyles: JSX.CSSProperties) =>
		setNodeStyle(props.node?.id, newStyles);
	const setData = (data: Record<string, any>) =>
		setNodeData(props.node?.id, data);

	return (
		<Show when={props.visible}>
			<VStack gap={4} alignItems="stretch" w="full">
				{/* Typography Section */}
				<SettingsSection title="Typography">
					<VStack gap={2} alignItems="stretch">
						{/* Font Family */}
						<GenericCombobox
							maxWidth={60}
							groupLabel="Available Fonts"
							input={{
								placeholder: "Font Family",
								value: styles()["font-family"] || "",
							}}
							options={comboboxFonts()}
							handleValueChange={({ value }) =>
								setStyle({ "font-family": value[0] })
							}
						/>

						{/* Font Size with Auto-resize */}
						<SettingsRow label="Size">
							<GenericNumberInput
								value={getNum(styles(), "font-size").toString()}
								onValueChange={({ valueAsNumber }) =>
									setStyle({ "font-size": valueAsNumber + "px" })
								}
								inputProps={{
									class: css({
										maxW: "60px",
										rounded: "md",
										fontSize: "xs",
									}),
								}}
							/>
							<Tooltip.Root openDelay={200} closeDelay={0}>
								<Tooltip.Trigger
									asChild={(triggerProps) => (
										<IconButton
											{...triggerProps()}
											size="xs"
											variant={props.node.data.autoResize ? "solid" : "ghost"}
											colorPalette={
												props.node.data.autoResize ? defaultPalette : "gray"
											}
											onClick={() =>
												setData({ autoResize: !props.node.data.autoResize })
											}
										>
											<TbTextResize size={16} />
										</IconButton>
									)}
								/>
								<Tooltip.Positioner>
									<Tooltip.Content>
										<Tooltip.Arrow>
											<Tooltip.ArrowTip />
										</Tooltip.Arrow>
										Auto-resize text
									</Tooltip.Content>
								</Tooltip.Positioner>
							</Tooltip.Root>
							<Show when={props.node.data.autoResize}>
								<GenericNumberInput
									value={props.node.data.maxFontSize?.toString() ?? "200"}
									onValueChange={({ valueAsNumber }) =>
										setData({ maxFontSize: valueAsNumber })
									}
									inputProps={{
										class: css({ maxW: "55px", fontSize: "xs" }),
										placeholder: "Max",
									}}
								/>
							</Show>
						</SettingsRow>

						{/* Font Weight */}
						<SettingsRow label="Weight">
							<HStack gap={0.5}>
								<For each={[300, 400, 500, 600, 700, 800, 900]}>
									{(weight) => (
										<IconButton
											size="2xs"
											variant={
												styles()["font-weight"] === weight ? "solid" : "ghost"
											}
											colorPalette={
												styles()["font-weight"] === weight
													? defaultPalette
													: "gray"
											}
											onClick={() => setStyle({ "font-weight": weight })}
											title={`Weight ${weight}`}
										>
											<Text fontSize="xs" style={{ "font-weight": weight }}>
												A
											</Text>
										</IconButton>
									)}
								</For>
							</HStack>
						</SettingsRow>
					</VStack>
				</SettingsSection>

				{/* Color Section */}
				<SettingsSection title="Color">
					<SettingsRow label="Text">
						<ColorUpdateInput
							styleKey="color"
							styles={styles()}
							setStyle={setStyle}
						/>
					</SettingsRow>
				</SettingsSection>

				{/* Alignment Section */}
				<SettingsSection title="Alignment">
					<VStack gap={2} alignItems="stretch">
						<SettingsRow label="Horizontal">
							<HStack gap={0.5}>
								<For each={Object.entries(textAlignMap)}>
									{([value, icon]) => (
										<IconButton
											size="xs"
											variant={
												styles()["text-align"] === value ? "solid" : "ghost"
											}
											colorPalette={
												styles()["text-align"] === value
													? defaultPalette
													: "gray"
											}
											onClick={() =>
												setStyle({ "text-align": value as TextAlign })
											}
										>
											<Dynamic component={icon} size={14} />
										</IconButton>
									)}
								</For>
							</HStack>
						</SettingsRow>
						<SettingsRow label="Vertical">
							<HStack gap={0.5}>
								<For each={Object.entries(alignContentMap)}>
									{([value, icon]) => (
										<IconButton
											size="xs"
											variant={
												styles()["align-content"] === value ? "solid" : "ghost"
											}
											colorPalette={
												styles()["align-content"] === value
													? defaultPalette
													: "gray"
											}
											onClick={() =>
												setStyle({ "align-content": value as TextAlign })
											}
										>
											<Dynamic component={icon} size={14} />
										</IconButton>
									)}
								</For>
							</HStack>
						</SettingsRow>
					</VStack>
				</SettingsSection>

				{/* Spacing Section */}
				<SettingsSection title="Spacing">
					<VStack gap={2} alignItems="stretch">
						<SettingsRow label="Line Height">
							<Slider.Root
								w="100px"
								min={0.5}
								max={3}
								step={0.05}
								value={[parseFloat(String(styles()["line-height"])) || 1.25]}
								onValueChange={(v) => setStyle({ "line-height": v.value[0] })}
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
								{(parseFloat(String(styles()["line-height"])) || 1.25).toFixed(
									2,
								)}
							</Text>
						</SettingsRow>
						<SettingsRow label="Letter">
							<Slider.Root
								w="100px"
								min={-2}
								max={10}
								step={0.1}
								value={[parseFloat(String(styles()["letter-spacing"])) || 0]}
								onValueChange={(v) =>
									setStyle({ "letter-spacing": v.value[0] + "px" })
								}
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
								{(parseFloat(String(styles()["letter-spacing"])) || 0).toFixed(
									1,
								)}
							</Text>
						</SettingsRow>
					</VStack>
				</SettingsSection>

				{/* Transform Section */}
				<SettingsSection title="Transform">
					<SettingsRow label="Case">
						<HStack gap={0.5}>
							<For each={Object.entries(textTransformMap)}>
								{([value, icon]) => (
									<IconButton
										size="xs"
										variant={
											styles()["text-transform"] === value ? "solid" : "ghost"
										}
										colorPalette={
											styles()["text-transform"] === value
												? defaultPalette
												: "gray"
										}
										onClick={() =>
											setStyle({
												"text-transform":
													value as JSX.CSSProperties["text-transform"],
											})
										}
									>
										<Dynamic component={icon} size={14} />
									</IconButton>
								)}
							</For>
						</HStack>
					</SettingsRow>
				</SettingsSection>

				{/* Content Link Section */}
				<SettingsSection title="Content">
					<VStack gap={2} alignItems="stretch">
						<RadioGroup.Root
							size="sm"
							value={String(props.node.data.linkage)}
							onValueChange={(d) =>
								setData({ linkage: parseInt(d.value ?? "3") })
							}
						>
							<VStack gap={1.5} alignItems="stretch">
								<Index each={textLinkOptions}>
									{(option) => (
										<RadioGroup.Item
											value={String(option().value) as any}
											fontWeight={400}
											fontSize="xs"
											_checked={{ colorPalette: defaultPalette }}
											cursor="pointer"
											p={1.5}
											rounded="md"
											bg={
												props.node.data.linkage === option().value
													? `${defaultPalette}.900/30`
													: "transparent"
											}
											_hover={{ bg: `${neutralPalette}.800` }}
										>
											<RadioGroup.ItemControl />
											<RadioGroup.ItemText>{option().text}</RadioGroup.ItemText>
											<RadioGroup.ItemHiddenInput />
										</RadioGroup.Item>
									)}
								</Index>
							</VStack>
						</RadioGroup.Root>

						<Show when={props.node.data.linkage === LINKAGES.CUSTOM}>
							<Field.Root>
								<Field.Textarea
									w="full"
									colorPalette={defaultPalette}
									bg={`${neutralPalette}.800`}
									border="1px solid"
									borderColor="gray.700"
									py={2}
									px={3}
									fontSize="xs"
									rounded="md"
									value={props.node.data.text}
									onInput={(e) => setData({ text: e.target.value })}
									placeholder="Enter your text..."
									rows={3}
									_focus={{ borderColor: `${defaultPalette}.500` }}
								/>
							</Field.Root>
						</Show>
					</VStack>
				</SettingsSection>
			</VStack>
		</Show>
	);
}

EditorText.config = {
	defaultData: {
		linkage: LINKAGES.CUSTOM,
		text: "Learning New Things",
		autoResize: false,
		maxFontSize: 220,
		// bgColor: defaultPalette
	},
	defaultStyles: {
		width: "20%",
		height: "15%",
		color: token(`colors.whiteAlpha.900`),
		"font-family": "Funnel Sans",
		"font-size": "16px",
		"font-weight": 700,
		"line-height": 1.25,
		"text-align": "center" as TextAlign,
		"align-content": "center" as TextAlign,
		"z-index": 20,
		"--scale-z": 1,
		"--translate-z": "0px",
	},
	settings: EditorTextSettings,
};
// defaults: boldest, horizontally centered, vertically centered
// if theme type is lyric, default linkage is lyric
// if theme type is scripture, default linkage is scripture text.
// if theme type is scripture, 2 text nodes should be auto-created
