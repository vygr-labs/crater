import type { FocusType } from "~/layouts/FocusContext";
import type { BookInfo, ChapterCountObj, ScriptureVerse } from "../types";
import { token } from "styled-system/tokens";
import {
	defaultPalette,
	SONGS_TAB_FOCUS_NAME,
	syncFnPrefix,
	THEMES_TAB_FOCUS_NAME,
} from "./constants";
import type { JSX } from "solid-js/jsx-runtime";
import type { BooleanLiteral } from "typescript";
import { createToaster } from "@ark-ui/solid";
import type { JSXElement } from "solid-js";
import type { EditorRenderComponent } from "~/components/app/editor/editor-types";

export const createId = () => {
	return window.crypto.randomUUID();
};

export const transformEditorComp = (comp: EditorRenderComponent) => {
	Object.defineProperty(comp, "name", {
		value: comp.name.replace("[solid-refresh]", ""),
	});
	return comp;
};

export const calculateParentOffset = (
	childRect: DOMRect,
	parentRect: DOMRect,
	percent?: true,
) => {
	const relativeTop = childRect.y - parentRect.y; // - demarcationBorderWidth;
	const relativeLeft = childRect.x - parentRect.x; // - demarcationBorderWidth;

	if (percent) {
		const relativeTopPercent = (relativeTop / parentRect.height) * 100;
		const relativeLeftPercent = (relativeLeft / parentRect.width) * 100;

		return [relativeLeftPercent, relativeTopPercent];
	}

	return [relativeLeft, relativeTop];
};

export const getSizePercent = (
	[width, height]: number[],
	parentRect: DOMRect,
) => {
	const widthPercent = (width / parentRect.width) * 100;
	const heightPercent = (height / parentRect.height) * 100;

	return [widthPercent, heightPercent];
};

type PositionPercentGetter = (
	values: { y?: number; y_offset?: number; x?: number; x_offset?: number },
	parentRect: DOMRect,
) => number[];
export const getPositionPercent: PositionPercentGetter = (
	{ x = 0, y = 0, x_offset = 0, y_offset = 0 },
	parentRect,
) => {
	const leftVal = x + x_offset;
	const topVal = y + y_offset;
	const leftPercent = (leftVal / parentRect.width) * 100;
	const topPercent = (topVal / parentRect.height) * 100;

	return [leftPercent, topPercent];
};

export function getName(book?: BookInfo) {
	return book?.name?.toLowerCase() ?? "";
}

export const toaster = createToaster({
	overlap: true,
	placement: "bottom-end",
	gap: 16,
});

export function sendMessage(
	channel: BroadcastChannel,
	message: Record<string, any>,
) {
	channel.postMessage({ ...message, type: "message" });
}

export function isValidBookAndChapter(
	book: string,
	chapter: number,
	chapterData: ChapterCountObj,
) {
	const maxChapter = chapterData[book];
	if (!maxChapter) {
		return { valid: false, message: `The book "${book}" does not exist.` };
	}

	if (chapter < 1 || chapter > maxChapter) {
		return {
			valid: false,
			message: `The book "${book}" does not have chapter "${chapter}".`,
		};
	}

	return { valid: true };
}

export function getMeasurement(value: string = "") {
	const res = value.toString()?.match(/(-?[\d.]+)([a-z%]*)/);
	return res?.[2] ?? "px";
}

export function determineColor(color: string) {
	return color === "transparent" ? "rgba(0,0,0,0)" : color;
}

export function getReference(data: ScriptureVerse) {
	return `${data.book_name} ${data.chapter}:${data.verse} ${data.version}`;
}

export function formatReference(
	book: string,
	chapter: string | number,
	verse: string | number,
) {
	return `${book} ${chapter}:${verse}`;
}

const capitalize = (str?: string) =>
	str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
export function capitalizeFirstLetter(str?: string, all?: boolean) {
	if (all) {
		return str?.split(" ").map(capitalize).join(" ");
	}
	return capitalize(str);
}

export function getKeyByValue(object: Record<any, any>, value: string) {
	return Object.keys(object).find((key) => object[key] === value);
}

export const getToastType = (success: boolean) =>
	success ? "success" : "error";

export const getFocusVariant = (
	contextName: string,
	currentItemId: number,
	coreFocusId?: FocusType,
	fluidFocusId?: FocusType,
) => ({
	panel: contextName,
	isCurrentCore: currentItemId === coreFocusId,
	isCurrentFluid: currentItemId === fluidFocusId,
});

export type BooleanString = "false" | "true";
export type FocusStylesObj = Partial<
	Record<
		BooleanString,
		{ isCurrentPanel: Record<BooleanString, JSX.CSSProperties> }
	>
>;

const mappings: Record<
	string,
	{
		base?: JSX.CSSProperties;
		isFluid?: FocusStylesObj;
		isCore?: FocusStylesObj;
	}
