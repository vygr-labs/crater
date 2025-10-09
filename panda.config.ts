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
import { defaultPalette, defaultSupportingPalette } from "~/utils/constants";

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
        },
      },
    ],
  },
  jsxFramework: "solid",
  outdir: "styled-system",
});
