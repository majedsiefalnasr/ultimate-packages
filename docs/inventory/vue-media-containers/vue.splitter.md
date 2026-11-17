# Vue USplitter

ID: vue.splitter

Framework: vue; availability: public

## Authored interpretation

Config-driven resizable panels with mouse, touch and keyboard gutters.

## Framework surface

USplitter and createBaseSplitter are public; source-only splitterStyleModule. Props panels (readonly array, default []), layout (horizontal), gutterSize (4), step (5). Emits resizestart and resizeend with {originalEvent,sizes:[...]}. Default scoped slot receives {item,index}. Panels are configuration objects with minSize; there is no SplitterPanel composition component. Panel sizes initialize equally without a panels watcher; flex basis subtracts total gutter size. Focusable gutter handles have separator role, orientation and value ARIA. Mouse/touch drag uses document listeners and minSize clamping. Horizontal arrows decrement/increment for Left/Right; vertical Down decrements and Up increments. Keyboard resizing starts immediately and repeats with setInterval at 40ms; keyup clears the timer and emits resizeend with a synthetic keyup event. Unmount cleans listeners and timer. The SFC has inheritAttrs:false and extends its family base factory, which extends createBaseComponent from @ultimate/vue-core. Both the component and base factory are public at the package root and family subpath; declared dist paths do not establish publication. The local style module exports css/classes from its source file but is not barrel-exported. No component-metadata record or @ultimate/uix-styles entry exists for this family at this revision. Aura preset registration is a source relationship, not rendered appearance evidence. Prime references are neutral provenance context.

## Public exports

@ultimate/vue#USplitter
@ultimate/vue#createBaseSplitter
@ultimate/vue/splitter#USplitter
@ultimate/vue/splitter#createBaseSplitter

## Owned source and evidence

packages/vue/src/splitter/BaseSplitter.ts
packages/vue/src/splitter/Splitter.vue
packages/vue/src/splitter/index.ts
packages/vue/src/splitter/splitter-style.ts

```text
packages/vue/src/splitter/Splitter.vue: name: "USplitter"
packages/vue/src/splitter/BaseSplitter.ts: createBaseSplitter
packages/vue/src/splitter/splitter-style.ts: export const splitterStyleModule
packages/vue/src/splitter/index.ts: export { createBaseSplitter } from "./BaseSplitter";
packages/vue/src/index.ts: export * from "./splitter";
packages/vue/package.json: "./splitter": {
packages/vue/tsup.config.ts: "splitter/index"
packages/themes/src/presets/aura/index.ts: splitter,
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
packages/vue/src/splitter/Splitter.vue: this.repeatTimer = setInterval(repeat, 40);
```

## Relationships

package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "The SFC, base factory and local style module exist in source; implementation evidence alone is not a passing behavior check."
  },
  {
    "state": "verified",
    "behavior": "Existing scoped Vue product specifications passed: 10 files and 79 tests.",
    "run": "docs/inventory/vue-media-containers/product-run.json",
    "command": "NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/vue exec vitest run src/carousel/ src/galleria/ src/image/ src/image-compare/ src/card/ src/panel/ src/fieldset/ src/splitter/ src/divider/ src/scroll-panel/ --config ../../scripts/inventory/vue-disclosure-vitest.config.mjs --maxWorkers=1 --no-file-parallelism",
    "revision": "cc6e7ab39f0a963bbfddc0dd6a181dc3c6feffc6",
    "outcome": "passed",
    "output": "Vitest 2.1.9, Node v24.15.0: Test Files 10 passed (10); Tests 79 passed (79): galleria 21, carousel 9, image 8, splitter 7, scroll-panel 7, fieldset 7, panel 7, card 5, image-compare 4, divider 4.",
    "limitations": "The repository config scripts/inventory/vue-disclosure-vitest.config.mjs extends the Vue package config with css.postcss.plugins=[] to bypass the host ancestor /Users/majedsiefalnasr/postcss.config.mjs requiring missing postcss-import; PostCSS processing was not exercised. Workspace dependencies were already built. Local jsdom unit tests only; not browser, accessibility, visual, Storybook, publication or remote CI evidence. No warnings were observed."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured conditional non-docs CI Test step runs root pnpm run test, which invokes the Vue test script; this describes workflow configuration, not a successful run or branch protection. The scoped inventory Node tests are not included in test:scripts.",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on scope != docs and !cancelled(); earlier steps can prevent execution. No remote CI run observed."
  }
]
```
