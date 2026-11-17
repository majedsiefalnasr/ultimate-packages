# React UPickList

ID: react.pick-list

Framework: react; availability: public

## Authored interpretation

Dual-list transfer control that moves items between a source and a target list with per-side reordering, optional filtering and optional drag-and-drop.

## Framework surface

UPickList<T = unknown> renders UPickListProps<T>: source, target, onSourceChange, onTargetChange, itemTemplate (item) => React.ReactNode, showSourceFilter and showTargetFilter (default true), showSourceControls and showTargetControls (default true), sourceHeader (default Source) and targetHeader (default Target), sourceStyle, targetStyle, dataKey, filter, filterBy, filterMatchMode, filterLocale, dragdrop, metaKeySelection, breakpoint (default 960px) and className. MatchMode, Direction and Side are non-exported types; field() and matches() are non-exported helpers where matches takes a string query and the in mode splits it on commas. Four transfer buttons (To Target, All To Target, To Source, All To Source) call transfer(), which emits both sides and clears selection; each side has Move up/top/down/bottom controls that emit that side's reordered array. Each side is a ul with role listbox and li role option; selection is internal, with metaKeySelection reducing plain clicks to one item unless ctrl or meta is held; keyboard supports Enter/Space, arrows and Home/End; dragdrop reorders within a side or moves across sides. Filter inputs are type search with aria-label Filter source or Filter target. A useId-keyed style element writes a responsive rule from breakpoint. It implements its own list markup and does not import UListbox. pickListStyleModule is the local StyleModule using useComponentBase with componentName pick-list. The root barrel and the family subpath expose the same named surface; declared dist paths do not establish publication. The style module is a source-only local StyleModule exported from its style file and not from the family barrel. No component-metadata record or @ultimate/uix-styles entry exists for this family in this revision. The Aura preset registration does not prove rendered appearance. Prime references in source are neutral provenance context.

## Public exports

@ultimate/react#UPickList
@ultimate/react/pick-list#UPickList
@ultimate/react#UPickListProps
@ultimate/react/pick-list#UPickListProps

## Owned source and evidence

packages/react/src/pick-list/pick-list-style.ts
packages/react/src/pick-list/pick-list.tsx
packages/react/src/pick-list/index.ts

```text
packages/react/src/pick-list/index.ts: export * from "./pick-list";
packages/react/src/pick-list/pick-list.tsx: componentName: "pick-list"
packages/react/src/index.ts: export * from "./pick-list";
packages/react/package.json: "./pick-list": {
packages/react/src/pick-list/pick-list-style.ts: export const pickListStyleModule
packages/react/src/pick-list/pick-list.tsx: export function UPickList
packages/react-core/src/base/component-base.ts: import { useComponentStyle } from "../styling/use-component-style";
packages/themes/src/presets/aura/index.ts: picklist: pickList,
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
    "behavior": "Existing scoped React product specifications passed: 5 test files and 63 tests (pick-list 30).",
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
