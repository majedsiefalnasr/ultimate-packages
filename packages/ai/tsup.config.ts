import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { index: "src/index.ts" },
    format: ["esm"],
    outExtension: () => ({ js: ".mjs" }),
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    outDir: "dist",
  },
  {
    entry: { "bin-generate": "src/bin-generate.ts" },
    format: ["esm"],
    outExtension: () => ({ js: ".mjs" }),
    dts: false,
    sourcemap: true,
    splitting: false,
    outDir: "dist",
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
  {
    entry: { "bin-validate": "src/bin-validate.ts" },
    format: ["esm"],
    outExtension: () => ({ js: ".mjs" }),
    dts: false,
    sourcemap: true,
    splitting: false,
    outDir: "dist",
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
]);
