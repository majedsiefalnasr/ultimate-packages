# React UDataScroller

ID: react.data-scroller

Framework: react; availability: public

## Authored interpretation

Load and render an accumulating sequence of data items.

## Framework surface

UDataScrollerProps<T> exposes value, rows, inline, lazy, loader, buffer, scrollHeight, header, footer, itemTemplate, emptyMessage, onLazyLoad and className. UDataScrollerRef exposes load and reset, and UDataScrollerLazyLoadEvent supplies first and rows. UDataScroller loads an accumulating slice, or delegates lazy loading through the callback; loader disables its scroll listener. It does not compose UScroller. dataScrollerStyleModule supplies local CSS and classes. dataScrollerStyleModule is a source-only adapter, not a public barrel export. The family uses useComponentBase from react-core/base, whose implementation calls useComponentStyle from react-core/styling. No separate base class, props factory, directive, context/provider or exported hook exists under this family root. Root @ultimate/react and secondary @ultimate/react/data-scroller expose the same named barrel surface; declared dist artifacts do not prove publication. Aura has no matching family registration at this revision. No dedicated component-metadata record exists for this family at the inspected revision. Prime mentions in source comments are provenance context only; no parity or gap judgment is made.

## Public exports

@ultimate/react#UDataScroller
@ultimate/react/data-scroller#UDataScroller
@ultimate/react#UDataScrollerProps
@ultimate/react/data-scroller#UDataScrollerProps
@ultimate/react#UDataScrollerRef
@ultimate/react/data-scroller#UDataScrollerRef
@ultimate/react#UDataScrollerLazyLoadEvent
@ultimate/react/data-scroller#UDataScrollerLazyLoadEvent

## Owned source and evidence

packages/react/src/data-scroller/data-scroller-style.ts
packages/react/src/data-scroller/data-scroller.tsx
packages/react/src/data-scroller/index.ts

```text
packages/react/src/data-scroller/index.ts: export { UDataScroller } from "./data-scroller";
packages/react/src/data-scroller/data-scroller.tsx: componentName: "data-scroller"
packages/react/src/index.ts: export * from "./data-scroller";
packages/react/package.json: "./data-scroller": {
packages/react-core/src/base/component-base.ts: import { useComponentStyle } from "../styling/use-component-style";
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
```

## Relationships

package.ultimate.react.data-scroller → [react.data-scroller](react.data-scroller.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)

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
