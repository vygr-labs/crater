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
import { DEFAULT_PANEL } from "~/utils/constants";

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

type EventsSubscription = {
	[event: KeyboardEvent["key"]]: (
		params: FocusEventHandlerParams & { event: KeyboardEvent },
	) => void; // the fn is the event handler
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
};

interface FocusStore {
	previous?: string;
	current: string;
	subscribers: {
		[name: string]: {
			coreFocusId: FocusType;
			fluidFocusId?: FocusType;
			handlers: EventsSubscription;
			clickHandlers?: ClickEventsSubscription;
		};
	};
}

type FocusEventSubscriberFn = (
	params: EventSubscriberParams,
) => FocusEventSubscriberFnReturnVal;
type ChangeContextFn = (newContext: string, params?: {}) => void;

interface FocusContextReturnVal {
	// add an isModal setting that ensures the context is always reset to the previous value when the current context is de-focused
	subscribeEvent: FocusEventSubscriberFn;
	changeFocusPanel: ChangeContextFn;
	currentPanel: Accessor<string | undefined>;
	previousPanel?: string;
}

const FocusContext = createContext<FocusContextReturnVal>();

export default function FocusContextProvider(props: ParentProps) {
	const [store, setStore] = createStore<FocusStore>({
		subscribers: {},
		current: DEFAULT_PANEL,
	});
	const currentPanel = createMemo(() => store.current);
	const currentSubscriber = createMemo(() => store.subscribers[store.current]);

	const changeCoreFocus: InternalChangeFocusFn = ({
		contextName,
		newFocusId,
	}) => {
		if (!contextName) return;
		setStore("subscribers", contextName, "coreFocusId", newFocusId);
	};

	const changeFluidFocus: InternalChangeFocusFn = ({
		contextName,
		newFocusId,
	}) => {
		if (!contextName) return;
		setStore("subscribers", contextName, "fluidFocusId", newFocusId);
	};

	const changeFocus: InternalChangeFocusFn = ({ contextName, newFocusId }) => {
		if (!contextName) return;
		setStore(
			produce((store) => {
				store.subscribers[contextName].coreFocusId = newFocusId;
				store.subscribers[contextName].fluidFocusId = newFocusId;
			}),
		);
	};

	onKeyDown(
		(e) =>
			Object.values(store.subscribers)
				.flatMap((subscriber) => Object.keys(subscriber.handlers))
				.includes(e.key),
		(e) => {
			const currentPanel = store.subscribers[store.current];
			if (currentPanel && Object.hasOwn(currentPanel.handlers, e.key)) {
				currentPanel.handlers[e.key]({
					name: store.current,
					coreFocusId: currentPanel.coreFocusId,
					fluidFocusId: currentPanel.fluidFocusId,
					changeFocus: (newId) =>
						changeFocus({ contextName: store.current, newFocusId: newId }),
					changeCoreFocus: (newId) =>
						changeCoreFocus({ contextName: store.current, newFocusId: newId }),
					changeFluidFocus: (newId) =>
						changeFluidFocus({ contextName: store.current, newFocusId: newId }),
					event: e,
				});
			}
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
	}) => {
		// const name = "combo-" + Math.random() * 100
		setStore("subscribers", name, {
			handlers,
			coreFocusId: defaultCoreFocus,
			fluidFocusId: defaultFluidFocus,
			clickHandlers,
		});

		return {
			name,
			isCurrentPanel: createMemo(() => store.current === name),
			coreFocusId: createMemo(() => store.subscribers[name].coreFocusId),
			fluidFocusId: createMemo(() => store.subscribers[name].fluidFocusId),
			changeFocus: (newId: FocusType) =>
				changeFocus({ contextName: name, newFocusId: newId }),
		};
	};

	const changeFocusPanel: ChangeContextFn = (newContext) => {
		console.log("Changing Focus Panel");
		setStore(
			produce((store) => {
				store.previous = store.current;
				store.current = newContext;
			}),
		);
	};

	return (
		<FocusContext.Provider
			value={{
				subscribeEvent,
				changeFocusPanel,
				previousPanel: store.previous,
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
