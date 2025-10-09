import { Box } from "styled-system/jsx"
import { Input, type InputProps } from "../ui/input"

interface Props extends InputProps {
	firstBookMatch: string
}

export default function SearchInput(props: Props) {
	// const inputRef = useRef<HTMLInputElement>(null)

	// useEffect(() => {
	// 	inputRef.current.select() // Select all text in the input when it mounts
	// }, [value])

	return (
		<Box w="full" pos="relative">
			<Input
				pos="relative"
				zIndex={10}
				variant="outline"
				// borderWidth={2}
				// borderColor="border.emphasized"
				rounded="none"
                border="unset"
				px="2"
				h="9"
				outline="none"
				w="full"
				_selection={{
					bgColor: '#3A3A3A',
				}}
				value={props.value}
				{...props}
			/>

			<Input
				// ref={inputRef}
				pos="absolute"
				top={0}
				left={0}
				// zIndex={10}
				variant="outline"
                border="unset"
				// borderWidth={2}
				// borderColor="border.emphasized"
				rounded="none"
				px="2"
				h="9"
				outline="none"
				w="full"
				_selection={{
					bgColor: '#3A3A3A',
				}}
				color="white"
				{...props}
				placeholder=""
				value={props.firstBookMatch}
			/>
		</Box>
	)
}