> = {
	[SONGS_TAB_FOCUS_NAME]: {
		base: {
			border: "4px solid transparent",
		},
		isFluid: {
			true: {
				isCurrentPanel: {
					true: {
						"background-color": token.var(`colors.${defaultPalette}.900`),
						color: token.var(`colors.white`),
					},
					false: {
						"background-color": token.var(`colors.gray.800`),
						color: token.var("colors.gray.100"),
					},
				},
			},
			// false: { isCurrentPanel: { true: {}, false: {} } }
		},
		isCore: {
			true: {
				isCurrentPanel: {
					true: {
						"border-left-color": token.var(`colors.${defaultPalette}.700`),
						color: token.var(`colors.gray.100`),
					},
					false: {},
				},
			},
			// false: { isCurrentPanel: { true: {}, false: {} } }
		},
	},
	[THEMES_TAB_FOCUS_NAME]: {
		base: {},
		isFluid: {
			true: {
				isCurrentPanel: {
					true: {
						"background-color": token.var(`colors.${defaultPalette}.900`),
						color: token.var(`colors.white`),
					},
					false: {
						"background-color": token.var(`colors.gray.800`),
						color: token.var("colors.gray.100"),
					},
				},
			},
			// false: { isCurrentPanel: { true: {}, false: {} } }
		},
		isCore: {
			true: {
				isCurrentPanel: {
					true: {
						"border-left-color": token.var(`colors.${defaultPalette}.700`),
						color: token.var(`colors.gray.100`),
					},
					false: {},
				},
			},
			// false: { isCurrentPanel: { true: {}, false: {} } }
		},
	},
	LYRICS_TEXT_CONTAINER: {
		isFluid: {
			true: {
				isCurrentPanel: {
					true: {
						color: token.var("colors.gray.200"),
					},
					false: {
						color: token.var("colors.fg.muted"),
					},
				},
			},
			false: {
				isCurrentPanel: {
					true: { color: token.var("colors.fg.muted") },
					false: { color: token.var("colors.fg.muted") },
				},
			},
		},
	},
	LYRICS_INDEX_CONTAINER: {
		isFluid: {
			true: {
				isCurrentPanel: {
					true: {
						"background-color": token.var(`colors.${defaultPalette}.900`),
					},
					false: {
						"background-color": token.var("colors.gray.600"),
					},
				},
			},
		},
	},
	LYRICS_PARENT_CONTAINER: {
		isFluid: {
			true: {
				isCurrentPanel: {
					true: {
						"background-color": token.var(`colors.${defaultPalette}.800`),
					},
					false: {
						"background-color": token.var("colors.gray.800"),
					},
				},
			},
		},
	},
	LYRICS_LABEL_TEXT: {
		isFluid: {
			true: {
				isCurrentPanel: {
					true: {
						color: token.var(`colors.gray.100`),
					},
					false: {
						color: "initial",
					},
				},
			},
		},
	},
	SCHEDULE_ITEM_PARENT_CONTAINER: {
		isFluid: {
			true: {
				isCurrentPanel: {
					true: {
						"background-color": token.var(`colors.${defaultPalette}.800`),
						color: "white",
					},
					false: {
						"background-color": token.var("colors.gray.800"),
						color: token.var("colors.gray.100"),
					},
				},
			},
		},
	},
};

type FocusStylesGetter = (
	key: string,
	isFluid?: boolean,
	isCurrentPanel?: boolean,
	isCore?: boolean,
) => JSX.CSSProperties;
export const getBaseFocusStyles = (key: string) => {
	return mappings[key].base;
};

// to improve performance, make this into a hook that returns a store, so we can take advantage of fine-grained reactivity
// or better still, set the isFluid & isCore values using data-attributes that our pre-built css file applies styles based on these attributes. Check panda docs
export const getFocusableStyles: FocusStylesGetter = (
	key,
	isFluid,
	isCurrentPanel,
	isCore,
) => {
	// TODO: console.log(isFluid, isCurrentPanel, isCore)
	let fluidStyles = {};
	let coreStyles = {};

	if (typeof isFluid === "boolean") {
		fluidStyles =
			mappings[key]?.["isFluid"]?.[isFluid.toString() as BooleanString]?.[
				"isCurrentPanel"
			][isCurrentPanel ? "true" : "false"] ?? {};
	}
	if (typeof isCore === "boolean") {
		coreStyles =
			mappings[key]?.["isCore"]?.[isCore.toString() as BooleanString]?.[
				"isCurrentPanel"
			][isCurrentPanel ? "true" : "false"] ?? {};
	}
	return { ...fluidStyles, ...coreStyles };
};

export const getNum = (
	styles: JSX.CSSProperties,
	property: keyof JSX.CSSProperties,
	isFloat?: boolean,
) => {
	const parseFn = isFloat ? parseFloat : parseInt;
	return parseFn(styles[property]?.toString() ?? "0");
};

export const getColor = (
	styles: JSX.CSSProperties,
	property: keyof JSX.CSSProperties,
): string => {
	return styles[property]?.toString() ?? "#00000000";
};

export function fnReplacer(key: string, value: any) {
	if (typeof value === "function") {
		return syncFnPrefix + value;
	}
	return value;
}

export const parseStore = (data: any) => {
	const jsonValue: any[] = JSON.parse(data);
	const parsedValue = jsonValue.map((v) => {
		if (typeof v === "string" && v.startsWith(syncFnPrefix)) {
			// sensitive! secure this so nobody can run code remotely.
			return eval(v.replace(syncFnPrefix, ""));
		}
		return v;
	});
	return parsedValue;
};

export const preserveDefaults = <T>(
	updated: T,
	defaults: T,
	preserved: (keyof T)[],
): T => {
	for (let i = 0; i < preserved.length; i++) {
		let key = preserved[i];
		updated[key] = defaults[key];
	}
	return updated;
};
