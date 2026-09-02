import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "button/index": "src/button/index.ts",
    "checkbox/index": "src/checkbox/index.ts",
    "dialog/index": "src/dialog/index.ts",
    "menu/index": "src/menu/index.ts",
    "scroller/index": "src/scroller/index.ts",
    "tooltip/index": "src/tooltip/index.ts",
  },
  format: ["esm"],
  outExtension: () => ({ js: ".mjs" }),
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  outDir: "dist",
});
