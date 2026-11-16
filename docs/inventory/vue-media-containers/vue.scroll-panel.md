# Vue UScrollPanel

ID: vue.scroll-panel

Framework: vue; availability: public

## Authored interpretation

Scrollable content container with custom scrollbar thumbs and keyboard controls.

## Framework surface

UScrollPanel and createBaseScrollPanel are public; source-only scrollPanelStyleModule. Prop step (5); default slot, no own emits. Native content scrolling drives horizontal and vertical custom scrollbar thumbs with aria-valuenow and aria-controls. contentId is generated for those controls but is not bound as the content div id. lastScrollLeft/lastScrollTop drive reactive values; requestAnimationFrame positions thumbs with a minimum size of 10%. Mouse drag uses document listeners. Keyboard setTimer schedules one setTimeout at 40ms rather than a repeating interval. scrollTop(value) clamps vertical position and refresh() calls moveBar. Unmount removes window/document listeners and cancels the tracked frame/timer. Local CSS includes scrollpanel.barfocus.ring.width and scrollpanel.barfocus.ring.offset tokens. The SFC has inheritAttrs:false and extends its family base factory, which extends createBaseComponent from @ultimate/vue-core. Both the component and base factory are public at the package root and family subpath; declared dist paths do not establish publication. The local style module exports css/classes from its source file but is not barrel-exported. No component-metadata record or @ultimate/uix-styles entry exists for this family at this revision. Aura preset registration is a source relationship, not rendered appearance evidence. Prime references are neutral provenance context.

## Public exports

@ultimate/vue#UScrollPanel
@ultimate/vue#createBaseScrollPanel
@ultimate/vue/scroll-panel#UScrollPanel
@ultimate/vue/scroll-panel#createBaseScrollPanel

## Owned source and evidence

packages/vue/src/scroll-panel/BaseScrollPanel.ts
packages/vue/src/scroll-panel/ScrollPanel.vue
packages/vue/src/scroll-panel/index.ts
packages/vue/src/scroll-panel/scroll-panel-style.ts

```text
packages/vue/src/scroll-panel/ScrollPanel.vue: name: "UScrollPanel"
packages/vue/src/scroll-panel/BaseScrollPanel.ts: createBaseScrollPanel
packages/vue/src/scroll-panel/scroll-panel-style.ts: export const scrollPanelStyleModule
packages/vue/src/scroll-panel/index.ts: export { createBaseScrollPanel } from "./BaseScrollPanel";
packages/vue/src/index.ts: export * from "./scroll-panel";
packages/vue/package.json: "./scroll-panel": {
packages/vue/tsup.config.ts: "scroll-panel/index"
packages/themes/src/presets/aura/index.ts: scrollpanel: scrollPanel,
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
packages/vue/src/scroll-panel/ScrollPanel.vue: this.timer = setTimeout(() => this.repeat(bar, step), 40);
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
