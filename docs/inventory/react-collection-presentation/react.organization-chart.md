# React UOrganizationChart

ID: react.organization-chart

Framework: react; availability: public

## Authored interpretation

Render a hierarchy of labelled nodes as an expandable tree with optional single or multiple node selection.

## Framework surface

UOrganizationChart renders UOrganizationChartProps: value (OrganizationChartNodeData[]), selectionMode (SelectionMode type imported from @ultimate/uix-data), selection (a node, an array of nodes or null), onSelectionChange and className, inside a div with role tree, aria-label Organization chart and aria-multiselectable for multiple. OrganizationChartNodeData has optional label, className, expanded, selectable and children. The internal non-exported OrganizationChartNode keeps local expanded state initialised from node.expanded, renders role treeitem with aria-expanded and aria-selected, and a toggle button with aria-label "Toggle <label>" showing + or -; children render in a role group. Selection is by node identity: single mode toggles one node or null, multiple mode adds or removes the node in an array; Enter and Space select, nodes with selectable false are skipped, and nodes are keyed by index. organizationChartStyleModule is the local StyleModule using useComponentBase with componentName organization-chart. The root barrel and the family subpath expose the same named surface; declared dist paths do not establish publication. The style module is a source-only local StyleModule exported from its style file and not from the family barrel. No component-metadata record or @ultimate/uix-styles entry exists for this family in this revision; the Aura organization-chart preset is registered through packages/themes/src/presets/aura/organization-chart.ts. The Aura preset registration does not prove rendered appearance. Prime references in source are neutral provenance context.

## Public exports

@ultimate/react#UOrganizationChart
@ultimate/react/organization-chart#UOrganizationChart
@ultimate/react#UOrganizationChartProps
@ultimate/react/organization-chart#UOrganizationChartProps
@ultimate/react#OrganizationChartNodeData
@ultimate/react/organization-chart#OrganizationChartNodeData

## Owned source and evidence

packages/react/src/organization-chart/organization-chart-style.ts
packages/react/src/organization-chart/organization-chart.tsx
packages/react/src/organization-chart/index.ts

```text
packages/react/src/organization-chart/index.ts: export * from "./organization-chart";
packages/react/src/organization-chart/organization-chart.tsx: componentName: "organization-chart"
packages/react/src/index.ts: export * from "./organization-chart";
packages/react/package.json: "./organization-chart": {
packages/react/src/organization-chart/organization-chart-style.ts: export const organizationChartStyleModule
packages/react/src/organization-chart/organization-chart.tsx: export function UOrganizationChart
packages/react-core/src/base/component-base.ts: import { useComponentStyle } from "../styling/use-component-style";
packages/themes/src/presets/aura/index.ts: organizationchart: organizationChart,
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
packages/react/src/organization-chart/organization-chart.tsx: import type { SelectionMode } from "@ultimate/uix-data";
```

## Relationships

package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.uix-data.root (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Inspected component, types, owned composition and local style sources exist. Source interpretation and supporting spec presence are not passing runtime verification."
  },
  {
    "state": "verified",
    "behavior": "Existing scoped React product specifications passed: 5 test files and 63 tests (organization-chart 5).",
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
