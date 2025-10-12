import { createEffect, createMemo, createUniqueId, For, Show, useContext, type JSX, type JSXElement, type ParentProps } from "solid-js";
import type { CreateNodeFn, CreateNodeParams, EditorNode, EditorNodeConnectors, EditorRenderComponent, NodeDragEventHandler, NodeId, NodeSelectHandler, RegisterNodeFn, RegisterNodeFnWithId, SetNodeStyleFn, UseResizeNodeFn } from "./editor-types";
import EditorContext from "./EditorContext";
import { createStore, unwrap } from "solid-js/store";
import type { EditorStore } from "./editor-types";
import { createId, transformEditorComp } from "~/utils";

interface Props extends ParentProps {
    renderMap: Record<string, EditorRenderComponent>
}
const defaultNodeData = { 
    resize: {
        x: 1, y: 1, z: 1 
    }
}

export default function Editor(props: Props) {
    const [editor, setEditor] = createStore<EditorStore>({ nodes: {}, handlers: {
        selectNode: [],
        dragNode: []
    } });
    const canRender = (compName: string) => Object.keys(props.renderMap).includes(compName)
    const getSelectedNode = createMemo(() => {
        console.log("SELECTED NODE: ", unwrap(editor.nodes[editor.selectedId ?? ""]?.style))
        return editor.selectedId ? editor.nodes[editor.selectedId] : null
    });

    const registerNodeEl: RegisterNodeFnWithId = ({id, ref}) => {
        if (!id) return;
        console.log("Registering Node: ", id, ref);
        ref.dataset.editorNodeId = id;
        ref.onmousedown = () => {
            if (editor.selectedId === id) return;
            console.log(unwrap(editor.nodes))
            const formerNode = getSelectedNode();
            console.log(unwrap(formerNode?.style))
            const newSelection = editor.nodes[id];
            console.log("Handling selection", formerNode?.id, newSelection?.id)
            setEditor("selectedId", id)
            editor.handlers["selectNode"].forEach(cb => cb({ formerSelected: formerNode, newSelected: newSelection }));
            console.log("Setting selected Node: ", unwrap(editor.nodes), id, unwrap(editor.nodes[id]));
            console.log("Selected Node Styles: ", unwrap(editor.nodes[id].style))
        }
        setEditor("nodes", id, "el", ref);
    }

    const useNodeSelect = (cb: NodeSelectHandler) => {
        console.log("Setting handler: useNodeSelect")
        setEditor("handlers", "selectNode", editor.handlers.selectNode.length, () => cb);
    }

    const useNodeDrag = (cb: NodeDragEventHandler) => {
        console.log("Setting handler: useNodeDrag")
        setEditor("handlers", "dragNode", editor.handlers.dragNode.length, () => cb);
    }

    const useResizeNode: UseResizeNodeFn = (id, scaleValues) => {
        console.log("Setting data: useResizeNode")
        if (id) {
            setEditor("nodes", id, "data", "resize", scaleValues)
        }
    }

    const createNode: CreateNodeFn = (params) => {
        const id = createId();
        console.log("Created ID: ", id);
        setEditor("nodes", id, {
            id: id,
        });

        return { id, register: (ref) => registerNodeEl({id, ref}) };
    }

    const connectors: EditorNodeConnectors = {
        create: (el, comp, additionalProps = {}) => {
            console.log("Creating Node: ", el, comp)
            comp = transformEditorComp(comp);

            if (!canRender(comp.name)) {
                throw new Error("Cannot connect unregistered component");
            };

            const id = createId();
            console.log("Created ID to Assign: ", id)
            console.log(el, comp)
            setEditor("nodes", id, {
                id,
                data: {...props.renderMap[comp.name].config.props, ...additionalProps, ...defaultNodeData},
                comp,
                compName: comp.name,
                style: {}
            })
            console.log(unwrap(editor));
        },
        register: registerNodeEl
    }

    const getNode = (id: NodeId) => id ? editor.nodes[id] : null;
    const getNodeRenderComp = (node: EditorNode) => props.renderMap[node.comp.name] 

    createEffect(() => {
        console.log("App Editor: ", editor.nodes)
    })

    const setRootRef = (ref: HTMLElement) => {
        console.log("Setting Root Ref: ", ref)
        setEditor("rootRef", ref);
    }
    const getRootRef = () => editor.rootRef;

    const setNodeStyle: SetNodeStyleFn = (id, styles) => {
        if (id && editor.nodes[id]) {
            setEditor("nodes", id, "style", styles)
            console.log("Setting Node Style: ", editor.nodes[id].style)
        }
        console.log("Failed to set node style")
    }

    createEffect(() => {
        console.log("Something in this item changed: ", editor.nodes?.[0], editor.nodes?.[0]?.id, editor.nodes?.[0]?.style)
    })

    const contextValue = { editor, setEditor, createNode, connectors, getters: { getNode, getNodeRenderComp, getRootRef, getSelectedNode }, setters: { setRootRef, setNodeStyle }, hooks: { useSelect: useNodeSelect, useNodeDrag, useResizeNode } };

    return <EditorContext.Provider value={contextValue}>
        {props.children}
    </EditorContext.Provider>
}


export const useEditor = () => {
    const value = useContext(EditorContext);

    if (!value) {
        throw new Error("There has to be an Editor higher up in the component tree");
    }

    return value;
}