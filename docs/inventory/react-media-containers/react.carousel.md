# React UCarousel

ID: react.carousel

Framework: react; availability: public

## Authored interpretation

Slide a caller-rendered collection through a horizontal or vertical viewport with page navigation, indicators and optional autoplay.

## Framework surface

UCarousel<T> and UCarouselProps<T> expose required value and itemTemplate(item, index) => React.ReactNode; numVisible (default 1), numScroll (1), circular (false), showIndicators (true), showNavigators (true), autoplayInterval (0), orientation horizontal|vertical (horizontal), page, onPageChange and className. UCarouselPageEvent contains page:number. page is controlled when defined; otherwise internal state starts at zero. totalPages uses Math.ceil((value.length - numVisible) / numScroll) + 1 for nonempty value; no normalization of sizing props is applied. goToPage rejects out-of-range or unchanged pages and emits {page}. Previous/Next buttons wrap only when circular; autoplay wraps to zero regardless of circular. A translate3d transform shifts the entire item list by page*numScroll*(100/numVisible), with a 500ms CSS transform transition. Every item is rendered and keyed by index, receives role group and aria-hidden based on the visible window. The outer div has role region; content aria-live is polite during autoplay and off otherwise; indicator buttons expose Page N and aria-current. There are no exported composition components. carouselStyleModule is a source-only local {css, classes} object consumed by useComponentBase with componentName carousel; it is exported from the style file but not the family barrel. No family @ultimate/uix-styles entry or component-metadata record exists in this revision. Each family barrel explicitly exports the component and public types; root and family subpath expose the same named surface. Declared dist paths do not establish publication. Aura preset registration does not prove rendered appearance. Prime references in source are neutral provenance context. Props are explicitly declared; no arbitrary native-attribute spread is implemented.

## Public exports

@ultimate/react#UCarousel
@ultimate/react/carousel#UCarousel
@ultimate/react#UCarouselProps
@ultimate/react/carousel#UCarouselProps
@ultimate/react#UCarouselPageEvent
@ultimate/react/carousel#UCarouselPageEvent

## Owned source and evidence

packages/react/src/carousel/carousel-style.ts
packages/react/src/carousel/carousel.tsx
packages/react/src/carousel/index.ts

```text
packages/react/src/carousel/index.ts: export { UCarousel } from "./carousel";
packages/react/src/carousel/carousel.tsx: componentName: "carousel"
packages/react/src/index.ts: export * from "./carousel";
packages/react/package.json: "./carousel": {
packages/react/src/carousel/carousel-style.ts: export const carouselStyleModule
packages/react-core/src/base/component-base.ts: import { useComponentStyle } from "../styling/use-component-style";
packages/themes/src/presets/aura/index.ts:     carousel,
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
packages/react/src/carousel/carousel.tsx: Math.ceil((value.length - numVisible) / numScroll) + 1
packages/react/src/carousel/carousel.tsx: const next = page >= totalPages - 1 ? 0 : page + 1;
```

## Relationships

package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Inspected component, public types, owned composition and local style sources exist. Source interpretation and supporting spec presence are not passing runtime verification."
  },
  {
    "state": "verified",
    "behavior": "Existing scoped React product specifications passed; this family contributed 9 tests to the captured run.",
    "command": "NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/react exec vitest run src/carousel/ src/galleria/ src/image/ src/card/ src/panel/ src/fieldset/ src/splitter/ src/divider/ src/scroll-panel/ --config /private/tmp/claude-501/ult-wt/react138-vitest.config.mjs --maxWorkers=1 --no-file-parallelism",
    "revision": "cc6e7ab39f0a963bbfddc0dd6a181dc3c6feffc6",
    "outcome": "passed",
    "output": "Vitest 2.1.9, Node v24.15.0: Test Files 9 passed (9); Tests 75 passed (75): galleria 22, carousel 9, image 8, fieldset 7, panel 7, splitter 7, scroll-panel 6, card 5, divider 4. Carousel emitted React act(...) warnings.",
    "limitations": "Temporary config /private/tmp/claude-501/ult-wt/react138-vitest.config.mjs was outside tracked files and removed after the run. It set css.postcss.plugins=[] to bypass host ancestor /Users/majedsiefalnasr/postcss.config.mjs requiring missing postcss-import, with jsdom, globals:true and the absolute main-checkout vitest.setup.ts path. PostCSS plugin processing was not exercised. Workspace dependencies were already built. Local jsdom unit tests only; not browser, accessibility, visual, Storybook, publication or remote CI evidence.",
    "run": "docs/inventory/react-media-containers/product-run.json"
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking @ultimate/react vitest run. Workflow configuration only, not an observed successful CI execution or branch-protection claim. test:scripts is provenance-only and does not include inventory tests.",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on scope != docs and !cancelled(); upstream dependencies may prevent execution. No remote CI observed."
  }
]
```
