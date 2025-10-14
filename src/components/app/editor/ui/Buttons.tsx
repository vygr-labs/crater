import { IconButton, type IconButtonProps } from "~/components/ui/icon-button";
import { defaultPalette } from "~/utils/constants";

export const ControlIconBtn = (props: IconButtonProps) => {
    return (
        <IconButton size={props.size || "xs"} variant={props.variant || "subtle"} color="whiteAlpha.800" _icon={{ w: props.iconSize || 18, h: props.iconSize || 18 }}>
            {props.children}
        </IconButton>
    );
};