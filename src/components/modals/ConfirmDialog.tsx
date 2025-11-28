import { createSignal, createContext, useContext, type JSX } from "solid-js";
import { HStack } from "styled-system/jsx";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Text } from "../ui/text";

export interface ConfirmDialogOptions {
	title?: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	confirmColorPalette?: string;
	onConfirm: () => void;
	onCancel?: () => void;
}

interface ConfirmContextValue {
	confirm: (options: ConfirmDialogOptions) => void;
}

const ConfirmContext = createContext<ConfirmContextValue>();

export function useConfirm() {
	const context = useContext(ConfirmContext);
	if (!context) {
		throw new Error("useConfirm must be used within a ConfirmDialogProvider");
	}
	return context;
}

interface ConfirmDialogProviderProps {
	children: JSX.Element;
}

export function ConfirmDialogProvider(props: ConfirmDialogProviderProps) {
	const [isOpen, setIsOpen] = createSignal(false);
	const [options, setOptions] = createSignal<ConfirmDialogOptions>({
		message: "",
		onConfirm: () => {},
	});

	const confirm = (opts: ConfirmDialogOptions): void => {
		setOptions(opts);
		setIsOpen(true);
	};

	const handleConfirm = () => {
		const opts = options();
		setIsOpen(false);
		opts.onConfirm();
	};

	const handleCancel = () => {
		const opts = options();
		setIsOpen(false);
		opts.onCancel?.();
	};

	const handleOpenChange = (details: { open: boolean }) => {
		if (!details.open) {
			handleCancel();
		}
	};

	return (
		<ConfirmContext.Provider value={{ confirm }}>
			{props.children}

			<Dialog.Root
				open={isOpen()}
				onOpenChange={handleOpenChange}
				placement="center"
				motionPreset="slide-in-top"
			>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content maxW="450px">
						<Dialog.Header>
							<Dialog.Title>{options().title || "Confirm"}</Dialog.Title>
						</Dialog.Header>
						<Dialog.Description px={6} pb={4}>
							<Text color="gray.300">{options().message}</Text>
						</Dialog.Description>
						<Dialog.Footer>
							<HStack gap={3} justifyContent="flex-end" w="full">
								<Button variant="ghost" onClick={handleCancel}>
									{options().cancelText || "Cancel"}
								</Button>
								<Button
									colorPalette={options().confirmColorPalette || "red"}
									onClick={handleConfirm}
								>
									{options().confirmText || "Confirm"}
								</Button>
							</HStack>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Positioner>
			</Dialog.Root>
		</ConfirmContext.Provider>
	);
}
export default ConfirmDialogProvider;
