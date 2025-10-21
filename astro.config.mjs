// @ts-check
import { defineConfig } from "astro/config";

import solidJs from "@astrojs/solid-js";

// https://astro.build/config
export default defineConfig({
	integrations: [solidJs()],
	build: {
		format: "file",
		assetsPrefix: ".",
	},
	server: {
		port: 7241,
	},
});
