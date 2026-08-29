import { readdirSync } from "node:fs";
import { defineConfig } from "tsup";

// Every subdirectory under src/ (base, button, checkbox, dialog, menu,
// tooltip, ...) is its own subpath-exported entry point, each built from
// its own src/<name>/index.ts into dist/<name>/index.mjs. Discovered here
// so new style modules don't require a config edit.
const submoduleEntries = Object.fromEntries(
  readdirSync("src", { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => [`${entry.name}/index`, `src/${entry.name}/index.ts`])
);

export default defineConfig({
  entry: {
    index: "src/index.ts",
    ...submoduleEntries,
  },
  format: ["esm"],
  outExtension: () => ({ js: ".mjs" }),
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  outDir: "dist",
});
