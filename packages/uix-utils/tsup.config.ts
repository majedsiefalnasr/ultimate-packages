import { defineConfig } from "tsup";
import { readdirSync } from "node:fs";

const submodules = readdirSync("src", { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

export default defineConfig({
  entry: {
    index: "src/index.ts",
    ...Object.fromEntries(submodules.map((name) => [`${name}/index`, `src/${name}/index.ts`])),
  },
  format: ["esm"],
  outExtension: () => ({ js: ".mjs" }),
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  outDir: "dist",
});
