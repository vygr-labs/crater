import {
	createEffect,
	createMemo,
	createSignal,
	type JSXElement,
	type ParentProps,
} from "solid-js";
import { useAppContext } from "~/layouts/AppContext";
import type { GroupCategory, GroupType } from "~/types";
import { Dialog } from "../ui/dialog";
import { Field, GenericField } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import type { DialogOpenChangeDetails } from "@ark-ui/solid";
import { Portal } from "solid-js/web";
import { Box } from "styled-system/jsx";
import { produce } from "solid-js/store";

interface Props extends ParentProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	title: string;
	footer: JSXElement;
}

export default function GenericModal(props: Props) {
	const [name, setName] = createSignal("");

	const onSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		setName("");
		onDialogOpen({ open: false });
	};

	const onDialogOpen = (v: DialogOpenChangeDetails) => {
		props.setOpen(v.open);
	};

	return (
		<Dialog.Root
			placement="center"
			motionPreset="slide-in-top"
			open={props.open}
			onOpenChange={onDialogOpen}
		>
			{/* <Portal> */}
			<Dialog.Backdrop />
			<Dialog.Positioner>
				<Dialog.Content onSubmit={onSubmit}>
					<Box as="form">
						<Dialog.Header>
							<Dialog.Title textTransform="capitalize">
								{props.title}
							</Dialog.Title>
						</Dialog.Header>
						<Dialog.Body>{props.children}</Dialog.Body>
						<Dialog.Footer>{props.footer}</Dialog.Footer>
					</Box>
					<Dialog.CloseTrigger />
				</Dialog.Content>
			</Dialog.Positioner>
			{/* </Portal> */}
		</Dialog.Root>
	);
}
