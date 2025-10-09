import type { FocusType } from '~/layouts/FocusContext'
import type { BookInfo, ChapterCountObj, HighlightedVerse } from '../types'
import { token } from 'styled-system/tokens'
import { defaultPalette, SONGS_TAB_FOCUS_NAME } from './constants'
import type { JSX } from 'solid-js/jsx-runtime'
import type { BooleanLiteral } from 'typescript'

export function getName(book?: BookInfo) {
	return book?.name?.toLowerCase() ?? ''
}

export function sendMessage(
	channel: BroadcastChannel,
	message: Record<string, any>
) {
	channel.postMessage({ ...message, type: 'message' })
}

export function isValidBookAndChapter(
	book: string,
	chapter: number,
	chapterData: ChapterCountObj
) {
	const maxChapter = chapterData[book]
	if (!maxChapter) {
		return { valid: false, message: `The book "${book}" does not exist.` }
	}

	if (chapter < 1 || chapter > maxChapter) {
		return {
			valid: false,
			message: `The book "${book}" does not have chapter "${chapter}".`,
		}
	}

	return { valid: true }
}

export function getMeasurement(value: string = '') {
	const res = value.toString()?.match(/(-?[\d.]+)([a-z%]*)/)
	return res?.[2] ?? 'px'
}

export function determineColor(color: string) {
	return color === 'transparent' ? 'rgba(0,0,0,0)' : color
}

export function getReference(data: HighlightedVerse) {
	return `${data.book} ${data.chapter}:${data.verse} ${data.version}`
}

export function capitalizeFirstLetter(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1)
}

export function getKeyByValue(object: Record<any, any>, value: string) {
	return Object.keys(object).find(key => object[key] === value)
}

export const getToastType = (success: boolean) =>
	success ? 'success' : 'error'

export const getFocusVariant = (contextName: string, currentItemId: number, coreFocusId?: FocusType, fluidFocusId?: FocusType) => ({
	panel: contextName,
	isCurrentCore: currentItemId === coreFocusId,
	isCurrentFluid: currentItemId === fluidFocusId
})

export type BooleanString = "false" | "true";
export type FocusStylesObj = Partial<Record<BooleanString, {isCurrentPanel: Record<BooleanString, JSX.CSSProperties>}>>

const mappings: Record<string, {
	base?: JSX.CSSProperties;
	isFluid?: FocusStylesObj;
	isCore?: FocusStylesObj;
}> = {
	[SONGS_TAB_FOCUS_NAME]: {
		base: {
			border: "4px solid transparent"
		},
		isFluid: {
			true: {
				isCurrentPanel: {
					true: {
						"background-color": token.var(`colors.${defaultPalette}.900`),
						color: token.var(`colors.white`)
					},
					false: {
						"background-color": token.var(`colors.gray.800`),
						color: token.var("colors.gray.100")
					}
				}
			},
			// false: { isCurrentPanel: { true: {}, false: {} } }
		},
		isCore: {
			true: {
				isCurrentPanel: {
					true: {
						"border-left-color": token.var(`colors.${defaultPalette}.700`),
						color: token.var(`colors.gray.100`)
					},
					false: {}
				}
			},
			// false: { isCurrentPanel: { true: {}, false: {} } }
		}
	},
	LYRICS_TEXT_CONTAINER: {
		isFluid: {
			true: {
				isCurrentPanel: {
					true: {
						color: token.var("colors.gray.200")
					},
					false: {
						color: token.var("colors.fg.muted")
					}
				}
			},
			false: {
				isCurrentPanel: {
					true: {color: token.var("colors.fg.muted")},
					false: {color: token.var("colors.fg.muted")},
				}
			}
		}
	},
	LYRICS_INDEX_CONTAINER: {
		isFluid: {
			true: {
				isCurrentPanel: {
					true: {
						"background-color": token.var(`colors.${defaultPalette}.900`)
					},
					false: {
						"background-color": token.var("colors.gray.800")
					}
				}
			}
		}
	},
	LYRICS_PARENT_CONTAINER: {
		isFluid: {
			true: {
				isCurrentPanel: {
					true: {
						"background-color": token.var(`colors.${defaultPalette}.800`)
					},
					false: {
						"background-color": token.var("colors.transparent")
					}
				}
			}
		}
	}
}
// virtualItem.index === fluidFocusId()
// isCurrentPanel()

type FocusStylesGetter = (key: string, isFluid?: boolean, isCurrentPanel?: boolean, isCore?: boolean) => JSX.CSSProperties;
export const getBaseFocusStyles = (key: string) => {
	return mappings[key].base
}

// to improve performance, make this into a hook that returns a store, so we can take advantage of fine-grained reactivity
// or better still, set the isFluid & isCore values using data-attributes that our pre-built css file applies styles based on these attributes. Check panda docs
export const getFocusableStyles: FocusStylesGetter = (key, isFluid, isCurrentPanel, isCore) => {
	console.log(isFluid, isCurrentPanel, isCore)
	let fluidStyles = {}
	let coreStyles = {}

	if (typeof isFluid === "boolean") {
		fluidStyles = mappings[key]?.["isFluid"]?.[isFluid.toString() as BooleanString]?.["isCurrentPanel"][isCurrentPanel ? "true" : "false"] ?? {}
	}
	if (typeof isCore === "boolean") {
		coreStyles = mappings[key]?.["isCore"]?.[isCore.toString() as BooleanString]?.["isCurrentPanel"][isCurrentPanel ? "true" : "false"] ?? {}
	}
	return {...fluidStyles, ...coreStyles}
}