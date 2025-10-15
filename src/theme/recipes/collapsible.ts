import { collapsibleAnatomy } from "../anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

export const collapsibleSlotRecipe = defineSlotRecipe({
	slots: collapsibleAnatomy.keys(),
	className: "chakra-collapsible",
	base: {
		content: {
			overflow: "hidden",
			_open: {
				animationName: "expand-height, fade-in",
				animationDuration: "moderate",
			},
			_closed: {
				animationName: "collapse-height, fade-out",
				animationDuration: "moderate",
			},
		},
	},
});
