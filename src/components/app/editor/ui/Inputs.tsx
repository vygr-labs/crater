import {
	parseColor,
	type RadioGroupValueChangeDetails,
	type SliderRootProps,
	type SliderValueChangeDetails,
} from "@ark-ui/solid";
import {
	createEffect,
	createMemo,
	createSignal,
	Index,
	mergeProps,
	type JSX,
	type JSXElement,
	type ParentProps,
	type Setter,
} from "solid-js";
import type { SetStoreFunction } from "solid-js/store";
import { ColorPicker } from "~/components/ui/color-picker";
import { Popover } from "~/components/ui/popover";
import { Box, HStack, VStack } from "styled-system/jsx";
import { Slider } from "~/components/ui/slider";
import { TbChevronDown, TbChevronUp, TbRadiusTopLeft } from "solid-icons/tb";
import { AiOutlineRadiusUpleft } from "solid-icons/ai";
import { NumberInput } from "~/components/ui/number-input";
import { getColor, getNum } from "~/utils";
import { token } from "styled-system/tokens";
import { Dynamic } from "solid-js/web";
import { RadioGroup } from "~/components/ui/radio-group";

interface PropUpdateComponent {
	label?: JSXElement;
	children?: JSXElement;
	styleKey: keyof JSX.CSSProperties;
	setStyle: (styles: JSX.CSSProperties) => void;
	styles: JSX.CSSProperties;
}

interface DataUpdateComponent {
	label?: JSXElement;
	children?: JSXElement;
}

export interface ColorUpdateInputProps extends PropUpdateComponent {}

export function ColorUpdateInput(props: ColorUpdateInputProps) {
	return (
		<ColorPicker.Root
			size="xs"
			value={parseColor(getColor(props.styles, props.styleKey))}
			onValueChange={(v) =>
				props.setStyle({ [props.styleKey]: v.valueAsString })
			}
			css={{
				"--input-height": token.var("sizes.5"),
			}}
		>
			<ColorPicker.Control w={5} h={5}>
				<ColorPicker.Trigger border="none" padding="unset" cursor="pointer">
					<ColorPicker.ValueSwatch w={5} h={5} rounded="md" />
				</ColorPicker.Trigger>
			</ColorPicker.Control>
			<ColorPicker.Positioner>
				<ColorPicker.Content>
					<ColorPicker.FormatTrigger>
						Toggle ColorFormat
					</ColorPicker.FormatTrigger>
					<ColorPicker.FormatSelect />
					<ColorPicker.Area>
						<ColorPicker.AreaBackground />
						<ColorPicker.AreaThumb />
					</ColorPicker.Area>
					<ColorPicker.ChannelSlider channel="hue">
						<ColorPicker.ChannelSliderTrack />
						<ColorPicker.ChannelSliderThumb />
					</ColorPicker.ChannelSlider>
					<ColorPicker.ChannelSlider channel="alpha">
						<ColorPicker.TransparencyGrid />
						<ColorPicker.ChannelSliderTrack />
						<ColorPicker.ChannelSliderThumb />
					</ColorPicker.ChannelSlider>
					<ColorPicker.SwatchGroup>
						<ColorPicker.SwatchTrigger value="red">
							<ColorPicker.Swatch value="red">
								<ColorPicker.SwatchIndicator>✓</ColorPicker.SwatchIndicator>
							</ColorPicker.Swatch>
						</ColorPicker.SwatchTrigger>
						<ColorPicker.SwatchTrigger value="blue">
							<ColorPicker.Swatch value="blue">
								<ColorPicker.SwatchIndicator>✓</ColorPicker.SwatchIndicator>
							</ColorPicker.Swatch>
						</ColorPicker.SwatchTrigger>
						<ColorPicker.SwatchTrigger value="green">
							<ColorPicker.Swatch value="green">
								<ColorPicker.SwatchIndicator>✓</ColorPicker.SwatchIndicator>
							</ColorPicker.Swatch>
						</ColorPicker.SwatchTrigger>
					</ColorPicker.SwatchGroup>
					<ColorPicker.View format="rgba">
						<ColorPicker.ChannelInput channel="hex" />
						<ColorPicker.ChannelInput channel="alpha" />
					</ColorPicker.View>
					<ColorPicker.View format="hsla">
						<ColorPicker.ChannelInput channel="hue" />
						<ColorPicker.ChannelInput channel="saturation" />
						<ColorPicker.ChannelInput channel="lightness" />
					</ColorPicker.View>
					<ColorPicker.EyeDropperTrigger>
						Pick color
					</ColorPicker.EyeDropperTrigger>
				</ColorPicker.Content>
			</ColorPicker.Positioner>
			<ColorPicker.HiddenInput />
		</ColorPicker.Root>
	);
}

