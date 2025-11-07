import { defineTokens } from "@pandacss/dev";

const fallback = `-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`;

export const fonts = defineTokens.fonts({
	heading: {
		value: `Stack Sans Text, ${fallback}`,
	},
	body: {
		value: `Funnel Sans, ${fallback}`,
	},
	mono: {
		value: `SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace`,
	},
});
