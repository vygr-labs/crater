import type { Accessor, JSX, JSXElement, Setter } from "solid-js";
import type { FullGestureState } from "@use-gesture/core/types";

export type NodeId = string | undefined;

export interface ExpectedNodeData {
    resize: ScaleValues
    [key: string]: any
}

export interface EditorNode {
    id: NodeId;
    data: ExpectedNodeData;
    el: HTMLElement;
    comp: EditorRenderComponent;
    style: JSX.CSSProperties;
    compName: string;
    // handlers: NodeEventHandlersObj
}

export type EditorEvent = "selectNode" | "deselectNode" | "dragNode"
export type NodeDragEventHandler = (params: FullGestureState<"drag">) => void;

export interface EditorStore {
    nodes: Record<string, EditorNode>;
    rootRef?: HTMLElement;
    selectedId?: NodeId;
    handlers: {
        selectNode: NodeSelectHandler[],
        dragNode: NodeDragEventHandler[]
    }
}

export interface CreateNodeParams { };
export type RegisterNodeParams = {
    // id: string;
    ref: HTMLElement
}

export type RegisterNodeFn = (ref: RegisterNodeParams["ref"]) => void;
// export type RegisterNodeFn<Extend = {}> = (params: RegisterNodeParams & Extend) => void;
export type RegisterNodeFnWithId = (params: RegisterNodeParams & { id: NodeId }) => void;

export interface CreateNodeReturnVal {
    id: NodeId;
    register: (ref: HTMLElement) => void
};

export type NodeData = Record<string, any>;

export type CreateNodeFn = (params: CreateNodeParams) => CreateNodeReturnVal;
export type ConnectNodeFn = (ref: HTMLElement, element: EditorRenderComponent, props?: NodeData) => void;
export interface EditorNodeConnectors {
    create: ConnectNodeFn;
    register: RegisterNodeFnWithId;
}

export interface RenderComponentConfig {
    props?: Record<string, any>;
    settings?: () => JSXElement;
}

export interface EditorRenderComponent {
    (props: any): JSXElement;
    config: RenderComponentConfig;
}

export type SelectedEditorNode = EditorNode | null | undefined;
export type SetNodeStyleFn = (id: NodeId, styles: JSX.CSSProperties) => void;
export type NodeSelectHandler = (params: { formerSelected: SelectedEditorNode, newSelected: SelectedEditorNode }) => void;

export type ScaleAxis = "x" | "y" | "z"
export type ScaleValues = {
    width?: string;
    height?: string;
    x: number;
    y: number;
    z: number;
    // [axis in ScaleAxis]: number;
}

export type UseResizeNodeFn = (id: NodeId, scaleValues: ScaleValues) => void;

export interface EditorContextValue {
    editor: EditorStore;
    setEditor: Setter<EditorStore>;
    createNode: CreateNodeFn;
    connectors: EditorNodeConnectors;
    getters: {
        getNode: (id: NodeId) => EditorNode | null;
        getNodeRenderComp: (node: EditorNode) => EditorRenderComponent;
        getRootRef: Accessor<HTMLElement | undefined>;
        getSelectedNode: Accessor<EditorNode | null>;
    };
    setters: {
        setRootRef: (ref: HTMLElement) => void;
        setNodeStyle: SetNodeStyleFn
    },
    hooks: {
        useSelect: (callback: NodeSelectHandler) => void;
        useNodeDrag: (callback: NodeDragEventHandler) => void;
        useResizeNode: UseResizeNodeFn
    }
}

export interface NodeCompProps {
    nodeId: NodeId;
}