import {
	createEffect,
	createMemo,
	createUniqueId,
	For,
	Show,
	useContext,
	type JSX,
	type JSXElement,
	type ParentProps,
} from "solid-js";
import type {
	CreateNodeFn,
	CreateNodeParams,
	EditorNode,
	EditorNodeConnectors,
	EditorRenderComponent,
	EditorRenderMap,
	ExportedTheme,
	ExportThemeFn,
	LoadThemeFn,
	NodeDragEventHandler,
	NodeId,
	NodeSelectHandler,
	RegisterNodeFn,
	RegisterNodeFnWithId,
	SelectNodeFn,
	SetNodeDataFn,
	SetNodeStyleFn,
	UseResizeNodeFn,
} from "./editor-types";
import EditorContext from "./EditorContext";
import { createStore, produce, unwrap } from "solid-js/store";
import type { EditorStore } from "./editor-types";
import { createId, transformEditorComp } from "~/utils";
import { defaultLyric, defaultScripture } from "~/utils/constants";

interface Props extends ParentProps {
	renderMap: EditorRenderMap;
}
const defaultNodeData = {
	resize: {
		x: 1,
		y: 1,
		z: 1,
	},
};

export default function Editor(props: Props) {
	const [editor, setEditor] = createStore<EditorStore>({
		nodes: {},
		handlers: {
			selectNode: [],
			dragNode: [],
		},
		demos: {
			scripture: defaultScripture,
			lyric: defaultLyric,
		},
	});
	const canRender = (compName: string) =>
		Object.keys(props.renderMap).includes(compName);
	const getSelectedNode = createMemo(() => {
		return editor.selectedId ? editor.nodes[editor.selectedId] : null;
	});
	const getRenderMap = () => props.renderMap;

	const getDemoScripture = () => editor.demos.scripture;
	const getDemoLyric = () => editor.demos.lyric;

	const selectNode: SelectNodeFn = (id) => {
		console.log("FORMER ID: ", editor.selectedId, id);
		if (editor.selectedId === id) return;

		console.log(unwrap(editor.nodes));
		const formerNode = getSelectedNode();
		console.log(unwrap(formerNode?.style));
		const newSelection = id ? editor.nodes[id] : null;
		console.log("Handling selection", formerNode?.id, newSelection?.id);
		setEditor("selectedId", id);
		editor.handlers["selectNode"].forEach((cb) =>
			cb({ formerSelected: formerNode, newSelected: newSelection }),
		);
		// console.log("Setting selected Node: ", unwrap(editor.nodes), id, unwrap(newSelection));
		// console.log("Selected Node Styles: ", unwrap(newSelection?.style))
	};

	const registerNodeEl: RegisterNodeFnWithId = ({ id, ref }) => {
		if (!id) return;
		console.log("Registering Node: ", id, ref);
		ref.dataset.editorNodeId = id;
		// ref.addEventListener("mousedown", () => selectNode(id));
		setEditor("nodes", id, "el", ref);
	};

	const useNodeSelect = (cb: NodeSelectHandler) => {
		console.log("Setting handler: useNodeSelect");
		setEditor(
			"handlers",
			"selectNode",
			editor.handlers.selectNode.length,
			() => cb,
		);
	};

	const useNodeDrag = (cb: NodeDragEventHandler) => {
		console.log("Setting handler: useNodeDrag");
		setEditor(
			"handlers",
			"dragNode",
			editor.handlers.dragNode.length,
			() => cb,
		);
	};

	const useResizeNode: UseResizeNodeFn = (id, scaleValues) => {
		console.log("Setting data: useResizeNode");
		if (id) {
			setEditor("nodes", id, "data", "resize", scaleValues);
		}
	};

	const createNode: CreateNodeFn = (params) => {
		const id = createId();
		console.log("Created ID: ", id);
		setEditor("nodes", id, {
			id: id,
		});

		return { id, register: (ref) => registerNodeEl({ id, ref }) };
	};

	const connectors: EditorNodeConnectors = {
		create: (comp, additionalProps = {}) => {
			console.log("Creating Node: ", comp);
			comp = transformEditorComp(comp);

			if (!canRender(comp.name)) {
				throw new Error("Cannot connect unregistered component");
			}

			const id = createId();
			console.log("Created ID to Assign: ", id);
			console.log(comp);
			setEditor("nodes", id, {
				id,
				data: {
					...props.renderMap[comp.name].config.defaultData,
					...additionalProps,
					...defaultNodeData,
				},
				comp,
				compName: comp.name,
				style: { ...props.renderMap[comp.name].config.defaultStyles },
			});
			console.log(unwrap(editor));
		},
		register: registerNodeEl,
	};

	const getNode = (id: NodeId) => (id ? editor.nodes[id] : null);
	const getNodeRenderComp = (node: EditorNode) =>
		props.renderMap[node.comp.name];

	// Debug effect removed - was causing unnecessary re-renders
	// createEffect(() => {
	// 	console.log("App Editor: ", editor.nodes);
	// });

	const setRootRef = (ref: HTMLElement) => {
		console.log("Setting Root Ref: ", ref);
		setEditor("rootRef", ref);
	};
	const getRootRef = () => editor.rootRef;

	const setNodeStyle: SetNodeStyleFn = (id, styles) => {
		if (id && editor.nodes[id]) {
			setEditor("nodes", id, "style", styles);
			console.log("Setting Node Style: ", editor.nodes[id].style);
		} else {
			console.log("Failed to set node style");
		}
	};

	const setNodeData: SetNodeDataFn = (id, data) => {
		if (id && editor.nodes[id]) {
			setEditor("nodes", id, "data", data);
			console.log("updated node data: ", editor.nodes[id].style);
		} else {
			console.log("could not set node data");
		}
	};

	// Debug effect removed - was causing unnecessary re-renders
	// createEffect(() => {
	// 	console.log(
	// 		"Something in this item changed: ",
	// 		editor.nodes?.[0],
	// 		editor.nodes?.[0]?.id,
	// 		editor.nodes?.[0]?.style,
	// 	);
	// });

	const exportTheme: ExportThemeFn = () => {
		const nodeData = Object.values(editor.nodes).map((node) => ({
			id: node.id,
			compName: node.compName,
			data: node.data,
			style: node.style,
		}));
		return {
			nodes: nodeData,
		};
	};

	const loadTheme: LoadThemeFn = (savedTheme = { nodes: [] }) => {
		console.log("Loading Theme: ", savedTheme);
		setEditor(
			produce((store) => {
				console.log("To Map: ", savedTheme.nodes);
				store.selectedId = null;
				console.log(store.handlers);
				store.nodes = Object.fromEntries(
					savedTheme.nodes.map((node) => {
						transformEditorComp(props.renderMap[node.compName]);
						console.log(props.renderMap[node.compName]);
						console.log({ ...node, comp: props.renderMap[node.compName] });
						return [node.id, { ...node, comp: props.renderMap[node.compName] }];
					}),
				);
			}),
		);
		console.log(unwrap(editor));
	};

	const deleteNode = (id: NodeId) => {
		if (!id) return;
		setEditor(
			produce((store) => {
				delete store.nodes[id];
			}),
		);
	};

	const duplicateNode = (id: NodeId) => {
		if (!id) return null;
		const node = editor.nodes[id];
		if (!node) return null;

		const newId = createId();
		const offsetStyle = {
			...node.style,
			left: `calc(${node.style.left} + 2%)`,
			top: `calc(${node.style.top} + 2%)`,
		};

		setEditor("nodes", newId, {
			...JSON.parse(JSON.stringify(unwrap(node))),
			id: newId,
			style: offsetStyle,
			comp: node.comp, // Keep the component reference
		});

		return newId;
	};

	const contextValue = {
		editor,
		setEditor,
		createNode,
		connectors,
		getters: {
			getNode,
			getNodeRenderComp,
			getRootRef,
			getSelectedNode,
			getRenderMap,
			getDemoScripture,
			getDemoLyric,
		},
		setters: { setRootRef, setNodeStyle, setNodeData },
		hooks: { useSelect: useNodeSelect, useNodeDrag, useResizeNode },
		helpers: { selectNode, exportTheme, loadTheme, deleteNode, duplicateNode },
	};

	return (
		<EditorContext.Provider value={contextValue}>
			{props.children}
		</EditorContext.Provider>
	);
}

export const useEditor = () => {
	const value = useContext(EditorContext);

	if (!value) {
		throw new Error(
			"There has to be an Editor higher up in the component tree",
		);
	}

	return value;
};
