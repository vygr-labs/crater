import {
	createContext,
	createEffect,
	createMemo,
	createSignal,
	onCleanup,
	onMount,
	useContext,
	type Accessor,
	type ParentProps,
} from "solid-js";
import { createStore, produce } from "solid-js/store";
import { onKeyDown, useEventListener } from "solidjs-use";
import { DEFAULT_PANEL, GLOBAL_FOCUS_NAME } from "~/utils/constants";

export type FocusType = number | undefined | null;
type ChangeFocusFn = (newFocusId?: FocusType) => void;
type InternalChangeFocusFn = (params: {
	contextName: string;
	newFocusId?: FocusType;
}) => void;

interface FocusEventSubscriberFnReturnVal {
	name: string;
	coreFocusId: () => FocusType;
	fluidFocusId: () => FocusType;
	isCurrentPanel: () => boolean;
	changeFocus: ChangeFocusFn;
	changeCoreFocus: ChangeFocusFn;
	changeFluidFocus: ChangeFocusFn;
}

interface FocusEventHandlerParams {
	name: string;
	coreFocusId: FocusType;
	fluidFocusId: FocusType;
	changeFocus: ChangeFocusFn;
	changeCoreFocus: ChangeFocusFn;
	changeFluidFocus: ChangeFocusFn;
}

type ClickEventType = "onClick" | "onDblClick" | "onRightClick";

export type FocusEventHandlerFn = (
	params: FocusEventHandlerParams & { event: KeyboardEvent },
) => void;

type EventsSubscription = {
	[event: KeyboardEvent["key"]]: FocusEventHandlerFn; // the fn is the event handler
};

type ClickEventsSubscription = {
	[clickEvent in ClickEventType]?: (
		params: FocusEventHandlerParams & { event: MouseEvent; focusId: FocusType },
	) => void; // the fn is the event handler
};

type EventSubscriberParams = {
	name: string;
	handlers: EventsSubscription;
	clickHandlers?: ClickEventsSubscription;
	defaultFluidFocus?: any;
	defaultCoreFocus?: any;
	global?: boolean;
};

interface FocusSubscriber {
	coreFocusId: FocusType;
	fluidFocusId?: FocusType;
	handlers: EventsSubscription;
	clickHandlers?: ClickEventsSubscription;
}

interface FocusStore {
	previous: string;
	current: string;
	subscribers: {
		[name: string]: FocusSubscriber;
	};
}

type FocusEventSubscriberFn = (
	params: EventSubscriberParams,
) => FocusEventSubscriberFnReturnVal;
type ChangeContextFn = (newContext?: string, params?: {}) => void;

interface FocusContextReturnVal {
	// add an isModal setting that ensures the context is always reset to the previous value when the current context is de-focused
	subscribeEvent: FocusEventSubscriberFn;
	changeFocusPanel: ChangeContextFn;
	currentPanel: Accessor<string | undefined>;
	previousPanel: Accessor<string | undefined>;
}

const FocusContext = createContext<FocusContextReturnVal>();

