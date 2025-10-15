import { createContext } from "solid-js";
import type { EditorContextValue } from "./editor-types";

const EditorContext = createContext<EditorContextValue>();

export default EditorContext;
