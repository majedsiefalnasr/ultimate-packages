# Vue UDataView

ID: vue.data-view

Framework: vue; availability: public

## Authored interpretation

Present a collection in list or grid layout with optional paging, sorting, lazy-load notification, loading and empty states.

## Framework surface

UDataView (public component) and source-only createBaseDataView (componentName dataview); source-only dataViewStyleModule. Props: value, layout list|grid (default list), paginator, first, rows, totalRecords, rowsPerPageOptions, paginatorPosition (default bottom), alwaysShowPaginator (default true), currentPageReportTemplate (default "{first} to {last} of {totalRecords}" with {currentPage}, {totalPages} and {rows} also substituted), sortField, sortOrder, lazy, loading, loadingIcon (default class u-loading-icon on a span with role status, alongside USpinnerIcon from @ultimate/vue-core), emptyMessage (default "No results found"), dataKey, trackBy and itemTemplate (item, layout) => string. Emits page, lazy-load, update:first and update:rows. Non-exported helpers field(), compare() and pageNumber() sort and page non-lazy data; when lazy is true, lazy-load is emitted on mount and when first, rows, sortField, sortOrder or lazy change, with {first, rows, sortField, sortOrder}. Scoped slots grid and list receive {items}; default items render as div role listitem with text interpolation of itemTemplate. It composes the Paginator SFC from ../paginator/Paginator.vue (identity owned by #133) and a rows-per-page select labelled Rows per page, plus an aria-live page report. It declares no filter. The SFC extends its base factory from the family Base file, which is source-only and not exported from the family barrel; the factory extends createBaseComponent from @ultimate/vue-core. The barrel exposes only the component at the root and at the family subpath, and declared dist paths do not establish publication. The style module is source-only: exported from its style file, not from the family barrel. No component-metadata record or @ultimate/uix-styles entry exists for this family in this revision. The Aura preset registration does not prove rendered appearance. Prime references in source are neutral provenance context.

## Public exports

@ultimate/vue#UDataView
@ultimate/vue/data-view#UDataView

## Owned source and evidence

packages/vue/src/data-view/DataView.vue
packages/vue/src/data-view/BaseDataView.ts
packages/vue/src/data-view/data-view-style.ts
packages/vue/src/data-view/index.ts

```text
packages/vue/src/data-view/DataView.vue: name: "UDataView"
packages/vue/src/data-view/BaseDataView.ts: createBaseDataView
packages/vue/src/data-view/data-view-style.ts: export const dataViewStyleModule
packages/vue/src/data-view/index.ts: export { default as UDataView } from "./DataView.vue";
packages/vue/src/index.ts: export * from "./data-view";
packages/vue/package.json: "./data-view": {
packages/vue/tsup.config.ts: "data-view/index"
packages/themes/src/presets/aura/index.ts: dataview: dataView,
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
packages/vue/src/data-view/DataView.vue: import Paginator from "../paginator/Paginator.vue";
packages/vue/src/data-view/DataView.vue: import { SpinnerIcon as USpinnerIcon } from "@ultimate/vue-core";
packages/vue/src/data-view/DataView.vue: "lazy-load"
```

## Relationships

package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.vue.paginator (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "The SFC, base factory and local style module exist in source; implementation evidence alone is not a passing behavior check."
  },
  {
    "state": "verified",
    "behavior": "Existing scoped Vue product specifications passed: 5 test files and 52 tests (data-view 6).",
    "run": "docs/inventory/vue-collection-presentation/product-run.json",
    "command": "NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/vue exec vitest run src/data-view src/order-list src/organization-chart src/pick-list src/timeline --config ../../scripts/inventory/vue-disclosure-vitest.config.mjs --maxWorkers=1 --no-file-parallelism",
    "revision": "3864a1d23b5ef0c5601ff740c104fdec4584d14d",
    "outcome": "passed",
    "output": "Vitest 2.1.9, Node v24.15.0: Test Files 5 passed (5); Tests 52 passed (52): pick-list 22, order-list 14, data-view 6, organization-chart 5, timeline 5.",
    "limitations": "The repository config scripts/inventory/vue-disclosure-vitest.config.mjs extends the Vue package config with css.postcss.plugins=[] to bypass the host ancestor /Users/majedsiefalnasr/postcss.config.mjs requiring missing postcss-import; PostCSS processing was not exercised. Workspace dependencies were already built. Local jsdom unit tests only; not browser, accessibility, visual, Storybook, publication or remote CI evidence."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured conditional non-docs CI Test step runs root pnpm run test, which invokes the Vue test script; this describes workflow configuration, not a successful run or branch protection. The scoped inventory Node tests are not included in test:scripts.",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on scope != docs and !cancelled(); earlier steps can prevent execution. No remote CI run observed."
  }
]
```
