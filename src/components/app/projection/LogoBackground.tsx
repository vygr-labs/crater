import { css } from "styled-system/css";

export default function LogoBackground() {
	// const { logoBg, showLogo } = useAppSelector(state => ({
	// 	logoBg: state.app.logoBg,
	// 	showLogo: state.app.showLogo,
	// }))
	// const imagePath = useAppSelector(state => getMediaPath(state, logoBg))

	return (
		<img
			// opacity={showLogo ? 1 : 0}
			// visibility={showLogo ? 'visible' : 'hidden'}
			class={css({
				bg: "black",
				objectFit: "contain",
				position: "fixed",
				inset: 0,
				w: "full",
				h: "full",
			})}
			alt="Logo Background"
			// src={imagePath}
		/>
	);
}
