import { splitProps } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";

interface Props extends JSX.VideoHTMLAttributes<HTMLVideoElement> {}

export default function Video(_props: Props) {
	const [props, rest] = splitProps(_props, ["src"]);
	return (
		<video {...rest}>
			<source src={"media://" + props.src} />
		</video>
	);
}
