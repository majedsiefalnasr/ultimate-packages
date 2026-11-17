# React UFieldset

ID: react.fieldset

Framework: react; availability: public

## Authored interpretation

Group child content with a legend and optional expand/collapse control.

## Framework surface

UFieldset is React.forwardRef<HTMLFieldSetElement, UFieldsetProps>. UFieldsetProps exposes legend and children React nodes, toggleable (default false), collapsed (false), onToggle({originalEvent:React.SyntheticEvent, value:boolean}) and className. Supplying onToggle makes collapse controlled; otherwise collapsedState initializes from collapsed. Non-toggleable forces collapsed false. Private module uid generates header/content IDs. A native fieldset/legend contains either a legend label or a button with +/− text glyphs, aria-controls and aria-expanded. Its key handler handles Enter, NumpadEnter and Space; toggle prevents the event default. Content is conditionally unmounted when collapsed and has role region and aria-labelledby headerId; that header ID is assigned only to the toggle button. The non-toggleable branch has no element with headerId although its content still references it. There are no exported legend or toggle components. fieldsetStyleModule is a source-only local {css, classes} object consumed by useComponentBase with componentName fieldset; it is exported from the style file but not the family barrel. No family @ultimate/uix-styles entry or component-metadata record exists in this revision. Each family barrel explicitly exports the component and public types; root and family subpath expose the same named surface. Declared dist paths do not establish publication. Aura preset registration does not prove rendered appearance. Prime references in source are neutral provenance context. Props are explicitly declared; no arbitrary native-attribute spread is implemented.

## Public exports

@ultimate/react#UFieldset
@ultimate/react/fieldset#UFieldset
@ultimate/react#UFieldsetProps
@ultimate/react/fieldset#UFieldsetProps

## Owned source and evidence

packages/react/src/fieldset/fieldset-style.ts
packages/react/src/fieldset/fieldset.tsx
packages/react/src/fieldset/index.ts

```text
packages/react/src/fieldset/index.ts: export { UFieldset } from "./fieldset";
packages/react/src/fieldset/fieldset.tsx: componentName: "fieldset"
packages/react/src/index.ts: export * from "./fieldset";
packages/react/package.json: "./fieldset": {
packages/react/src/fieldset/fieldset-style.ts: export const fieldsetStyleModule
packages/react-core/src/base/component-base.ts: import { useComponentStyle } from "../styling/use-component-style";
packages/themes/src/presets/aura/index.ts:     fieldset,
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
packages/react/src/fieldset/fieldset.tsx: const collapsed = toggleable ? (onToggle ? collapsedProp : collapsedState) : false;
packages/react/src/fieldset/fieldset.tsx: aria-labelledby={headerId}
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
