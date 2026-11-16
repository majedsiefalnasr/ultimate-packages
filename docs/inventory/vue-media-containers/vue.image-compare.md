# Vue UImageCompare

ID: vue.image-compare

Framework: vue; availability: public

## Authored interpretation

Two slotted images compared with a range-controlled clipping boundary.

## Framework surface

UImageCompare and createBaseImageCompare are public; source-only imageCompareStyleModule. Props tabindex (0), ariaLabelledby and ariaLabel (null). Slots left and right; no own emits or model binding. A range input from 0 to 100 starts at 50. onSlide writes right.style.clipPath directly with a left-to-right polygon. The local stylesheet starts from imagecompare.scope.x (fallback 50%) and includes an RTL selector; user input applies an inline clip path. The SFC has inheritAttrs:false and extends its family base factory, which extends createBaseComponent from @ultimate/vue-core. Both the component and base factory are public at the package root and family subpath; declared dist paths do not establish publication. The local style module exports css/classes from its source file but is not barrel-exported. No component-metadata record or @ultimate/uix-styles entry exists for this family at this revision. Aura preset registration is a source relationship, not rendered appearance evidence. Prime references are neutral provenance context.

## Public exports

@ultimate/vue#UImageCompare
@ultimate/vue#createBaseImageCompare
@ultimate/vue/image-compare#UImageCompare
@ultimate/vue/image-compare#createBaseImageCompare

## Owned source and evidence

packages/vue/src/image-compare/BaseImageCompare.ts
packages/vue/src/image-compare/ImageCompare.vue
packages/vue/src/image-compare/image-compare-style.ts
packages/vue/src/image-compare/index.ts

```text
packages/vue/src/image-compare/ImageCompare.vue: name: "UImageCompare"
packages/vue/src/image-compare/BaseImageCompare.ts: createBaseImageCompare
packages/vue/src/image-compare/image-compare-style.ts: export const imageCompareStyleModule
packages/vue/src/image-compare/index.ts: export { createBaseImageCompare } from "./BaseImageCompare";
packages/vue/src/index.ts: export * from "./image-compare";
packages/vue/package.json: "./image-compare": {
packages/vue/tsup.config.ts: "image-compare/index"
packages/themes/src/presets/aura/index.ts: imagecompare: imageCompare,
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
packages/vue/src/image-compare/ImageCompare.vue: this.$refs.right.style.clipPath
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
