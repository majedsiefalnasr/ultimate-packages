# React UTimeline

ID: react.timeline

Framework: react; availability: public

## Authored interpretation

Display-only chain of events with a marker, connector and optional opposite and content slots in vertical or horizontal layout.

## Framework surface

UTimeline<T = unknown> renders UTimelineProps<T>: value, align left|right|top|bottom (default left), layout vertical|horizontal (default vertical), render-prop slots content, opposite and marker (each (item) => React.ReactNode) and className. Each event renders opposite, separator and content regions; the separator uses the marker render prop or a default marker div and adds a connector for every event except the last; events are keyed by index. The root class comes from cx("root", { layout, align }) but timelineStyleModule, a local {css, classes} object, reads only layout; align is accepted without a style branch. The style file records that no @ultimate/uix-styles/timeline entry exists and cites the same local precedent as messageStyleModule. UTimelineProps is exported as a type from the family index. UTimeline uses useComponentBase with componentName timeline. The root barrel and the ./timeline subpath expose the same named surface; declared dist paths do not establish publication. No component-metadata record exists for this family in this revision. The Aura preset registration does not prove rendered appearance. Prime references in source are neutral provenance context.

## Public exports

@ultimate/react#UTimeline
@ultimate/react/timeline#UTimeline
@ultimate/react#UTimelineProps
@ultimate/react/timeline#UTimelineProps

## Owned source and evidence

packages/react/src/timeline/timeline-style.ts
packages/react/src/timeline/timeline.tsx
packages/react/src/timeline/index.ts

```text
packages/react/src/timeline/index.ts: export { UTimeline } from "./timeline";
packages/react/src/timeline/timeline.tsx: componentName: "timeline"
packages/react/src/index.ts: export * from "./timeline";
packages/react/package.json: "./timeline": {
packages/react/src/timeline/timeline-style.ts: export const timelineStyleModule
packages/react/src/timeline/timeline.tsx: export function UTimeline
packages/react-core/src/base/component-base.ts: import { useComponentStyle } from "../styling/use-component-style";
packages/themes/src/presets/aura/index.ts:     timeline,
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
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
    "behavior": "Inspected component, types, owned composition and local style sources exist. Source interpretation and supporting spec presence are not passing runtime verification."
  },
  {
    "state": "verified",
    "behavior": "Existing scoped React product specifications passed: 5 test files and 63 tests (timeline 5).",
    "command": "NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/react exec vitest run src/data-view src/order-list src/organization-chart src/pick-list src/timeline --config vitest-react135.tmp.config.mjs --maxWorkers=1 --no-file-parallelism",
    "revision": "3864a1d23b5ef0c5601ff740c104fdec4584d14d",
    "outcome": "passed",
    "output": "Vitest 2.1.9, Node v24.15.0: Test Files 5 passed (5); Tests 63 passed (63): pick-list 30, order-list 13, data-view 10, organization-chart 5, timeline 5.",
    "limitations": "Temporary config vitest-react135.tmp.config.mjs (copied into packages/react for the run, then removed; not committed) set css.postcss.plugins=[] to bypass host ancestor /Users/majedsiefalnasr/postcss.config.mjs requiring missing postcss-import; PostCSS processing was not exercised. Workspace dependencies were already built. Local jsdom unit tests only; not browser, accessibility, visual, Storybook, publication or remote CI evidence.",
    "run": "docs/inventory/react-collection-presentation/product-run.json"
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking @ultimate/react vitest run. Workflow configuration only, not an observed successful CI execution or branch-protection claim. test:scripts is provenance-only and does not include inventory tests.",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on scope != docs and !cancelled(); upstream dependencies may prevent execution. No remote CI observed."
  }
]
```
