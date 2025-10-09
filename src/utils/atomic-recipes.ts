import { cva } from "styled-system/css";
import { defaultPalette, SCRIPTURE_TAB_FOCUS_NAME, SONGS_TAB_FOCUS_NAME } from "./constants";

// necessary styles for @tanstack/virtual list
const tanstackVirtualStyles = {
    pos: "absolute",
    top: 0,
    left: 0,
    w: "full",
}

export const focusStyles = cva({
    variants: {
        panel: {
            [SONGS_TAB_FOCUS_NAME]: {
                ...tanstackVirtualStyles,
                // additional styles
                textAlign: "left",
                userSelect: "none",
                fontSize: "14px",
                pl: 4,
                cursor: "pointer",
                py: 1.5,
                "& *": {
                    pointerEvents: "none",
                },
            },
            [SCRIPTURE_TAB_FOCUS_NAME]: {
                ...tanstackVirtualStyles,
                // additional styles
                fontSize: "14px",
                py: 2,
                height: "unset",
                tabIndex: -1,
                userSelect: "none",
                "& *": {
                    pointerEvents: "none",
                }
            },
        },
        isCurrentCore: {
            true: {},
            false: {}
        },
        isCurrentFluid: {
            true: {},
            false: {}
        }
    },
    compoundVariants: [
        {
            panel: SONGS_TAB_FOCUS_NAME,
            isCurrentFluid: true,
            css: {
                bgColor: `${defaultPalette}.900`,
                color: "white"
            }
        },
        {
            panel: SONGS_TAB_FOCUS_NAME,
            isCurrentCore: true,
            css: {
                bgColor: `${defaultPalette}.800`,
                color: "white"
            }
        }
    ]
})