export default function FocusContextProvider(props: ParentProps) {
	const [store, setStore] = createStore<FocusStore>({
		subscribers: {},
		current: DEFAULT_PANEL,
		previous: DEFAULT_PANEL,
	});
	const currentPanel = createMemo(() => store.current);
	const previousPanel = createMemo(() => store.previous);
	const currentSubscriber = createMemo(() => store.subscribers[store.current]);
	const GLOBAL_SHORTCUTS: string[] = [];

	const changeCoreFocus: InternalChangeFocusFn = ({
		contextName,
		newFocusId,
	}) => {
		console.log("Changing Core Focus for: ", contextName, newFocusId);
		if (!contextName) return;
		setStore("subscribers", contextName, "coreFocusId", newFocusId);
	};

	const changeFluidFocus: InternalChangeFocusFn = ({
		contextName,
		newFocusId,
	}) => {
		console.log("Changing Fluid Focus for: ", contextName, newFocusId);
		if (!contextName) return;
		setStore("subscribers", contextName, "fluidFocusId", newFocusId);
	};

	const changeFocus: InternalChangeFocusFn = ({ contextName, newFocusId }) => {
		console.log("Changing Focus for: ", contextName, newFocusId);
		if (!contextName) return;
		setStore(
			produce((store) => {
				store.subscribers[contextName].coreFocusId = newFocusId;
				store.subscribers[contextName].fluidFocusId = newFocusId;
			}),
		);
	};

	const calllHandlers = (focusPanel: FocusSubscriber, event: KeyboardEvent) => {
		if (focusPanel && Object.hasOwn(focusPanel.handlers, event.key)) {
			focusPanel.handlers[event.key]({
				name: store.current,
				coreFocusId: focusPanel.coreFocusId,
				fluidFocusId: focusPanel.fluidFocusId,
				changeFocus: (newId) =>
					changeFocus({ contextName: store.current, newFocusId: newId }),
				changeCoreFocus: (newId) =>
					changeCoreFocus({ contextName: store.current, newFocusId: newId }),
				changeFluidFocus: (newId) =>
					changeFluidFocus({ contextName: store.current, newFocusId: newId }),
				event,
			});
		}
	};

	onKeyDown(
		(e) =>
			Object.values(store.subscribers)
				.flatMap((subscriber) => Object.keys(subscriber.handlers)) // .concat(GLOBAL_SHORTCUTS)
				.includes(e.key),
		(e) => {
			if (GLOBAL_SHORTCUTS.includes(e.key)) {
				console.log("calling global shortcuts: ", GLOBAL_SHORTCUTS);
				calllHandlers(store.subscribers[GLOBAL_FOCUS_NAME], e);
			}
			calllHandlers(store.subscribers[store.current], e);
		},
	);

	const mouseDownEventListener = (e: MouseEvent) => {
		const isLeftClick = e.button === 0;
		const isDblClick = e.detail === 2;
		const eventKey =
			isLeftClick && !isDblClick
				? "onClick"
				: isLeftClick && isDblClick
					? "onDblClick"
					: "onRightClick";
		const target = e.target as HTMLElement;
		const focusPanel = target.getAttribute("data-panel");
		const clickedContext = focusPanel ? store.subscribers[focusPanel] : null;

		if (
			clickedContext &&
			clickedContext.clickHandlers &&
			clickedContext?.clickHandlers[eventKey]
		) {
			const focusId =
				parseInt(target.getAttribute("data-focusId") ?? "") ?? null;

			if (focusPanel && focusPanel !== store.current) {
				changeFocusPanel(focusPanel);
			}

			console.log(focusPanel);
			clickedContext.clickHandlers[eventKey]({
				name: store.current,
				coreFocusId: clickedContext.coreFocusId,
				fluidFocusId: clickedContext.fluidFocusId,
				changeFocus: (newId) =>
					changeFocus({ contextName: store.current, newFocusId: newId }),
				changeCoreFocus: (newId) =>
					changeCoreFocus({ contextName: store.current, newFocusId: newId }),
				changeFluidFocus: (newId) =>
					changeFluidFocus({ contextName: store.current, newFocusId: newId }),
				event: e,
				focusId,
			});
		}
	};

	onMount(() => {
		document.addEventListener("mousedown", mouseDownEventListener);
		onCleanup(() =>
			document.removeEventListener("mousedown", mouseDownEventListener),
		);
	});

	const subscribeEvent: FocusEventSubscriberFn = ({
		name,
		handlers,
		defaultCoreFocus,
		defaultFluidFocus,
		clickHandlers,
		global,
	}) => {
		// const name = "combo-" + Math.random() * 100
		if (global) {
			console.log(
				"setting global shortcuts: ",
				Object.keys(handlers),
				GLOBAL_SHORTCUTS,
			);
			GLOBAL_SHORTCUTS.push(...Object.keys(handlers));
			setStore("subscribers", GLOBAL_FOCUS_NAME, {
				handlers,
				coreFocusId: defaultCoreFocus,
				fluidFocusId: defaultFluidFocus,
				clickHandlers,
			});
		} else {
			setStore("subscribers", name, {
				handlers,
				coreFocusId: defaultCoreFocus,
				fluidFocusId: defaultFluidFocus,
				clickHandlers,
			});
		}

		return {
			name,
			isCurrentPanel: createMemo(() => store.current === name),
			coreFocusId: createMemo(() => store.subscribers[name].coreFocusId),
			fluidFocusId: createMemo(() => store.subscribers[name].fluidFocusId),
			changeFocus: (newId: FocusType) =>
				changeFocus({ contextName: name, newFocusId: newId }),
			changeCoreFocus: (newId: FocusType) =>
				changeCoreFocus({ contextName: name, newFocusId: newId }),
			changeFluidFocus: (newId: FocusType) =>
				changeFluidFocus({ contextName: name, newFocusId: newId }),
		};
	};

	const changeFocusPanel: ChangeContextFn = (newContext) => {
		console.log("Changing Focus Panel?: ", newContext, store.current);
		if (newContext && newContext !== store.current) {
			setStore(
				produce((store) => {
					store.previous = store.current;
					store.current = newContext;
				}),
			);
		}
	};

	return (
		<FocusContext.Provider
			value={{
				subscribeEvent,
				changeFocusPanel,
				previousPanel: previousPanel,
				currentPanel: currentPanel,
			}}
		>
			{props.children}
		</FocusContext.Provider>
	);
}

export const useFocusContext = () => {
	const value = useContext(FocusContext);

	if (!value) {
		throw new Error(
			"FocusContext has not been initialized. Check if it is in one of the parent components.",
		);
	}

	return value;
};
