# React UPaginator

ID: react.paginator

Framework: react; availability: public

## Authored interpretation

Offer controlled page navigation.

## Framework surface

UPaginatorProps requires first, rows, totalRecords and onPageChange; pageLinkSize is optional. PaginatorPageChangeEvent carries page, first, rows and pageCount. UPaginator is controlled and emits changes without owning page state. It renders first, previous, next, last and page controls. getPageCount comes from @ultimate/uix-data; paginatorStyleModule composes @ultimate/uix-styles/paginator. paginatorStyleModule is a source-only adapter, not a public barrel export. The family uses useComponentBase from react-core/base, whose implementation calls useComponentStyle from react-core/styling. No separate base class, props factory, directive, context/provider or exported hook exists under this family root. Root @ultimate/react and secondary @ultimate/react/paginator expose the same named barrel surface; declared dist artifacts do not prove publication. Aura registers paginator; registration is not rendered theme verification. Component metadata references this React source; metadata is not runtime integration. Prime mentions in source comments are provenance context only; no parity or gap judgment is made.

## Public exports

@ultimate/react#UPaginator
@ultimate/react/paginator#UPaginator
@ultimate/react#UPaginatorProps
@ultimate/react/paginator#UPaginatorProps
@ultimate/react#PaginatorPageChangeEvent
@ultimate/react/paginator#PaginatorPageChangeEvent

## Owned source and evidence

packages/react/src/paginator/paginator-style.ts
packages/react/src/paginator/paginator.tsx
packages/react/src/paginator/index.ts

```text
packages/react/src/paginator/index.ts: export { UPaginator } from "./paginator";
packages/react/src/paginator/paginator.tsx: componentName: "paginator"
packages/react/src/index.ts: export * from "./paginator";
packages/react/package.json: "./paginator": {
packages/react-core/src/base/component-base.ts: import { useComponentStyle } from "../styling/use-component-style";
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
packages/component-metadata/src/records/paginator.ts: packages/react/src/paginator/paginator.tsx
packages/themes/src/presets/aura/index.ts:     paginator,
packages/react/src/paginator/paginator.tsx: @ultimate/uix-data
packages/react/src/paginator/paginator-style.ts: @ultimate/uix-styles/paginator
```

## Relationships

package.ultimate.react.paginator → [react.paginator](react.paginator.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.uix-data.root (pending cross-batch)
package.ultimate.uix-styles.paginator (pending cross-batch)
package.ultimate.component-metadata.records (pending cross-batch)
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
    "behavior": "Existing scoped React product specifications passed: 4 test files and 103 tests.",
    "command": "NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/react exec vitest run src/table/ src/paginator/ src/scroller/ src/data-scroller/ --config /tmp/vitest-react132.config.mjs --maxWorkers=1 --no-file-parallelism",
    "revision": "3864a1d23b5ef0c5601ff740c104fdec4584d14d",
    "outcome": "passed",
    "output": "Vitest 2.1.9, Node v24.15.0: Test Files 4 passed (4); Tests 103 passed (103): table 70, paginator 7, scroller 20, data-scroller 6.",
    "limitations": "Temporary config outside the repository set css.postcss.plugins=[] to bypass host ancestor /Users/majedsiefalnasr/postcss.config.mjs requiring missing postcss-import; PostCSS processing was not exercised. Workspace dependencies were built before this run.",
    "run": "docs/inventory/react-table-viewport/product-run.json"
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking @ultimate/react vitest run. Workflow configuration only, not an observed successful CI execution or branch-protection claim. test:scripts is provenance-only and does not include inventory tests.",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on scope != docs and !cancelled(); upstream dependencies may prevent execution. No remote CI observed."
  }
]
```
