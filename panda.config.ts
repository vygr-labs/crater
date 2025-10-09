import { defineConfig } from "@pandacss/dev";
import {
  breakpoints,
  keyframes,
  tokens,
  semanticTokens,
  recipes,
  slotRecipes,
  textStyles,
  layerStyles,
  animationStyles,
  cssVarsRoot,
  globalCss
} from "~/theme";
import { defaultPalette, defaultSupportingPalette, PREVIEW_INDEX_WIDTH } from "~/utils/constants";

export default defineConfig({
  preflight: true,
  include: ["./src/**/*.{js,jsx,ts,tsx}"],
  exclude: ["./src/backend"],
  cssVarRoot: cssVarsRoot,
  globalCss,
  theme: {
    breakpoints,
    keyframes,
    tokens,
    semanticTokens,
    recipes,
    slotRecipes,
    textStyles,
    layerStyles,
    animationStyles,
  },
  staticCss: {
    css: [
      {
        properties: {
          colorPalette: [defaultPalette, defaultSupportingPalette],
          width: [PREVIEW_INDEX_WIDTH],
          margin: [PREVIEW_INDEX_WIDTH],
          padding: [PREVIEW_INDEX_WIDTH],
          paddingLeft: [PREVIEW_INDEX_WIDTH]
        },
      },
    ],
  },
  jsxFramework: "solid",
  outdir: "styled-system",
});
