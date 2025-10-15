import { type Assign, Switch } from "@ark-ui/solid";
import type { ComponentProps } from "solid-js";
import {
	type ChakraSwitchVariantProps,
	chakraSwitch,
} from "styled-system/recipes";
import type { HTMLStyledProps } from "styled-system/types";
import { createStyleContext } from "./utils/create-style-context";

const { withRootProvider, withProvider, withContext } =
	createStyleContext(chakraSwitch);

export type RootProviderProps = ComponentProps<typeof RootProvider>;
export const RootProvider = withRootProvider<
	Assign<
		Assign<HTMLStyledProps<"label">, Switch.RootProviderBaseProps>,
		ChakraSwitchVariantProps
	>
>(Switch.RootProvider);

export type RootProps = ComponentProps<typeof Root>;
export const Root = withProvider<
	Assign<
		Assign<HTMLStyledProps<"label">, Switch.RootBaseProps>,
		ChakraSwitchVariantProps
	>
>(Switch.Root, "root");

export const Control = withContext<
	Assign<HTMLStyledProps<"span">, Switch.ControlBaseProps>
>(Switch.Control, "control");

export const Label = withContext<
	Assign<HTMLStyledProps<"span">, Switch.LabelBaseProps>
>(Switch.Label, "label");

export const Thumb = withContext<
	Assign<HTMLStyledProps<"span">, Switch.ThumbBaseProps>
>(Switch.Thumb, "thumb");

export {
	SwitchContext as Context,
	SwitchHiddenInput as HiddenInput,
} from "@ark-ui/solid";
