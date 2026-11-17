# React USplitter

ID: react.splitter

Framework: react; availability: public

## Authored interpretation

Arrange configured content panels and resize adjacent panels with mouse, touch or keyboard gutters.

## Framework surface

USplitter and USplitterProps expose panels:USplitterPanelConfig[], layout horizontal|vertical (default horizontal), gutterSize (4 pixels), step (5), onResizeStart, onResizeEnd and className. USplitterPanelConfig contains content:React.ReactNode and optional minSize percentage; USplitterResizeEvent contains originalEvent:Event and sizes:number[]. It initializes equal panelSizes once from panels and uses config-driven panel content, not a public USplitterPanel component. Private pointFrom reads mouse coordinates or changedTouches[0]. Drag starts capture root dimensions and neighbouring sizes; document mousemove/mouseup and touchmove/touchend update percentage sizes with minSize guards and emit resize-end. Keyboard Left/Right steps horizontal sizes; Down decreases and Up increases the preceding vertical panel; repeat runs every 40ms until keyup, which emits resize-end. Each repeated keyboard step also emits resize-start. Panels are keyed by index and use flexBasis calc with gutter subtraction. Focusable gutter handles have role separator, aria-orientation from layout and aria-valuenow. No persistence or exported gutter component is declared. splitterStyleModule is a source-only local {css, classes} object consumed by useComponentBase with componentName splitter; it is exported from the style file but not the family barrel. No family @ultimate/uix-styles entry or component-metadata record exists in this revision. Each family barrel explicitly exports the component and public types; root and family subpath expose the same named surface. Declared dist paths do not establish publication. Aura preset registration does not prove rendered appearance. Prime references in source are neutral provenance context. Props are explicitly declared; no arbitrary native-attribute spread is implemented.

## Public exports

@ultimate/react#USplitter
@ultimate/react/splitter#USplitter
@ultimate/react#USplitterProps
@ultimate/react/splitter#USplitterProps
@ultimate/react#USplitterPanelConfig
@ultimate/react/splitter#USplitterPanelConfig
@ultimate/react#USplitterResizeEvent
@ultimate/react/splitter#USplitterResizeEvent

## Owned source and evidence

packages/react/src/splitter/splitter-style.ts
packages/react/src/splitter/splitter.tsx
packages/react/src/splitter/index.ts

```text
packages/react/src/splitter/index.ts: export { USplitter } from "./splitter";
packages/react/src/splitter/splitter.tsx: componentName: "splitter"
packages/react/src/index.ts: export * from "./splitter";
packages/react/package.json: "./splitter": {
packages/react/src/splitter/splitter-style.ts: export const splitterStyleModule
packages/react-core/src/base/component-base.ts: import { useComponentStyle } from "../styling/use-component-style";
packages/themes/src/presets/aura/index.ts:     splitter,
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
packages/react/src/splitter/splitter.tsx: panels.map(() => 100 / panels.length)
packages/react/src/splitter/splitter.tsx: repeatTimerRef.current = setInterval(repeat, 40);
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
    "behavior": "Existing scoped React product specifications passed; this family contributed 7 tests to the captured run.",
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
