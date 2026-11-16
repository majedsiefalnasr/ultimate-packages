# Vue UGalleria

ID: vue.galleria

Framework: vue; availability: public

## Authored interpretation

Media gallery with thumbnails, item navigation, autoplay and optional fullscreen overlay.

## Framework surface

UGalleria and createBaseGalleria are public; source-only galleriaStyleModule. Props value ([]), activeIndex (0), showItemNavigators and showThumbnails (true), circular (false), autoplayInterval (0), fullScreen and fullScreenActive (false). Emits update:activeIndex and update:fullScreenActive. Internal UGalleriaContent (GalleriaContent.vue, not barrel-exported) owns props value, activeIndex, activeItem, showItemNavigators, showThumbnails, isForwardDisabled, isBackwardDisabled and cx; emits navForward, navBackward, goTo and escape. Forwarded item and thumbnail slots receive {item}; thumbnails fall back to rendering the item slot with the same item. The internal component handles Left/Right/Home/End/Escape except editable descendants, with Enter/Space on thumbnails. openFullScreen() and closeFullScreen() control the portal dialog; focusTrapDirective and TimesIcon come from @ultimate/vue-core. fullScreenActive is watched; activeIndex is copied initially without a prop watcher. Autoplay starts on mount and stops on previous/next navigation and unmount; thumbnail and Home/End goTo navigation leave it running. Autoplay wraps regardless of circular and has no interval prop watcher. The local mask style uses z-index 1100. The SFC has inheritAttrs:false and extends its family base factory, which extends createBaseComponent from @ultimate/vue-core. Both the component and base factory are public at the package root and family subpath; declared dist paths do not establish publication. The local style module exports css/classes from its source file but is not barrel-exported. No component-metadata record or @ultimate/uix-styles entry exists for this family at this revision. Aura preset registration is a source relationship, not rendered appearance evidence. Prime references are neutral provenance context.

## Public exports

@ultimate/vue#UGalleria
@ultimate/vue#createBaseGalleria
@ultimate/vue/galleria#UGalleria
@ultimate/vue/galleria#createBaseGalleria

## Owned source and evidence

packages/vue/src/galleria/BaseGalleria.ts
packages/vue/src/galleria/Galleria.vue
packages/vue/src/galleria/GalleriaContent.vue
packages/vue/src/galleria/galleria-style.ts
packages/vue/src/galleria/index.ts

```text
packages/vue/src/galleria/Galleria.vue: name: "UGalleria"
packages/vue/src/galleria/BaseGalleria.ts: createBaseGalleria
packages/vue/src/galleria/galleria-style.ts: export const galleriaStyleModule
packages/vue/src/galleria/index.ts: export { createBaseGalleria } from "./BaseGalleria";
packages/vue/src/index.ts: export * from "./galleria";
packages/vue/package.json: "./galleria": {
packages/vue/tsup.config.ts: "galleria/index"
packages/themes/src/presets/aura/index.ts: galleria,
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
packages/vue/src/galleria/GalleriaContent.vue: <slot name="thumbnail" :item="item">
```

## Relationships

package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.vue-core.icons (pending cross-batch)
package.ultimate.vue-core.overlay (pending cross-batch)
package.ultimate.vue-core.focus-trap (pending cross-batch)

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