export interface SliderWithInputProps extends PropUpdateComponent {
	orientation?: "horizontal" | "vertical";
	rootProps?: SliderRootProps;
}
export const SliderWithInput = (props: SliderWithInputProps) => {
	const sliderValue = createMemo(() => getNum(props.styles, props.styleKey));
	const setValue = (value: number) =>
		props.setStyle({ [props.styleKey]: value + "px" });

	return (
		<Slider.Root
			orientation={props.orientation}
			w={props.orientation ? undefined : 56}
			value={[sliderValue()]}
			onValueChange={(v) => setValue(v.value[0])}
			{...props.rootProps}
		>
			<Dynamic
				component={props.orientation === "vertical" ? VStack : HStack}
				gap={5}
			>
				<Slider.Label>{props.label}</Slider.Label>
				<Slider.Control cursor="pointer">
					<Slider.Track>
						<Slider.Range />
					</Slider.Track>
					<Slider.Thumb index={0}>
						<Slider.HiddenInput />
					</Slider.Thumb>
				</Slider.Control>
				<NumberInput.Root
					maxW={16}
					value={sliderValue().toString()}
					onValueChange={(nv) => setValue(nv.valueAsNumber)}
				>
					<NumberInput.Input />
					<NumberInput.Control>
						<NumberInput.IncrementTrigger>
							<TbChevronUp />
						</NumberInput.IncrementTrigger>
						<NumberInput.DecrementTrigger>
							<TbChevronDown />
						</NumberInput.DecrementTrigger>
					</NumberInput.Control>
				</NumberInput.Root>
				{/* <Slider.ValueText /> */}
			</Dynamic>
		</Slider.Root>
	);
};

export interface SliderWithInputPropsTwo extends DataUpdateComponent {
	orientation?: "horizontal" | "vertical";
	rootProps?: SliderRootProps;
	sliderValue: number[];
	setValue: Setter<number>;
}
export const SliderWithInputTwo = (props: SliderWithInputPropsTwo) => {
	return (
		<Slider.Root
			orientation={props.orientation}
			w={props.orientation ? undefined : 56}
			value={props.sliderValue}
			onValueChange={(v) => props.setValue(v.value[0])}
			{...props.rootProps}
		>
			<Dynamic
				component={props.orientation === "vertical" ? VStack : HStack}
				gap={5}
			>
				<Slider.Label>{props.label}</Slider.Label>
				<Slider.Control cursor="pointer">
					<Slider.Track>
						<Slider.Range />
					</Slider.Track>
					<Slider.Thumb index={0}>
						<Slider.HiddenInput />
					</Slider.Thumb>
				</Slider.Control>
				<NumberInput.Root
					maxW={16}
					value={props.sliderValue[0].toString()}
					onValueChange={(nv) => props.setValue(nv.valueAsNumber)}
				>
					<NumberInput.Input />
					<NumberInput.Control>
						<NumberInput.IncrementTrigger>
							<TbChevronUp />
						</NumberInput.IncrementTrigger>
						<NumberInput.DecrementTrigger>
							<TbChevronDown />
						</NumberInput.DecrementTrigger>
					</NumberInput.Control>
				</NumberInput.Root>
				{/* <Slider.ValueText /> */}
			</Dynamic>
		</Slider.Root>
	);
};

export interface PopoverBtnProps extends ParentProps {
	trigger: JSXElement;
	enabled?: boolean;
}
export const PopoverButton = (props: PopoverBtnProps) => {
	return (
		<Popover.Root open={props.enabled}>
			<Popover.Trigger w={5} h={5}>
				{props.trigger}
			</Popover.Trigger>
			<Popover.Positioner>
				<Popover.Content w="fit" py={3} px={4}>
					{props.children}
				</Popover.Content>
			</Popover.Positioner>
		</Popover.Root>
	);
};

export interface RadioInputProps extends ParentProps {
	label?: JSXElement;
	options: { text: string; value: any }[];
	value: string;
	onValueChange: (d: RadioGroupValueChangeDetails) => void;
}
export const RadioInput = (props: RadioInputProps) => {
	return (
		<RadioGroup.Root value={props.value} onValueChange={props.onValueChange}>
			<Box mb={3}>
				<RadioGroup.Label textStyle="sm" fontWeight={600} pl={1}>
					{props.label}
				</RadioGroup.Label>
			</Box>
			<RadioGroup.Indicator />
			<VStack gap={3} alignItems="start">
				<Index each={props.options}>
					{(option) => (
						<RadioGroup.Item
							value={option().value}
							fontWeight={400}
							_checked={{ colorPalette: "purple" }}
							cursor="pointer"
						>
							<RadioGroup.ItemControl />
							<RadioGroup.ItemText>{option().text}</RadioGroup.ItemText>
							<RadioGroup.ItemHiddenInput />
						</RadioGroup.Item>
					)}
				</Index>
			</VStack>
		</RadioGroup.Root>
	);
};
