import { createMemo, createSignal, For, Show } from "solid-js";
import { Box, VStack, HStack, Flex, Grid } from "styled-system/jsx";
import { useEditor } from "../Editor";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { Dynamic } from "solid-js/web";
import { Accordion } from "~/components/ui/accordion";
import { TbChevronDown, TbLink, TbLinkOff } from "solid-icons/tb";
import { IconButton } from "~/components/ui/icon-button";
import { css } from "styled-system/css";

// Helper to parse percentage value
const parsePercent = (value: string | number | undefined): string => {
	if (!value) return "0";
	const str = String(value).replace("%", "");
	return str;
};

// Small input component for transform values
const TransformInput = (props: {
	label: string;
	value: string;
	onChange: (value: string) => void;
	suffix?: string;
}) => (
	<Box flex="1">
		<Text fontSize="2xs" color="gray.500" mb={0.5}>
			{props.label}
		</Text>
		<Flex alignItems="center" gap={1}>
			<Input
				size="xs"
				type="text"
				value={props.value}
				onInput={(e) => props.onChange(e.currentTarget.value)}
				class={css({
					bg: "gray.800",
					borderColor: "gray.700",
					fontSize: "xs",
					py: 1,
					px: 2,
					h: "28px",
					_focus: { borderColor: "purple.500" },
				})}
			/>
			{props.suffix && (
				<Text fontSize="xs" color="gray.500">
					{props.suffix}
				</Text>
			)}
		</Flex>
	</Box>
);

