import { createEffect, createMemo, createSignal, Show } from "solid-js";
import { Box, HStack, Stack, VStack } from "styled-system/jsx";
import { Dialog } from "../ui/dialog";
import { Field } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Text } from "../ui/text";
import { Checkbox } from "../ui/checkbox";
import type { DialogOpenChangeDetails } from "@ark-ui/solid";
import { useAppContext } from "~/layouts/AppContext";
import { produce } from "solid-js/store";
import type { DisplayProps } from "~/types";
import { Textarea } from "../ui/textarea";
import { TbDeviceFloppy, TbLink, TbUnlink } from "solid-icons/tb";

interface Props {
	open: boolean;
	setOpen: (open: boolean) => void;
	itemIndex: number | null;
}

export default function ScheduleItemEditor(props: Props) {
	const { appStore, setAppStore } = useAppContext();
	
	// Local state for editing
	const [title, setTitle] = createSignal("");
	const [dataContent, setDataContent] = createSignal("");
	const [syncWithDb, setSyncWithDb] = createSignal(false);
	
	// Get the schedule item being edited
	const scheduleItem = createMemo(() => {
		if (props.itemIndex === null) return null;
		return appStore.scheduleItems[props.itemIndex];
	});
	
	// Initialize form when item changes or dialog opens
	createEffect(() => {
		if (props.open && scheduleItem()) {
			const item = scheduleItem()!;
			setTitle(item.metadata?.title || "");
			// Convert data array to text (one line per item)
			const content = item.data?.map(d => {
				if (typeof d === "string") return d;
				if (d.text) return d.text;
				return JSON.stringify(d);
			}).join("\n\n") || "";
			setDataContent(content);
			setSyncWithDb(false); // Default to not syncing
		}
	});
	
	const onDialogOpen = (v: DialogOpenChangeDetails) => {
		props.setOpen(v.open);
	};
	
	const handleSave = async () => {
		if (props.itemIndex === null || !scheduleItem()) return;
		
		const item = scheduleItem()!;
		
		// Parse the content back into data array
		const newData = dataContent()
			.split("\n\n")
			.filter(line => line.trim())
			.map((text, idx) => {
				// Try to preserve original structure if it was an object
				if (item.data[idx] && typeof item.data[idx] === "object") {
					return { ...item.data[idx], text };
				}
				return text;
			});
		
		// Update the schedule item
		setAppStore("scheduleItems", props.itemIndex, produce((scheduleItem) => {
			if (scheduleItem.metadata) {
				scheduleItem.metadata.title = title();
			}
			scheduleItem.data = newData;
		}));
		
		// Optionally sync with database
		if (syncWithDb() && item.metadata?.id) {
			try {
				if (item.type === "song") {
					// Update song in database
					// Note: For full sync, we'd need to convert data back to SongLyric format
					// For now, we only sync the title
					await window.electronAPI.updateSong({
						songId: item.metadata.id as number,
						newTitle: title(),
						newLyrics: [], // Keep existing lyrics - TODO: implement full lyrics sync
					});
				}
				// Add other types here as needed (scripture, etc.)
			} catch (error) {
				console.error("Failed to sync with database:", error);
			}
		}
		
		props.setOpen(false);
	};
	
	const handleCancel = () => {
		props.setOpen(false);
	};
	
	const itemType = createMemo(() => scheduleItem()?.type || "item");
	const isEditable = createMemo(() => {
		const type = itemType();
		// Songs and custom items are editable
		return type === "song" || type === "message";
	});
	
	const canSyncWithDb = createMemo(() => {
		const item = scheduleItem();
		if (!item) return false;
		// Can only sync songs for now
		return item.type === "song" && item.metadata?.id;
	});

	return (
		<Dialog.Root
			placement="center"
			motionPreset="slide-in-top"
			open={props.open}
			onOpenChange={onDialogOpen}
			size="lg"
		>
			<Dialog.Backdrop />
			<Dialog.Positioner>
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title textTransform="capitalize">
							Edit Schedule Item
						</Dialog.Title>
					</Dialog.Header>
					<Dialog.Body>
						<Stack gap={4}>
							{/* Title field */}
							<Field.Root>
								<Field.Label>Title</Field.Label>
								<Input
									value={title()}
									onInput={(e) => setTitle(e.currentTarget.value)}
									placeholder="Enter title..."
								/>
							</Field.Root>
							
							{/* Content field */}
							<Show when={isEditable()}>
								<Field.Root>
									<Field.Label>
										Content
										<Text fontSize="xs" color="gray.500" ml={2}>
											(Separate sections with blank lines)
										</Text>
									</Field.Label>
									<Textarea
										value={dataContent()}
										onInput={(e) => setDataContent(e.currentTarget.value)}
										placeholder="Enter content..."
										rows={10}
										resize="vertical"
									/>
								</Field.Root>
							</Show>
							
							{/* Non-editable types message */}
							<Show when={!isEditable()}>
								<Box
									p={3}
									bg="gray.800"
									borderRadius="md"
									borderLeft="3px solid"
									borderLeftColor="yellow.500"
								>
									<Text fontSize="sm" color="gray.400">
										<Text as="span" fontWeight="medium" color="yellow.400">Note: </Text>
										Content editing is only available for songs and custom messages.
										For {itemType()} items, only the title can be edited here.
									</Text>
								</Box>
							</Show>
							
							{/* Sync with DB checkbox */}
							<Show when={canSyncWithDb()}>
								<Box
									p={3}
									bg="gray.900"
									borderRadius="md"
									border="1px solid"
									borderColor="gray.700"
								>
									<Checkbox
										checked={syncWithDb()}
										onCheckedChange={(e) => setSyncWithDb(!!e.checked)}
									>
										<HStack gap={2}>
											<Show when={syncWithDb()} fallback={<TbUnlink />}>
												<TbLink />
											</Show>
											<VStack gap={0} alignItems="flex-start">
												<Text fontSize="sm" fontWeight="medium">
													Sync changes with database
												</Text>
												<Text fontSize="xs" color="gray.500">
													Updates the original {itemType()} in the database.
													This will affect other schedules using this item.
												</Text>
											</VStack>
										</HStack>
									</Checkbox>
								</Box>
							</Show>
						</Stack>
					</Dialog.Body>
					<Dialog.Footer>
						<HStack gap={2}>
							<Button variant="ghost" onClick={handleCancel}>
								Cancel
							</Button>
							<Button onClick={handleSave}>
								<TbDeviceFloppy />
								Save Changes
							</Button>
						</HStack>
					</Dialog.Footer>
					<Dialog.CloseTrigger />
				</Dialog.Content>
			</Dialog.Positioner>
		</Dialog.Root>
	);
}
