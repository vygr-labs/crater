import { splitProps } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";

interface Props extends JSX.ImgHTMLAttributes<HTMLImageElement> {}

export default function Image(_props: Props) {
	const [props, rest] = splitProps(_props, ["src"]);
	return <img src={"image://" + props.src} {...rest} />;
}
