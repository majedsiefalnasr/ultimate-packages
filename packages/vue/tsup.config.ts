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
    "paginator/index": "src/paginator/index.ts",
    "scroller/index": "src/scroller/index.ts",
    "table/index": "src/table/index.ts",
    "tooltip/index": "src/tooltip/index.ts",
    "accordion/index": "src/accordion/index.ts",
    "accordion-content/index": "src/accordion-content/index.ts",
    "accordion-header/index": "src/accordion-header/index.ts",
    "accordion-panel/index": "src/accordion-panel/index.ts",
    "animate-on-scroll/index": "src/animate-on-scroll/index.ts",
    "autocomplete/index": "src/autocomplete/index.ts",
    "avatar/index": "src/avatar/index.ts",
    "avatar-group/index": "src/avatar-group/index.ts",
    "badge/index": "src/badge/index.ts",
    "block-ui/index": "src/block-ui/index.ts",
    "breadcrumb/index": "src/breadcrumb/index.ts",
    "button-group/index": "src/button-group/index.ts",
    "card/index": "src/card/index.ts",
    "carousel/index": "src/carousel/index.ts",
    "cascade-select/index": "src/cascade-select/index.ts",
    "chip/index": "src/chip/index.ts",
    "color-picker/index": "src/color-picker/index.ts",
    "confirm-dialog/index": "src/confirm-dialog/index.ts",
    "confirm-popup/index": "src/confirm-popup/index.ts",
    "context-menu/index": "src/context-menu/index.ts",
    "data-view/index": "src/data-view/index.ts",
    "date-picker/index": "src/date-picker/index.ts",
    "deferred-content/index": "src/deferred-content/index.ts",
    "divider/index": "src/divider/index.ts",
    "dock/index": "src/dock/index.ts",
    "drawer/index": "src/drawer/index.ts",
    "dynamic-dialog/index": "src/dynamic-dialog/index.ts",
    "fieldset/index": "src/fieldset/index.ts",
    "file-upload/index": "src/file-upload/index.ts",
    "float-label/index": "src/float-label/index.ts",
    "galleria/index": "src/galleria/index.ts",
    "icon-field/index": "src/icon-field/index.ts",
    "ifta-label/index": "src/ifta-label/index.ts",
    "image/index": "src/image/index.ts",
    "image-compare/index": "src/image-compare/index.ts",
    "inline-message/index": "src/inline-message/index.ts",
    "inplace/index": "src/inplace/index.ts",
    "input-chips/index": "src/input-chips/index.ts",
    "input-group/index": "src/input-group/index.ts",
    "input-mask/index": "src/input-mask/index.ts",
    "input-number/index": "src/input-number/index.ts",
    "input-otp/index": "src/input-otp/index.ts",
    "input-text/index": "src/input-text/index.ts",
    "key-filter/index": "src/key-filter/index.ts",
    "knob/index": "src/knob/index.ts",
    "listbox/index": "src/listbox/index.ts",
    "mega-menu/index": "src/mega-menu/index.ts",
    "menubar/index": "src/menubar/index.ts",
    "message/index": "src/message/index.ts",
    "meter-group/index": "src/meter-group/index.ts",
    "multi-select/index": "src/multi-select/index.ts",
    "order-list/index": "src/order-list/index.ts",
    "organization-chart/index": "src/organization-chart/index.ts",
    "overlay-badge/index": "src/overlay-badge/index.ts",
    "panel/index": "src/panel/index.ts",
    "panel-menu/index": "src/panel-menu/index.ts",
    "password/index": "src/password/index.ts",
    "pick-list/index": "src/pick-list/index.ts",
    "popover/index": "src/popover/index.ts",
    "progress-bar/index": "src/progress-bar/index.ts",
    "progress-spinner/index": "src/progress-spinner/index.ts",
    "radio-button/index": "src/radio-button/index.ts",
    "rating/index": "src/rating/index.ts",
    "scroll-panel/index": "src/scroll-panel/index.ts",
    "scroll-top/index": "src/scroll-top/index.ts",
    "select/index": "src/select/index.ts",
    "select-button/index": "src/select-button/index.ts",
    "skeleton/index": "src/skeleton/index.ts",
    "slider/index": "src/slider/index.ts",
    "speed-dial/index": "src/speed-dial/index.ts",
    "split-button/index": "src/split-button/index.ts",
    "splitter/index": "src/splitter/index.ts",
    "stepper/index": "src/stepper/index.ts",
    "steps/index": "src/steps/index.ts",
    "style-class/index": "src/style-class/index.ts",
    "tabs/index": "src/tabs/index.ts",
    "tag/index": "src/tag/index.ts",
    "terminal/index": "src/terminal/index.ts",
    "textarea/index": "src/textarea/index.ts",
    "tiered-menu/index": "src/tiered-menu/index.ts",
    "timeline/index": "src/timeline/index.ts",
    "toast/index": "src/toast/index.ts",
    "toggle-button/index": "src/toggle-button/index.ts",
    "toggle-switch/index": "src/toggle-switch/index.ts",
    "toolbar/index": "src/toolbar/index.ts",
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
