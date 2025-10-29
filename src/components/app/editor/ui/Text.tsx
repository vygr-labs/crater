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
	createEffect,
	createMemo,
	For,
	Index,
	Match,
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
import { defaultPalette } from "~/utils/constants";
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

interface EditorContainer extends BoxProps {}

enum LINKAGES {
	SCRIPTURE_REFERENCE,
	SCRIPTURE_TEXT,
	SONG_LYRIC,
	CUSTOM,
}

export default function EditorText(props: EditorContainer) {
	const {
		getters: { getDemoLyric, getDemoScripture },
	} = useEditor();
	const {
		node,
		register,
		styles,
		bindDrag,
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
		console.log(
			"DYNAMIC SIZE: ",
			parent,
			newFontSize,
			oldDisplayStyle,
			newLineHeight,
			newLetterSpacing,
		);
		setStyle({ "font-size": newFontSize + "px", display: oldDisplayStyle });
		if (!isNaN(newLineHeight)) setStyle("line-height", newLineHeight);
		if (!isNaN(newLetterSpacing))
			setStyle("letter-spacing", newLetterSpacing.toString());
	};

	createEffect(() => {
		// tracking is not possible after an async function is awaited
		const trackChanges = node.style.width && node.style.height;
		const element = node.el;
		const isResize = node.data.autoResize;
		const textChanges = textArr();

		// use a promise to ensure that it is run after the element is rendered (needed for the first run);
		Promise.resolve().then(() => {
			if (element && isResize && textChanges) {
				console.log(
					"Element Set?: ",
					element,
					element.offsetHeight,
					element.style.width,
					element.style.height,
				);
				TextFill(element, {
					innerTag: "p",
					correctLineHeightOffset: false, // allows modification of top css value which interferes with drag & drop
					success: dynamicSizeUpdate,
				});
			}
		});
	});

	return (
		<Box
			position="absolute"
			ref={register}
			{...bindDrag()}
			style={styles}
			transformOrigin="top left"
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
		if (props.node.data.linkage === LINKAGES.CUSTOM) {
			return [props.node.data.text] as string[];
		} else {
			const { appStore } = useAppContext();
			const displayData = appStore.displayData;
			// const displayData = appStore.liveItem
			if (displayData) {
				if (
					props.node.data.linkage === LINKAGES.SONG_LYRIC &&
					displayData.type === "song" &&
					displayData.song
				) {
					return displayData.song.text;
				} else if (displayData.type === "scripture" && displayData.scripture) {
					if (props.node.data.linkage === LINKAGES.SCRIPTURE_TEXT) {
						return [displayData.scripture.text];
					} else if (props.node.data.linkage === LINKAGES.SCRIPTURE_REFERENCE) {
						return [getReference(displayData.scripture)];
					}
				}
			}
			return [];
		}
	});

	createEffect(() => {
		if (textNodeRenderRef && props.node.data.autoResize && textArr()) {
			console.log("Resizing Element: ");
			TextFill(textNodeRenderRef, {
				innerTag: "p",
				correctLineHeightOffset: false, // allows modification of top css value which interferes with drag & drop
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

const textLinkOptions = [
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

export interface EditorTextSettingsProps extends NodeSettings {}
export function EditorTextSettings(props: EditorTextSettingsProps) {
	const {
		editor,
		// getters: { getSelectedNode },
		setters: { setNodeStyle, setNodeData },
	} = useEditor();
	const styles = createMemo(() => {
		console.log("Recalculating Styles");
		return props.node?.style ?? {};
	});

	onMount(() => {
		console.log("Settings are being mounted for: ", props.node);
	});
	createEffect(() => {
		console.log("Here is the selected node: ", props.node);
	});
	const allFonts = createAsyncMemo(async () => {
		console.log("WINDOW AVAILABLE: ", window);
		return await window.electronAPI.getSystemFonts();
	}, []);
	const comboboxFonts = createMemo(() => {
		return allFonts().map((font) => ({
			title: font.name,
			value: font.familyName,
		}));
	});

	return (
		<Show when={props.visible}>
			{(selected) => {
				console.log("getting setStyle fn for: ", selected());
				const setStyle = (styles: JSX.CSSProperties) =>
					setNodeStyle(props.node.id, styles);
				const setData = (data: Record<string, any>) =>
					setNodeData(props.node.id, data);
				return (
					<HStack w="full" gap={4} rounded="md">
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

						<Flex>
							<GenericNumberInput
								value={getNum(styles(), "font-size").toString()}
								onValueChange={({ valueAsNumber }) =>
									setStyle({ "font-size": valueAsNumber + "px" })
								}
								inputProps={{
									class: css({ roundedRight: "unset" }),
								}}
							/>
							<IconButton
								variant={props.node.data.autoResize ? "solid" : "outline"}
								onClick={() =>
									setData({ autoResize: !props.node.data.autoResize })
								}
								roundedLeft="unset"
								borderLeft="unset"
							>
								<TbTextResize width={28} height={28} />
							</IconButton>
						</Flex>

						<ColorUpdateInput
							styleKey="color"
							styles={styles()}
							setStyle={setStyle}
						/>

						<PopoverButton
							trigger={
								<ControlIconBtn>
									<BsTextParagraph />
								</ControlIconBtn>
							}
						>
							<HStack>
								<For each={Object.entries(textAlignMap)}>
									{([value, icon]) => (
										<IconButton
											variant={
												styles()["text-align"] === value ? "solid" : "surface"
											}
											size="md"
											onclick={() =>
												setStyle({ "text-align": value as TextAlign })
											}
										>
											<Dynamic component={icon} />
										</IconButton>
									)}
								</For>
							</HStack>
						</PopoverButton>

						<PopoverButton
							trigger={
								<ControlIconBtn>
									<BiRegularVerticalCenter />
								</ControlIconBtn>
							}
						>
							<HStack>
								<For each={Object.entries(alignContentMap)}>
									{([value, icon]) => (
										<IconButton
											variant={
												styles()["align-content"] === value
													? "solid"
													: "surface"
											}
											size="md"
											onclick={() =>
												setStyle({ "align-content": value as TextAlign })
											}
										>
											<Dynamic component={icon} />
										</IconButton>
									)}
								</For>
							</HStack>
						</PopoverButton>

						<PopoverButton
							trigger={
								<ControlIconBtn>
									<FaSolidBold />
								</ControlIconBtn>
							}
						>
							<HStack>
								<For each={weightMap}>
									{(value) => (
										<IconButton
											variant={
												styles()["font-weight"] === value ? "solid" : "surface"
											}
											size="md"
											onclick={() => setStyle({ "font-weight": value })}
										>
											<Text style={{ "font-weight": value }}>T</Text>
										</IconButton>
									)}
								</For>
							</HStack>
						</PopoverButton>

						<PopoverButton
							trigger={
								<ControlIconBtn>
									<TbLetterCaseToggle />
								</ControlIconBtn>
							}
						>
							<HStack>
								<For each={Object.entries(textTransformMap)}>
									{([value, icon]) => (
										<IconButton
											variant={
												styles()["text-transform"] === value
													? "solid"
													: "surface"
											}
											size="md"
											onclick={() =>
												setStyle({
													"text-transform":
														value as JSX.CSSProperties["text-transform"],
												})
											}
										>
											<Dynamic component={icon} />
										</IconButton>
									)}
								</For>
							</HStack>
						</PopoverButton>

						<PopoverButton
							trigger={
								<ControlIconBtn>
									<ImTextHeight />
								</ControlIconBtn>
							}
						>
							<SliderWithInput
								styleKey="line-height"
								label={<ImTextHeight size={14} />}
								styles={styles()}
								setStyle={setStyle}
							/>
						</PopoverButton>

						<PopoverButton
							trigger={
								<ControlIconBtn>
									<ImTextWidth />
								</ControlIconBtn>
							}
						>
							<SliderWithInput
								styleKey="letter-spacing"
								label={<ImTextWidth size={16} />}
								styles={styles()}
								setStyle={setStyle}
								rootProps={{ max: 20 }}
							/>
						</PopoverButton>

						<PopoverButton
							trigger={
								<ControlIconBtn>
									<FiLink />
								</ControlIconBtn>
							}
						>
							<RadioInput
								options={textLinkOptions}
								label="Link Text"
								value={props.node.data.linkage}
								onValueChange={(d) => setData({ linkage: d.value })}
							/>

							<Switch>
								<Match when={props.node.data.linkage === LINKAGES.CUSTOM}>
									<Field.Root mt={4}>
										<Field.Label fontSize="xs" fontWeight={400}>
											Update Text
										</Field.Label>
										<Field.Textarea
											colorPalette="purple"
											bg="bg.muted"
											border="2px solid"
											borderColor="purple.700"
											py={1.5}
											px={3}
											value={props.node.data.text}
											oninput={(e) => setData({ text: e.target.value })}
											autoresize
										/>
										<Field.HelperText>Some additional Info</Field.HelperText>
										<Field.ErrorText>Error Info</Field.ErrorText>
									</Field.Root>
								</Match>
							</Switch>
						</PopoverButton>
					</HStack>
				);
			}}
		</Show>
	);
}

EditorText.config = {
	defaultData: {
		linkage: LINKAGES.CUSTOM,
		text: "Learning New Things",
		autoResize: false,
		// bgColor: defaultPalette
	},
	defaultStyles: {
		width: "20%",
		height: "15%",
		color: token(`colors.whiteAlpha.900`),
		"font-family": "Inter",
		"font-size": "16px",
		"line-height": 1.25,
		"text-align": "left" as TextAlign,
		"z-index": 20,
		"--scale-z": 1,
		"--translate-z": "0px",
	},
	settings: EditorTextSettings,
};
