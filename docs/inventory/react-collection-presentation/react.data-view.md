# React UDataView

ID: react.data-view

Framework: react; availability: public

## Authored interpretation

Present a collection through a caller-supplied item renderer in list or grid layout, with optional paging, sorting, lazy-load notification, loading and empty states.

## Framework surface

UDataView<T = unknown> renders UDataViewProps<T>: value, itemTemplate (item, layout) => React.ReactNode, layout list|grid (default list), paginator, first, rows, totalRecords, rowsPerPageOptions, paginatorPosition top|bottom|both (default bottom), alwaysShowPaginator (default true), currentPageReportTemplate (default "{first} to {last} of {totalRecords}" with {currentPage}, {totalPages} and {rows} also substituted), sortField, sortOrder 1|-1, lazy, loading, loadingIcon (default "Loading", rendered in a span with role status), emptyMessage (default "No results found"), dataKey, trackBy, onPageChange (PaginatorPageChangeEvent), onLazyLoad ({first, rows, sortField, sortOrder}, fired from an effect when lazy) and className. Non-lazy data is sorted by sortField via the non-exported helpers field() and compare() and sliced by first/rows when paginator is on; lazy data is passed through and the record count falls back to value length. Grid renders div role list/listitem, list renders ul/li, and an empty collection renders emptyMessage. It composes UPaginator from ../paginator/paginator (identity owned by #132) and a rows-per-page select plus an aria-live page report. It declares no filter. dataViewStyleModule is the local StyleModule using useComponentBase with componentName data-view. The root barrel and the family subpath expose the same named surface; declared dist paths do not establish publication. The style module is a source-only local StyleModule exported from its style file and not from the family barrel. No component-metadata record or @ultimate/uix-styles entry exists for this family in this revision. The Aura preset registration does not prove rendered appearance. Prime references in source are neutral provenance context.

## Public exports

@ultimate/react#UDataView
@ultimate/react/data-view#UDataView
@ultimate/react#UDataViewProps
@ultimate/react/data-view#UDataViewProps

## Owned source and evidence

packages/react/src/data-view/data-view-style.ts
packages/react/src/data-view/data-view.tsx
packages/react/src/data-view/index.ts

```text
packages/react/src/data-view/index.ts: export * from "./data-view";
packages/react/src/data-view/data-view.tsx: componentName: "data-view"
packages/react/src/index.ts: export * from "./data-view";
packages/react/package.json: "./data-view": {
packages/react/src/data-view/data-view-style.ts: export const dataViewStyleModule
packages/react/src/data-view/data-view.tsx: export function UDataView
packages/react-core/src/base/component-base.ts: import { useComponentStyle } from "../styling/use-component-style";
packages/themes/src/presets/aura/index.ts: dataview: dataView,
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
packages/react/src/data-view/data-view.tsx: import { UPaginator, type PaginatorPageChangeEvent } from "../paginator/paginator";
```

## Relationships

package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.react.paginator (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Inspected component, types, owned composition and local style sources exist. Source interpretation and supporting spec presence are not passing runtime verification."
  },
  {
    "state": "verified",
    "behavior": "Existing scoped React product specifications passed: 5 test files and 63 tests (data-view 10).",
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
