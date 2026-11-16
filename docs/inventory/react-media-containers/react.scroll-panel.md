# React UScrollPanel

ID: react.scroll-panel

Framework: react; availability: public

## Authored interpretation

Wrap native scrolling content with proportional draggable custom scrollbar thumbs and an imperative refresh/scroll API.

## Framework surface

UScrollPanel is React.forwardRef<UScrollPanelHandle, UScrollPanelProps>. UScrollPanelProps exposes step (default 5), className and children. UScrollPanelHandle exposes refresh:() => void and scrollTop:(value:number) => void through useImperativeHandle; scrollTop clamps to the native scrollable height and zero. Private moveBar computes scroll ratios, sizes thumbs with a minimum 10 percent and uses requestAnimationFrame to set positions; ratios >=1 hide the bar. Scroll, resize and mouseenter update bars. Mouse dragging installs document listeners and updates native scroll position using delta/ratio; cleanup removes listeners, cancels a frame and clears the timer. Focus switches keyboard orientation; matching arrows schedule one step with setTimeout(...,40), and keyup clears it. The private repeat function does not reschedule itself. Both bars are focusable role scrollbar elements with aria-orientation, aria-valuenow and aria-controls=contentId. The computed contentId is not assigned as an id to the content div. The stylesheet hides native scrollbars. No touch drag handler, exported thumb component or base factory is declared. scrollPanelStyleModule is a source-only local {css, classes} object consumed by useComponentBase with componentName scroll-panel; it is exported from the style file but not the family barrel. No family @ultimate/uix-styles entry or component-metadata record exists in this revision. Each family barrel explicitly exports the component and public types; root and family subpath expose the same named surface. Declared dist paths do not establish publication. Aura preset registration does not prove rendered appearance. Prime references in source are neutral provenance context. Props are explicitly declared; no arbitrary native-attribute spread is implemented.

## Public exports

@ultimate/react#UScrollPanel
@ultimate/react/scroll-panel#UScrollPanel
@ultimate/react#UScrollPanelProps
@ultimate/react/scroll-panel#UScrollPanelProps
@ultimate/react#UScrollPanelHandle
@ultimate/react/scroll-panel#UScrollPanelHandle

## Owned source and evidence

packages/react/src/scroll-panel/scroll-panel-style.ts
packages/react/src/scroll-panel/scroll-panel.tsx
packages/react/src/scroll-panel/index.ts

```text
packages/react/src/scroll-panel/index.ts: export { UScrollPanel } from "./scroll-panel";
packages/react/src/scroll-panel/scroll-panel.tsx: componentName: "scroll-panel"
packages/react/src/index.ts: export * from "./scroll-panel";
packages/react/package.json: "./scroll-panel": {
packages/react/src/scroll-panel/scroll-panel-style.ts: export const scrollPanelStyleModule
packages/react-core/src/base/component-base.ts: import { useComponentStyle } from "../styling/use-component-style";
packages/themes/src/presets/aura/index.ts: scrollpanel: scrollPanel,
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
packages/react/src/scroll-panel/scroll-panel.tsx: timer.current = setTimeout(() => repeat(bar, stepValue), 40);
packages/react/src/scroll-panel/scroll-panel.tsx: aria-controls={contentId}
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
    "behavior": "Existing scoped React product specifications passed; this family contributed 6 tests to the captured run.",
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
