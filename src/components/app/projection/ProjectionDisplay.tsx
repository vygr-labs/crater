import type { ExportedTheme } from "../editor/editor-types";
import AppContextProvider from "~/layouts/AppContext";
import RenderProjection from "./RenderProjection";

export default function ProjectionDisplay() {
	return (
		<AppContextProvider>
			<RenderProjection />
		</AppContextProvider>
	);
}