export default function SettingsPanel() {
	const {
		getters: { getSelectedNode, getRenderMap },
		setters: { setNodeData, setNodeStyle },
	} = useEditor();

	const selectedNode = createMemo(() => getSelectedNode());
	const [aspectLocked, setAspectLocked] = createSignal(false);

	const handleRename = (name: string) => {
		const node = selectedNode();
		if (node) {
			setNodeData(node.id, { layerName: name });
		}
	};

	const handlePositionChange = (axis: "left" | "top", value: string) => {
		const node = selectedNode();
		if (!node) return;
		const numValue = parseFloat(value);
		if (!isNaN(numValue)) {
			setNodeStyle(node.id, { [axis]: `${numValue}%` });
		}
	};

	const handleSizeChange = (dimension: "width" | "height", value: string) => {
		const node = selectedNode();
		if (!node) return;
		const numValue = parseFloat(value);
		if (!isNaN(numValue)) {
			if (aspectLocked()) {
				const currentWidth = parseFloat(parsePercent(node.style.width));
				const currentHeight = parseFloat(parsePercent(node.style.height));
				const ratio = currentWidth / currentHeight;

				if (dimension === "width") {
					setNodeStyle(node.id, {
						width: `${numValue}%`,
						height: `${numValue / ratio}%`,
					});
				} else {
					setNodeStyle(node.id, {
						width: `${numValue * ratio}%`,
						height: `${numValue}%`,
					});
				}
			} else {
				setNodeStyle(node.id, { [dimension]: `${numValue}%` });
			}
		}
	};

	const getNodeType = () => {
		const node = selectedNode();
		if (!node) return "Element";
		switch (node.compName) {
			case "EditorText":
				return "Text";
			case "EditorContainer":
				return "Container";
			default:
				return "Element";
		}
	};

	return (
		<Box
			w="280px"
			h="full"
			bg="gray.900"
			borderLeft="1px solid"
			borderLeftColor="gray.800"
			overflow="hidden"
			display="flex"
			flexDirection="column"
		>
			<Box px={3} py={2} borderBottom="1px solid" borderBottomColor="gray.800">
				<Text
					fontSize="xs"
					fontWeight="semibold"
					color="gray.400"
					textTransform="uppercase"
					letterSpacing="wide"
				>
					Properties
				</Text>
			</Box>

			<Box flex="1" overflow="auto">
				<Show
					when={selectedNode()}
					fallback={
						<VStack
							h="full"
							justifyContent="center"
							alignItems="center"
							gap={2}
							p={4}
						>
							<Text fontSize="sm" color="gray.500" textAlign="center">
								Select an element to edit its properties
							</Text>
						</VStack>
					}
				>
					<VStack gap={0} alignItems="stretch">
						{/* Layer Name Section */}
						<Box p={3} borderBottom="1px solid" borderBottomColor="gray.800">
							<Input
								size="sm"
								placeholder="Enter layer name..."
								value={selectedNode()?.data.layerName ?? ""}
								onInput={(e) => handleRename(e.currentTarget.value)}
								variant="flushed"
								// class={css({
								// 	bg: "transparent",
								// 	border: "none",
								// 	borderBottom: "1px solid",
								// 	borderColor: "gray.700",
								// 	borderRadius: 0,
								// 	px: 0,
								// 	fontSize: "sm",
								// 	_focus: { borderColor: "purple.500", boxShadow: "none" },
								// 	_placeholder: { color: "gray.500" },
								// })}
							/>
						</Box>

						{/* Transform Section */}
						<Accordion.Root collapsible defaultValue={["transform", "element"]}>
							<Accordion.Item value="transform">
								<Accordion.ItemTrigger
									class={css({
										justifyContent: "space-between",
										cursor: "pointer",
										px: 3,
										py: 2,
										bg: "gray.850",
										borderBottom: "1px solid",
										borderBottomColor: "gray.800",
										_hover: { bg: "gray.800" },
									})}
								>
									<Text fontSize="xs" fontWeight="semibold" color="gray.300">
										Transform
									</Text>
									<Accordion.ItemIndicator>
										<TbChevronDown size={14} />
									</Accordion.ItemIndicator>
								</Accordion.ItemTrigger>
								<Accordion.ItemContent>
									<VStack gap={3} p={3} alignItems="stretch">
										{/* Position */}
										<Box>
											<Text
												fontSize="2xs"
												color="gray.500"
												mb={1.5}
												textTransform="uppercase"
												letterSpacing="wide"
											>
												Position
											</Text>
											<HStack gap={2}>
												<TransformInput
													label="X"
													value={parsePercent(selectedNode()?.style.left)}
													onChange={(v) => handlePositionChange("left", v)}
													suffix="%"
												/>
												<TransformInput
													label="Y"
													value={parsePercent(selectedNode()?.style.top)}
													onChange={(v) => handlePositionChange("top", v)}
													suffix="%"
												/>
											</HStack>
										</Box>

										{/* Size */}
										<Box>
											<Flex
												justifyContent="space-between"
												alignItems="center"
												mb={1.5}
											>
												<Text
													fontSize="2xs"
													color="gray.500"
													textTransform="uppercase"
													letterSpacing="wide"
												>
													Size
												</Text>
												<IconButton
													size="2xs"
													variant={aspectLocked() ? "solid" : "ghost"}
													colorPalette={aspectLocked() ? "purple" : "gray"}
													onClick={() => setAspectLocked(!aspectLocked())}
													title={
														aspectLocked()
															? "Unlock aspect ratio"
															: "Lock aspect ratio"
													}
												>
													{aspectLocked() ? (
														<TbLink size={12} />
													) : (
														<TbLinkOff size={12} />
													)}
												</IconButton>
											</Flex>
											<HStack gap={2}>
												<TransformInput
													label="W"
													value={parsePercent(selectedNode()?.style.width)}
													onChange={(v) => handleSizeChange("width", v)}
													suffix="%"
												/>
												<TransformInput
													label="H"
													value={parsePercent(selectedNode()?.style.height)}
													onChange={(v) => handleSizeChange("height", v)}
													suffix="%"
												/>
											</HStack>
										</Box>
									</VStack>
								</Accordion.ItemContent>
							</Accordion.Item>

							{/* Element Settings Section */}
							<Accordion.Item value="element">
								<Accordion.ItemTrigger
									class={css({
										justifyContent: "space-between",
										cursor: "pointer",
										px: 3,
										py: 2,
										bg: "gray.850",
										borderBottom: "1px solid",
										borderBottomColor: "gray.800",
										_hover: { bg: "gray.800" },
									})}
								>
									<Text fontSize="xs" fontWeight="semibold" color="gray.300">
										{getNodeType()} Settings
									</Text>
									<Accordion.ItemIndicator>
										<TbChevronDown size={14} />
									</Accordion.ItemIndicator>
								</Accordion.ItemTrigger>
								<Accordion.ItemContent>
									<Box p={3}>
										<For each={Object.values(getRenderMap())}>
											{(comp) => {
												const isCurrent = () =>
													selectedNode()?.compName === comp.name;
												return (
													<Show when={isCurrent() && comp.config.settings}>
														<Dynamic
															component={comp.config.settings}
															node={selectedNode()}
															visible={isCurrent()}
														/>
													</Show>
												);
											}}
										</For>
									</Box>
								</Accordion.ItemContent>
							</Accordion.Item>
						</Accordion.Root>
					</VStack>
				</Show>
			</Box>
		</Box>
	);
}
