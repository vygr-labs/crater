import { css } from "styled-system/css";
import Image from "../Image";
import { useAppContext } from "~/layouts/AppContext";

export default function LogoBackground() {
	const { appStore } = useAppContext();

	return (
		<Image
			src={appStore.logoBg}
			alt="Logo Background"
			class={css({
				bg: "black",
				objectFit: "contain",
				position: "fixed",
				inset: 0,
				w: "full",
				h: "full",
			})}
			style={{
				opacity: appStore.showLogo ? 1 : 0,
				visibility: appStore.showLogo ? "visible" : "hidden",
			}}
		/>
	);
}
