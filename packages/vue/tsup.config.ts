import { defineConfig } from "tsup";
import vuePlugin from "@vitejs/plugin-vue";
import { createFilter } from "vite";

// @vitejs/plugin-vue emits an `import _export_sfc from '\0plugin-vue:export-helper'`
// for any SFC whose compiled output needs post-processing (e.g. assigning
// `name`/`__file` onto the options object) — a Rollup-virtual-module
// convention (the `\0` prefix) that only a real Vite/Rollup build resolves
// via the plugin's own `resolveId`/`load` hooks. esbuild has no such
// concept, so this shim's own `onResolve`/`onLoad` pair below provides the
// same tiny static helper module directly. The real helper source is
// `@vitejs/plugin-vue`'s internal `EXPORT_HELPER_ID`/`helperCode` constants
// (not publicly exported, so reproduced verbatim here).
const EXPORT_HELPER_ID = "\0plugin-vue:export-helper";
const EXPORT_HELPER_CODE = `
export default (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
}
`;

const vue = vuePlugin();
const filter = createFilter(/\.vue$/);

// @vitejs/plugin-vue's `transform` hook reads its resolved options
// (crucially `compiler`, populated by the real Vite `buildStart` lifecycle
// hook — see `resolveCompiler(options.value.root)` inside plugin-vue's own
// source) from a module-level ref that is only ever set outside of a real
// Vite build. Calling `vue.transform` directly, as this esbuild shim does,
// skips that lifecycle entirely, so `options.value.compiler` stays `null`
// and `compiler.parse(...)` throws inside `createDescriptor`. Invoking the
// plugin's own `buildStart()` once up front (its default `root:
// process.cwd()` is already sane for this monorepo package) populates
// `compiler` the same way a real Vite build would, without needing to
// replicate the rest of Vite's config-resolution pipeline. Found and fixed
// during Task 17 (UButton) — the first `.vue` SFC to actually exercise this
// shim's template-compilation path; Task 3/15's icons/ripple work never hit
// this because it had no `.vue` files to build.
vue.buildStart?.call({});

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "ripple/index": "src/ripple/index.ts",
    "button/index": "src/button/index.ts",
    "checkbox/index": "src/checkbox/index.ts",
    "dialog/index": "src/dialog/index.ts",
    "menu/index": "src/menu/index.ts",
    "tooltip/index": "src/tooltip/index.ts",
  },
  format: ["esm"],
  outExtension: () => ({ js: ".mjs" }),
  // Declaration files are generated separately by `vue-tsc` (see this
  // package's `build` script), not by tsup's own `dts: true` (which bundles
  // declarations via `rollup-plugin-dts`, a plain Rollup pipeline with no
  // `.vue` awareness at all — outside of this esbuild shim entirely, so it
  // cannot resolve `import ... from "./Button.vue"` and fails with
  // "'default' is not exported by 'Button.vue'"). `vue-tsc` already
  // understands `.vue` natively (it IS the Vue-aware TypeScript compiler
  // this package's own `typecheck` script already runs) and emits correct,
  // real per-file `.d.ts` output including a genuine `Button.vue.d.ts`
  // sibling — the standard approach for Vue component libraries. Found and
  // fixed during Task 17 (UButton), the first `.vue` SFC in this package.
  dts: false,
  sourcemap: true,
  clean: true,
  splitting: false,
  outDir: "dist",
  esbuildPlugins: [
    {
      name: "vue-sfc",
      setup(build) {
        build.onResolve({ filter: /^\0?plugin-vue:export-helper$/ }, () => ({
          path: EXPORT_HELPER_ID,
          namespace: "vue-sfc-export-helper",
        }));
        build.onLoad(
          { filter: /^\0?plugin-vue:export-helper$/, namespace: "vue-sfc-export-helper" },
          () => ({ contents: EXPORT_HELPER_CODE, loader: "js" })
        );
        build.onLoad({ filter: /\.vue$/ }, async (args) => {
          const fs = await import("node:fs/promises");
          const source = await fs.readFile(args.path, "utf8");
          if (!filter(args.path)) return undefined;
          const result = await vue.transform.call({ addWatchFile() {} }, source, args.path);
          const code = typeof result === "string" ? result : result?.code ?? source;
          return { contents: code, loader: "ts" };
        });
      },
    },
  ],
});
