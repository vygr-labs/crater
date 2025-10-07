import { Box, Center } from "styled-system/jsx"
import { useAppContext } from "~/layouts/AppContext"
import { Spinner } from "../ui/spinner";
import { Text } from "../ui/text";
import { IconButton } from "../ui/icon-button";
import { TbX } from "solid-icons/tb";

export default function AppLoading() {
    const { appStore, setAppStore } = useAppContext();

	return (
		<Box
			class="relative"
			w="full"
			h="full"
			pos="fixed"
			inset={0}
			opacity={appStore.loading?.isLoading ? 1 : 0}
			visibility={appStore.loading?.isLoading ? 'visible' : 'hidden'}
		>
			<Box w="full" h="full" bg="blackAlpha.600"></Box>
			<Center
				bg="bg.subtle"
				py={3}
				px={6}
				w="md"
				h="56"
				flexDir="column"
				gap={5}
				justifyContent="center"
				alignItems="center"
				zIndex={4000}
			>
				<Spinner size="lg" />
				<Text textStyle="lg" fontWeight="700">
					{appStore.loading?.reason ?? 'Loading...'}
				</Text>
				{/* <ProgressRoot maxW="240px" striped animated>
					<ProgressBar />
				</ProgressRoot> */}
			</Center>
			<IconButton
				pos="absolute"
				top="4"
				right="4"
				variant="ghost"
				aria-label="Close"
				onClick={() => {
					setAppStore("loading", { reason: '', isLoading: false })
				}}
			>
				<TbX />
			</IconButton>
		</Box>
	)
}
