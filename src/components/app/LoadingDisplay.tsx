import { Box, VStack } from "styled-system/jsx";
import Image from "./Image";
import { Text } from "../ui/text";

export default function LoadingDisplay() {
	return (
		<VStack
			w="full"
			h="full"
			bg="bg.panel"
			justifyContent="center"
			rounded="md"
		>
			{/* <Image src={image} /> */}
			<Text textStyle="md">Loading Crater...</Text>
		</VStack>
	);
}
