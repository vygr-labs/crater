import { useFilter } from "@ark-ui/solid/locale";
import { For, Show, type JSXElement } from "solid-js";
import { Portal } from "solid-js/web";
import { Combobox } from "../ui/combobox";
import { useListCollection, type ComboboxRootProps } from "@ark-ui/solid";
import { TbArrowsUpDown } from "solid-icons/tb";

const initialItems = ["React", "Solid", "Vue", "Svelte"];

interface Props {
	label?: JSXElement;
  rootProps?: ComboboxRootProps<any>;
  maxWidth: string | number;
}

export const GenericCombobox = (props: Props) => {
	const filterFn = useFilter({ sensitivity: "base" });
	const { collection, filter } = useListCollection({
		initialItems,
		filter: filterFn().contains,
	});

	const handleInputChange = (details: Combobox.InputValueChangeDetails) => {
		filter(details.inputValue);
	};

	return (
		<Combobox.Root w="fit" maxW={props.maxWidth} {...props.rootProps} collection={collection()} onInputValueChange={handleInputChange}>
			<Show when={props.label}>
				<Combobox.Label>{props.label}</Combobox.Label>
			</Show>
			<Combobox.Control>
				<Combobox.Input placeholder="Font" />
        <Combobox.IndicatorGroup>
				<Combobox.Trigger color="gray.300">
					<TbArrowsUpDown />
				</Combobox.Trigger>
				<Combobox.ClearTrigger>Clear</Combobox.ClearTrigger>
        </Combobox.IndicatorGroup>
			</Combobox.Control>
			<Portal>
				<Combobox.Positioner>
					<Combobox.Content>
						<Combobox.ItemGroup>
							<Combobox.ItemGroupLabel>Available Fonts</Combobox.ItemGroupLabel>
							<For each={collection().items}>
								{(item) => (
									<Combobox.Item item={item}>
										<Combobox.ItemText>{item}</Combobox.ItemText>
										<Combobox.ItemIndicator>✓</Combobox.ItemIndicator>
									</Combobox.Item>
								)}
							</For>
						</Combobox.ItemGroup>
					</Combobox.Content>
				</Combobox.Positioner>
			</Portal>
		</Combobox.Root>
	);
};

export default GenericCombobox;
