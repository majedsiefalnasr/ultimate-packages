# Vue UImage

ID: vue.image

Framework: vue; availability: public

## Authored interpretation

Image thumbnail with optional preview overlay, rotation and zoom controls.

## Framework surface

UImage and createBaseImage are public; source-only imageStyleModule. Props src, alt, width and height (nullable strings), preview (false). Emits show, hide and imageError; declares no slots. Preview uses a portal dialog with focusTrapDirective, TimesIcon, createGlobalEscapeKeyMixin and createDisplayOrderMixin from @ultimate/vue-core plus ESCAPE_PRIORITIES from @ultimate/uix-utils/escape. Mask click and Escape close it; opening focuses the close button. Rotate controls change by 90 degrees; zoom changes by 0.1 with guards at 0.5 and 1.5. Closing resets rotation and scale. The thumbnail binds alt; the preview image does not. The local mask style uses z-index 1100. The SFC has inheritAttrs:false and extends its family base factory, which extends createBaseComponent from @ultimate/vue-core. Both the component and base factory are public at the package root and family subpath; declared dist paths do not establish publication. The local style module exports css/classes from its source file but is not barrel-exported. No component-metadata record or @ultimate/uix-styles entry exists for this family at this revision. Aura preset registration is a source relationship, not rendered appearance evidence. Prime references are neutral provenance context.

## Public exports

@ultimate/vue#UImage
@ultimate/vue#createBaseImage
@ultimate/vue/image#UImage
@ultimate/vue/image#createBaseImage

## Owned source and evidence

packages/vue/src/image/BaseImage.ts
packages/vue/src/image/Image.vue
packages/vue/src/image/image-style.ts
packages/vue/src/image/index.ts

```text
packages/vue/src/image/Image.vue: name: "UImage"
packages/vue/src/image/BaseImage.ts: createBaseImage
packages/vue/src/image/image-style.ts: export const imageStyleModule
packages/vue/src/image/index.ts: export { createBaseImage } from "./BaseImage";
packages/vue/src/index.ts: export * from "./image";
packages/vue/package.json: "./image": {
packages/vue/tsup.config.ts: "image/index"
packages/themes/src/presets/aura/index.ts: image,
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
packages/vue/src/image/Image.vue: createDisplayOrderMixin,
```

## Relationships

package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.vue-core.icons (pending cross-batch)
package.ultimate.vue-core.overlay (pending cross-batch)
package.ultimate.vue-core.focus-trap (pending cross-batch)
package.ultimate.vue-core.escape (pending cross-batch)
package.ultimate.uix-utils.escape (pending cross-batch)

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
