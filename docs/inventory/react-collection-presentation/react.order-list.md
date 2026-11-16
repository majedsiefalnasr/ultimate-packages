# React UOrderList

ID: react.order-list

Framework: react; availability: public

## Authored interpretation

Reorderable single list with move up/top/down/bottom controls, optional filtering, multi-selection and optional drag-and-drop.

## Framework surface

UOrderList<T = unknown> renders UOrderListProps<T>: value, onChange (receives a new array), itemTemplate (item) => React.ReactNode, autoOptionFocus (default true), focusOnHover, tabIndex (default 0), listStyle, dataKey, filter, filterBy (comma-separated paths), filterMatchMode, filterLocale, dragdrop, breakpoint (default 960px) and className. The MatchMode union (contains, startsWith, endsWith, equals, notEquals, in, lt, lte, gt, gte), field() and matches() are non-exported module-level helpers. Four buttons labelled Move up, Move top, Move down and Move bottom (data-move attribute) are disabled when nothing is selected; selection is internal state keyed by identity from dataKey or the item itself. up/down shift selected items past unselected neighbours; top/bottom gather the selection before or after the rest. The list is a ul with role listbox and li role option, supports click, Enter/Space, ArrowUp/ArrowDown and Home/End, and with dragdrop uses HTML5 drag events and a drop that reorders and clears selection. The optional filter is an input with role searchbox and aria-label Filter source. A style element generated with React.useId writes a responsive max-width rule from breakpoint. It implements its own list markup and does not import UListbox. orderListStyleModule is the local StyleModule using useComponentBase with componentName order-list. The root barrel and the family subpath expose the same named surface; declared dist paths do not establish publication. The style module is a source-only local StyleModule exported from its style file and not from the family barrel. No component-metadata record or @ultimate/uix-styles entry exists for this family in this revision. The Aura preset registration does not prove rendered appearance. Prime references in source are neutral provenance context.

## Public exports

@ultimate/react#UOrderList
@ultimate/react/order-list#UOrderList
@ultimate/react#UOrderListProps
@ultimate/react/order-list#UOrderListProps

## Owned source and evidence

packages/react/src/order-list/order-list-style.ts
packages/react/src/order-list/order-list.tsx
packages/react/src/order-list/index.ts

```text
packages/react/src/order-list/index.ts: export * from "./order-list";
packages/react/src/order-list/order-list.tsx: componentName: "order-list"
packages/react/src/index.ts: export * from "./order-list";
packages/react/package.json: "./order-list": {
packages/react/src/order-list/order-list-style.ts: export const orderListStyleModule
packages/react/src/order-list/order-list.tsx: export function UOrderList
packages/react-core/src/base/component-base.ts: import { useComponentStyle } from "../styling/use-component-style";
packages/themes/src/presets/aura/index.ts: orderlist: orderList,
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
    "behavior": "Existing scoped React product specifications passed: 5 test files and 63 tests (order-list 13).",
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
