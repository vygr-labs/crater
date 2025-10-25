import { useFilter } from "@ark-ui/solid/locale";
import { createEffect, createMemo, For, Show, type JSXElement } from "solid-js";
import { Portal } from "solid-js/web";
import { Combobox } from "../ui/combobox";
import { useListCollection, type ComboboxRootProps } from "@ark-ui/solid";
import { TbArrowsUpDown } from "solid-icons/tb";
import { Box } from "styled-system/jsx";
import { createVirtualizer } from "@tanstack/solid-virtual";
import type { ValueChangeDetails } from "../ui/styled/combobox";
import { FaSolidFont, FaSolidX } from "solid-icons/fa";

const initialItems = ["React", "Solid", "Vue", "Svelte"];

interface IOptions {
	title: string;
	value: any;
}

interface Props {
	label?: JSXElement;
	input: {
		placeholder: string;
		value: string;
	};
	rootProps?: ComboboxRootProps<any>;
	maxWidth: string | number;
	groupLabel: string;
	options: IOptions[];
	handleValueChange: (d: ValueChangeDetails) => void;
}

export const GenericCombobox = (props: Props) => {
	const filterFn = useFilter({ sensitivity: "base" });
	const { collection, filter, set } = useListCollection<IOptions>({
		initialItems: [],
		filter: filterFn().contains,
	});
	let virtualizerParentRef!: HTMLDivElement;

	const handleInputChange = (details: Combobox.InputValueChangeDetails) => {
		filter(details.inputValue);
	};

	createEffect(() => {
		set(props.options);
	});

	const rowVirtualizer = createMemo(() =>
		createVirtualizer({
			count: collection().items.length,
			getScrollElement: () => virtualizerParentRef,
			estimateSize: () => 32,
			overscan: 5,
		}),
	);

	return (
		<Combobox.Root
			w="fit"
			variant="outline"
			openOnClick
			maxW={props.maxWidth}
			{...props.rootProps}
			collection={collection()}
			inputValue={props.input.value}
			onInputValueChange={handleInputChange}
			onValueChange={props.handleValueChange}
		>
			<Show when={props.label}>
				<Combobox.Label>{props.label}</Combobox.Label>
			</Show>
			<Combobox.Control>
				<Combobox.Input
					placeholder={props.input.placeholder}
					css={{
						"--focus-ring-color": "colors.bg.emphasized",
						background: "bg.muted",
					}}
				/>
				<Combobox.IndicatorGroup>
					<Combobox.Trigger color="gray.500">
						<FaSolidFont />
					</Combobox.Trigger>
					<Combobox.ClearTrigger cursor="pointer" color="gray.500">
						<FaSolidX />
					</Combobox.ClearTrigger>
				</Combobox.IndicatorGroup>
			</Combobox.Control>
			{/* <Portal> */}
			<Combobox.Positioner>
				<Combobox.Content>
					<Combobox.ItemGroup>
						<Combobox.ItemGroupLabel fontSize="xs" opacity={0.6}>
							{props.groupLabel}
						</Combobox.ItemGroupLabel>
						<Box w="full" h="full" overflow="auto" ref={virtualizerParentRef}>
							<Box
								style={{
									height: `${rowVirtualizer().getTotalSize()}px`,
									width: "100%",
									position: "relative",
								}}
							>
								<For each={rowVirtualizer().getVirtualItems()}>
									{/* <For each={collection().items}> */}
									{(virtualItem) => {
										const item = collection().items[virtualItem.index];
										return (
											<Combobox.Item item={item.value}>
												<Combobox.ItemText
													style={{
														"font-family": item.value,
													}}
												>
													{item.title}
												</Combobox.ItemText>
												<Combobox.ItemIndicator>✓</Combobox.ItemIndicator>
											</Combobox.Item>
										);
									}}
								</For>
							</Box>
						</Box>
					</Combobox.ItemGroup>
				</Combobox.Content>
			</Combobox.Positioner>
			{/* </Portal> */}
		</Combobox.Root>
	);
};

export default GenericCombobox;
