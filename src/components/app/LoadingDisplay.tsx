import { Box, VStack, HStack, styled } from "styled-system/jsx";
import { Text } from "../ui/text";
import { css, cx } from "styled-system/css";
import logoWhite from "~/assets/media/logo-white.png";

const pulseAnimation = css({
	animation: "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
});

const shimmerAnimation = css({
	position: "relative",
	overflow: "hidden",
	_after: {
		content: '""',
		position: "absolute",
		top: 0,
		left: "-100%",
		width: "100%",
		height: "100%",
		background:
			"linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
		animation: "shimmer 2s infinite",
	},
});

const progressBarAnimation = css({
	animation: "progress 2.5s ease-in-out infinite",
});

export default function LoadingDisplay() {
	return (
		<VStack
			w="full"
			h="full"
			bg="bg.panel"
			justifyContent="center"
			alignItems="center"
			gap="6"
			rounded="xl"
			p="8"
		>
			{/* Logo with subtle pulse */}
			<Box class={pulseAnimation}>
				<styled.img
					src={logoWhite.src}
					alt="Crater Logo"
					w="80px"
					h="80px"
					objectFit="contain"
					filter="drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))"
				/>
			</Box>

			{/* App name and loading text */}
			<VStack gap="2" textAlign="center">
				<Text
					textStyle="2xl"
					fontWeight="bold"
					color="fg.default"
					letterSpacing="tight"
				>
					Crater
				</Text>
				<Text textStyle="sm" color="fg.muted">
					Loading your worship experience...
				</Text>
			</VStack>

			{/* Animated progress bar */}
			{/* <Box
				w="200px"
				h="3px"
				bg="bg.emphasized"
				rounded="full"
				overflow="hidden"
				mt="2"
			>
				<Box
					class={progressBarAnimation}
					h="full"
					bg="linear-gradient(90deg, var(--colors-accent-default), var(--colors-accent-emphasized))"
					rounded="full"
				/>
			</Box> */}

			{/* Version or tagline */}
			<Text textStyle="xs" color="fg.subtle" mt="8">
				Free Scripture & Song Projection for Churches
			</Text>

			{/* Add keyframes via style tag */}
			<styled.style>{`
				@keyframes shimmer {
					0% { left: -100%; }
					100% { left: 100%; }
				}
				@keyframes progress {
					0% { width: 0%; margin-left: 0%; }
					50% { width: 60%; margin-left: 20%; }
					100% { width: 0%; margin-left: 100%; }
				}
			`}</styled.style>
		</VStack>
	);
}
