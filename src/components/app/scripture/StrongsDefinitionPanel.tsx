import { createSignal, createEffect, For, Show, createMemo } from "solid-js";
import { Box, Flex, HStack, VStack, Stack } from "styled-system/jsx";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { TbBook2, TbLanguageHiragana, TbX, TbArrowLeft } from "solid-icons/tb";
import type {
	StrongsReference,
	ScriptureWord,
} from "~/utils/parser/scripture-parser";
import {
	parseScriptureWords,
	extractStrongsReferences,
	getUniqueStrongsNumbers,
} from "~/utils/parser/scripture-parser";

// Interface matching the backend StrongsEntry
export interface StrongsEntry {
	id: number;
	relativeOrder: number;
	word: string;
	data: string;
}

interface StrongsDefinitionPanelProps {
	scriptureText: string;
	onClose?: () => void;
}

/**
 * Panel component that displays Strong's definitions for a scripture verse
 */
export default function StrongsDefinitionPanel(
	props: StrongsDefinitionPanelProps,
) {
	const [definitions, setDefinitions] = createSignal<Map<string, StrongsEntry>>(
		new Map(),
	);
	const [selectedWord, setSelectedWord] = createSignal<string | null>(null);
	const [loading, setLoading] = createSignal(false);
	const [error, setError] = createSignal<string | null>(null);

	// Parse scripture text into words with Strong's references
	const parsedWords = createMemo(() =>
		parseScriptureWords(props.scriptureText),
	);

	// Get unique Strong's numbers to fetch
	const strongsNumbers = createMemo(() =>
		getUniqueStrongsNumbers(props.scriptureText),
	);

	// Fetch all Strong's definitions when scripture text changes
	createEffect(async () => {
		const numbers = strongsNumbers();
		if (numbers.length === 0) {
			setDefinitions(new Map());
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const results = await window.electronAPI.fetchMultipleStrongs(numbers);
			const defMap = new Map<string, StrongsEntry>();

			for (const entry of results) {
				defMap.set(entry.word, entry);
			}

			setDefinitions(defMap);
		} catch (err) {
			console.error("Error fetching Strong's definitions:", err);
			setError("Failed to load Strong's definitions");
		} finally {
			setLoading(false);
		}
	});

	const selectedDefinition = createMemo(() => {
		const word = selectedWord();
		if (!word) return null;
		return definitions().get(word) ?? null;
	});

	return (
		<Flex
			h="full"
			direction="column"
			bg="gray.900"
			borderRadius="lg"
			overflow="hidden"
		>
			{/* Header */}
			<HStack
				px={4}
				py={3}
				bg="gray.800"
				borderBottom="1px solid"
				borderColor="gray.700"
				justifyContent="space-between"
			>
				<HStack gap={2}>
					<TbBook2 size={20} />
					<Text fontWeight="semibold" color="gray.100">
						Strong's Concordance
					</Text>
				</HStack>
				<Show when={props.onClose}>
					<Button variant="ghost" size="xs" onClick={props.onClose} px={2}>
						<TbX size={16} />
					</Button>
				</Show>
			</HStack>

			{/* Content */}
			<Flex flex={1} overflow="hidden">
				{/* Left: Scripture words */}
				<Box
					w="50%"
					h="full"
					overflowY="auto"
					p={4}
					borderRight="1px solid"
					borderColor="gray.700"
				>
					<Text fontSize="xs" color="gray.500" mb={3} textTransform="uppercase">
						Verse Text (Click a word with Strong's reference)
					</Text>

					<Show when={loading()}>
						<Text color="gray.400" fontSize="sm">
							Loading definitions...
						</Text>
					</Show>

					<Show when={error()}>
						<Text color="red.400" fontSize="sm">
							{error()}
						</Text>
					</Show>

					<Flex flexWrap="wrap" gap={1} lineHeight="relaxed">
						<For each={parsedWords()}>
							{(word) => (
								<ScriptureWordDisplay
									word={word}
									isSelected={selectedWord() === word.strongs?.number}
									hasDefinition={
										word.strongs
											? definitions().has(word.strongs.number)
											: false
									}
									onClick={() => {
										if (word.strongs) {
											setSelectedWord(
												selectedWord() === word.strongs.number
													? null
													: word.strongs.number,
											);
										}
									}}
								/>
							)}
						</For>
					</Flex>

					<Show when={strongsNumbers().length === 0}>
						<Text color="gray.500" fontSize="sm" mt={4}>
							No Strong's references found in this verse.
						</Text>
					</Show>
				</Box>

				{/* Right: Definition panel */}
				<Box w="50%" h="full" overflowY="auto" p={4}>
					<Show
						when={selectedDefinition()}
						fallback={
							<VStack h="full" justifyContent="center" gap={2} color="gray.500">
								<TbLanguageHiragana size={48} />
								<Text fontSize="sm" textAlign="center">
									Select a highlighted word to view its Strong's definition
								</Text>
							</VStack>
						}
					>
						{(def) => <StrongsDefinitionDisplay definition={def()} />}
					</Show>
				</Box>
			</Flex>

			{/* Footer with stats */}
			<HStack
				px={4}
				py={2}
				bg="gray.800"
				borderTop="1px solid"
				borderColor="gray.700"
				fontSize="xs"
				color="gray.500"
			>
				<Text>
					{strongsNumbers().length} Strong's reference
					{strongsNumbers().length !== 1 ? "s" : ""} found
				</Text>
				<Show when={definitions().size < strongsNumbers().length && !loading()}>
					<Text color="yellow.500">
						({strongsNumbers().length - definitions().size} definition
						{strongsNumbers().length - definitions().size !== 1 ? "s" : ""} not
						in database)
					</Text>
				</Show>
			</HStack>
		</Flex>
	);
}

interface ScriptureWordDisplayProps {
	word: ScriptureWord;
	isSelected: boolean;
	hasDefinition: boolean;
	onClick: () => void;
}

/**
 * Individual word display with Strong's highlighting
 */
function ScriptureWordDisplay(props: ScriptureWordDisplayProps) {
	const hasStrongs = () => !!props.word.strongs;

	return (
		<Box
			as="span"
			cursor={hasStrongs() ? "pointer" : "default"}
			px={hasStrongs() ? 1 : 0}
			py={0.5}
			borderRadius="sm"
			bg={
				props.isSelected
					? "purple.700"
					: hasStrongs()
						? props.hasDefinition
							? "purple.900/50"
							: "yellow.900/30"
						: "transparent"
			}
			color={
				props.isSelected
					? "white"
					: hasStrongs()
						? props.hasDefinition
							? "purple.200"
							: "yellow.300"
						: props.word.isItalic
							? "gray.400"
							: "gray.200"
			}
			fontStyle={props.word.isItalic ? "italic" : "normal"}
			_hover={
				hasStrongs()
					? { bg: props.isSelected ? "purple.600" : "purple.800/70" }
					: {}
			}
			transition="all 0.15s"
			onClick={props.onClick}
			title={
				hasStrongs()
					? `${props.word.strongs!.type === "hebrew" ? "Hebrew" : "Greek"} ${props.word.strongs!.number}`
					: undefined
			}
		>
			{props.word.text}
			<Show when={hasStrongs()}>
				<Text
					as="sup"
					fontSize="8px"
					color={props.isSelected ? "purple.200" : "gray.500"}
					ml={0.5}
				>
					{props.word.strongs!.number}
				</Text>
			</Show>
		</Box>
	);
}

interface StrongsDefinitionDisplayProps {
	definition: StrongsEntry;
}

/**
 * Displays a Strong's definition with proper formatting
 */
function StrongsDefinitionDisplay(props: StrongsDefinitionDisplayProps) {
	// The data field contains HTML - we'll render it safely
	const isHebrew = () => props.definition.word.startsWith("H");

	return (
		<VStack gap={4} alignItems="stretch">
			{/* Header with Strong's number */}
			<HStack
				p={3}
				bg={isHebrew() ? "blue.900/50" : "green.900/50"}
				borderRadius="md"
				borderLeft="4px solid"
				borderColor={isHebrew() ? "blue.500" : "green.500"}
			>
				<Box
					px={2}
					py={1}
					bg={isHebrew() ? "blue.700" : "green.700"}
					borderRadius="md"
					fontFamily="mono"
					fontWeight="bold"
					fontSize="lg"
				>
					{props.definition.word}
				</Box>
				<Text fontSize="sm" color="gray.400">
					{isHebrew() ? "Hebrew" : "Greek"} Strong's Number
				</Text>
			</HStack>

			{/* Definition content - rendered as HTML */}
			<Box
				class="strongs-definition-content"
				p={4}
				bg="gray.800"
				borderRadius="md"
				fontSize="sm"
				lineHeight="relaxed"
				css={{
					"& p": {
						marginBottom: "0.75rem",
					},
					"& strong": {
						color: "var(--colors-gray-100)",
						fontWeight: 600,
					},
					"& ol": {
						paddingLeft: "1.5rem",
						marginBottom: "0.75rem",
					},
					"& li": {
						marginBottom: "0.25rem",
					},
					"& a": {
						color: "var(--colors-purple-400)",
						textDecoration: "underline",
						cursor: "pointer",
					},
					"& i": {
						fontStyle: "italic",
						color: "var(--colors-gray-300)",
					},
				}}
				innerHTML={props.definition.data}
			/>
		</VStack>
	);
}

// Export the word type for use in other components
export type { ScriptureWord };
