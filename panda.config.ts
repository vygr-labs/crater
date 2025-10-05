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
  jsxFramework: "solid",
  outdir: "styled-system",
});
