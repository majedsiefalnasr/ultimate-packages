import { defineConfig } from "tsup";
import vuePlugin from "@vitejs/plugin-vue";
import { createFilter } from "vite";

// tsup/esbuild has no native .vue understanding (unlike its native .tsx
// support, which needed no such plugin in react-core/react's Phase 3
// tsup.config.ts). @vitejs/plugin-vue's transform function compiles a .vue
// SFC's <template>/<script>/<style> blocks; only the JS/TS output of that
// transform is passed on to esbuild, which then handles it exactly like any
// other TS file. This is the vue-core/vue-specific tsup wiring spec §3
// requires.
//
// @vitejs/plugin-vue's `transform` hook alone is not self-sufficient: it
// reads `options.value.compiler`, which the plugin only populates inside its
// own `buildStart` Rollup hook, and it reads `options.value.root` /
// `sourceMap` / `isProduction` etc., which only get set inside its
// `configResolved` hook — both hooks real Vite calls automatically during
// its plugin-container lifecycle, but which esbuild/tsup never call at all.
// Verified empirically (Step 4): calling `transform` alone throws
// "Cannot read properties of null (reading 'parse')" because
// `options.value.compiler` is still null. Invoking `configResolved` and
// `buildStart` once at module load, with a minimal fake Vite ResolvedConfig,
// is sufficient to initialize the plugin's internal state so `transform`
// then returns real compiled component code.
const vue = vuePlugin();
const filter = createFilter(/\.vue$/);

// This runs at module top level (outside defineConfig), mutating the
// plugin-vue singleton's internal state as a side effect of importing this
// config module. That only works because tsup evaluates this config file
// fresh per invocation (single entry, single build, no watch mode); if this
// file ever needs multiple build targets or watch-mode re-invocation, these
// calls would need to move into a proper per-build lifecycle scope instead.
vue.configResolved.call(
  {},
  {
    root: process.cwd(),
    command: "build",
    isProduction: true,
    build: { sourcemap: false },
    css: {},
    define: {},
    logger: { warn: () => {} },
  }
);
vue.buildStart.call({});

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm"],
  outExtension: () => ({ js: ".mjs" }),
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  outDir: "dist",
  // The `configResolved` fake config above is minimal/incomplete relative to
  // Vite's real ResolvedConfig. @vitejs/plugin-vue's internal reads on
  // config fields this shim doesn't provide return `undefined` silently
  // (plain JS property access on a missing key) rather than throwing. A
  // future @vitejs/plugin-vue version that starts reading a new *optional*
  // config field could silently change SFC-compilation output (e.g.
  // dev-tools instrumentation, custom-element detection, source-map
  // fidelity) instead of failing loudly — which is why the version above is
  // pinned exactly rather than left on a caret range.
  //
  // No regression test currently exercises this .vue-compilation shim (the
  // task's manual verification .vue file was deleted after confirming the
  // build worked, per plan instructions — no real .vue component ships in
  // this package yet). This shim will be implicitly exercised the first time
  // a real .vue file goes through this package's build; re-verify it against
  // the then-current @vitejs/plugin-vue behavior at that point.
  esbuildPlugins: [
    {
      name: "vue-sfc",
      setup(build) {
        build.onLoad({ filter: /\.vue$/ }, async (args) => {
          const fs = await import("node:fs/promises");
          const source = await fs.readFile(args.path, "utf8");
          if (!filter(args.path)) return undefined;
          const result = await vue.transform.call(
            { addWatchFile() {} },
            source,
            args.path
          );
          const code = typeof result === "string" ? result : result?.code ?? source;
          return { contents: code, loader: "ts" };
        });
      },
    },
  ],
});
