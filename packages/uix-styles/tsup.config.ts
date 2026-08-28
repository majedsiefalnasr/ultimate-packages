import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "base/index": "src/base/index.ts",
  },
  format: ["esm"],
  outExtension: () => ({ js: ".mjs" }),
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  outDir: "dist",
});
