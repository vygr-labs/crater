import {
	createSignal,
	createContext,
	useContext,
	Show,
	onCleanup,
	onMount,
	createEffect,
	type ParentProps,
	type JSX,
} from "solid-js";
import { Portal } from "solid-js/web";
import { Box, HStack } from "styled-system/jsx";
import { TbChevronRight } from "solid-icons/tb";

type Position = { x: number; y: number };

interface ContextMenuContextValue {
	isOpen: () => boolean;
	setIsOpen: (v: boolean) => void;
	position: () => Position;
	setPosition: (v: Position) => void;
}

const ContextMenuContext = createContext<ContextMenuContextValue>();

export function Root(
	props: ParentProps<{
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
	}>,
) {
	const [isOpenSignal, setIsOpenSignal] = createSignal(props.open || false);
	const [position, setPosition] = createSignal<Position>({ x: 0, y: 0 });

	const isOpen = () => {
		const val = props.open !== undefined ? props.open : isOpenSignal();
		return val;
	};

	const setIsOpen = (v: boolean) => {
		setIsOpenSignal(v);
		props.onOpenChange?.(v);
	};

	return (
		<ContextMenuContext.Provider
			value={{ isOpen, setIsOpen, position, setPosition }}
		>
			{props.children}
		</ContextMenuContext.Provider>
	);
}

export function Trigger(props: ParentProps<{ ref?: any }>) {
	const ctx = useContext(ContextMenuContext);

	const handleContextMenu = (e: MouseEvent) => {
		if (!ctx) return;
		// Only trigger if not already handled (though we want to override default browser menu)
		if (e.defaultPrevented) return;
		
		e.preventDefault();
		e.stopPropagation();
		ctx.setPosition({ x: e.clientX, y: e.clientY });
		ctx.setIsOpen(true);
	};

	return (
		<Box
			ref={props.ref}
			onContextMenu={handleContextMenu}
			w="full"
			h="full"
			overflow="auto"
		>
			{props.children}
		</Box>
	);
}

export function Content(props: ParentProps<{ width?: string; minW?: string }>) {
	const ctx = useContext(ContextMenuContext);
	let ref!: HTMLDivElement;

	const handleClickOutside = (e: MouseEvent) => {
		if (ref && !ref.contains(e.target as Node)) {
			ctx?.setIsOpen(false);
		}
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Escape") ctx?.setIsOpen(false);
		e.stopPropagation();
	};

	createEffect(() => {
		if (ctx?.isOpen()) {
			// Small delay to prevent immediate closing if the click that opened it bubbles?
			// Context menu is usually opened by right click, so mousedown shouldn't trigger immediately on the same event loop for left click.
			setTimeout(() => {
				document.addEventListener("mousedown", handleClickOutside);
				document.addEventListener("keydown", handleKeyDown);
			}, 10);
		} else {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleKeyDown);
		}
	});

	onCleanup(() => {
		if (typeof document !== "undefined") {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleKeyDown);
		}
	});

	const [adjustedPos, setAdjustedPos] = createSignal<Position>({ x: 0, y: 0 });
	const [opacity, setOpacity] = createSignal(0);

	createEffect(() => {
		const isOpen = ctx?.isOpen();
		const pos = ctx?.position();

		if (isOpen && pos) {
			// Wait for render to measure dimensions
			requestAnimationFrame(() => {
				if (!ref) return;
				const rect = ref.getBoundingClientRect();
				const winW = window.innerWidth;
				const winH = window.innerHeight;

				let { x, y } = pos;

				// Check right edge
				if (x + rect.width > winW) {
					x -= rect.width;
				}

				// Check bottom edge
				if (y + rect.height > winH) {
					y -= rect.height;
				}

				// Ensure positive coordinates
				x = Math.max(0, x);
				y = Math.max(0, y);

				setAdjustedPos({ x, y });
				setOpacity(1);
			});
		} else {
			setOpacity(0);
		}
	});

	// Only render if we have a valid position (not 0,0 unless that's where we clicked)
	// But 0,0 is the default state, so we might want to check if it's open first
	const shouldRender = () => ctx?.isOpen() && (ctx.position().x !== 0 || ctx.position().y !== 0);

	return (
		<Show when={shouldRender()}>
			<Portal>
				<div
					ref={ref}
					style={{
						position: "fixed",
						left: `${adjustedPos().x}px`,
						top: `${adjustedPos().y}px`,
						opacity: opacity(),
						"z-index": 99999,
						"background-color": "#030712", // gray.950
						border: "1px solid #1f2937", // gray.800
						"border-radius": "0.375rem",
						"box-shadow": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
						padding: "0.25rem 0",
						"min-width": props.minW || "200px",
						display: "flex",
						"flex-direction": "column",
					}}
					onContextMenu={(e) => e.preventDefault()}
					onKeyDown={(e) => e.stopPropagation()}
				>
					{props.children}
				</div>
			</Portal>
		</Show>
	);
}

export function Item(
	props: ParentProps<{
		onClick?: () => void;
		color?: string;
		_hover?: any;
		value?: string; // For compatibility
	}>,
) {
	const ctx = useContext(ContextMenuContext);

	const handleClick = (e: MouseEvent) => {
		e.stopPropagation();
		props.onClick?.();
		ctx?.setIsOpen(false);
	};

	return (
		<Box
			px={3}
			py={1.5}
			cursor="pointer"
			fontSize="sm"
			color={props.color || "gray.300"}
			_hover={{ bg: "gray.800", color: "white", ...props._hover }}
			onClick={handleClick}
			transition="colors 0.1s"
			display="flex"
			alignItems="center"
			w="full"
		>
			{props.children}
		</Box>
	);
}

export function Separator() {
	return <Box h="1px" bg="gray.800" my={1} />;
}

export function ItemGroup(props: ParentProps) {
	return <Box>{props.children}</Box>;
}

const SubMenuContext = createContext<{ isOpen: () => boolean }>();

export function SubRoot(props: ParentProps) {
	const [isOpen, setIsOpen] = createSignal(false);
	
	return (
		<Box
			pos="relative"
			onMouseEnter={() => setIsOpen(true)}
			onMouseLeave={() => setIsOpen(false)}
		>
			<SubMenuContext.Provider value={{ isOpen }}>
				{props.children}
			</SubMenuContext.Provider>
		</Box>
	);
}

export function TriggerItem(props: ParentProps<{ w?: string; justifyContent?: string }>) {
    return (
        <Box
			px={3}
			py={1.5}
			cursor="pointer"
			fontSize="sm"
			color="gray.300"
			_hover={{ bg: "gray.800", color: "white" }}
			transition="colors 0.1s"
			display="flex"
			alignItems="center"
            justifyContent={props.justifyContent}
			w={props.w || "full"}
		>
			{props.children}
		</Box>
    )
}

export function Positioner(props: ParentProps) {
    const ctx = useContext(SubMenuContext);
    return (
        <Show when={ctx?.isOpen()}>
            <Box pos="absolute" left="100%" top="-4px" pl={2}>
                {props.children}
            </Box>
        </Show>
    )
}
