import { TbChevronDown, TbChevronUp } from "solid-icons/tb";
import { NumberInput } from "../ui/number-input";
import type {
	NumberInputInputProps,
	NumberInputValueChangeDetails,
} from "@ark-ui/solid";

interface Props {
	value: string;
	inputProps?: NumberInputInputProps;
	onValueChange: (d: NumberInputValueChangeDetails) => void;
}

export default function GenericNumberInput(props: Props) {
	return (
		<NumberInput.Root
			maxW={16}
			value={props.value}
			onValueChange={props.onValueChange}
		>
			<NumberInput.Input {...props.inputProps} />
			<NumberInput.Control>
				<NumberInput.IncrementTrigger>
					<TbChevronUp />
				</NumberInput.IncrementTrigger>
				<NumberInput.DecrementTrigger>
					<TbChevronDown />
				</NumberInput.DecrementTrigger>
			</NumberInput.Control>
		</NumberInput.Root>
	);
}
