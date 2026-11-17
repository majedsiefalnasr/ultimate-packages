# Vue UCarousel

ID: vue.carousel

Framework: vue; availability: public

## Authored interpretation

Paged media collection with item slots, navigators, indicators and optional autoplay.

## Framework surface

UCarousel and createBaseCarousel are public; source-only carouselStyleModule. Props value (readonly array, default []), page (0), numVisible (1), numScroll (1), circular (false), showIndicators and showNavigators (true), autoplayInterval (0), orientation (horizontal). Emits update:page(index) and page-change({page:index}); item slot receives {data,index}. Page prop is watched. navBackward()/navForward() stop autoplay; indicator navigation does not. Autoplay wraps at the last page regardless of circular. The translate3d item window uses region/group roles and aria-hidden. Source-only CarouselRootParams {vertical?:boolean} and CarouselIndicatorParams {active?:boolean} are style parameter interfaces. The SFC has inheritAttrs:false and extends its family base factory, which extends createBaseComponent from @ultimate/vue-core. Both the component and base factory are public at the package root and family subpath; declared dist paths do not establish publication. The local style module exports css/classes from its source file but is not barrel-exported. No component-metadata record or @ultimate/uix-styles entry exists for this family at this revision. Aura preset registration is a source relationship, not rendered appearance evidence. Prime references are neutral provenance context.

## Public exports

@ultimate/vue#UCarousel
@ultimate/vue#createBaseCarousel
@ultimate/vue/carousel#UCarousel
@ultimate/vue/carousel#createBaseCarousel

## Owned source and evidence

packages/vue/src/carousel/BaseCarousel.ts
packages/vue/src/carousel/Carousel.vue
packages/vue/src/carousel/carousel-style.ts
packages/vue/src/carousel/index.ts

```text
packages/vue/src/carousel/Carousel.vue: name: "UCarousel"
packages/vue/src/carousel/BaseCarousel.ts: createBaseCarousel
packages/vue/src/carousel/carousel-style.ts: export const carouselStyleModule
packages/vue/src/carousel/index.ts: export { createBaseCarousel } from "./BaseCarousel";
packages/vue/src/index.ts: export * from "./carousel";
packages/vue/package.json: "./carousel": {
packages/vue/tsup.config.ts: "carousel/index"
packages/themes/src/presets/aura/index.ts: carousel,
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
packages/vue/src/carousel/Carousel.vue: navBackward() {
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
