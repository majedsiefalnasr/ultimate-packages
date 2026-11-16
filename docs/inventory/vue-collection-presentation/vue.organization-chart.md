# Vue UOrganizationChart

ID: vue.organization-chart

Framework: vue; availability: public

## Authored interpretation

Render a hierarchy of labelled nodes as an expandable tree with optional single or multiple node selection.

## Framework surface

UOrganizationChart (public component) and source-only createBaseOrganizationChart (componentName organizationchart); source-only organizationChartStyleModule. Props: value, selectionKeys (object), selectionMode (SelectionMode type imported from @ultimate/uix-data in the base factory), collapsible and collapsedKeys. Emits update:selectionKeys and update:collapsedKeys. The SFC uses a render function with h(): root role tree with aria-label Organization chart, nodes with role treeitem, aria-expanded and aria-selected, a toggle button with aria-label "Toggle <label>" showing a minus or plus sign, Enter and Space selection, and local collapsedKeys state. The base factory carries GAP-082 eslint-disable comments. The SFC extends its base factory from the family Base file, which is source-only and not exported from the family barrel; the factory extends createBaseComponent from @ultimate/vue-core. The barrel exposes only the component at the root and at the family subpath, and declared dist paths do not establish publication. The style module is source-only: exported from its style file, not from the family barrel. No component-metadata record or @ultimate/uix-styles entry exists for this family in this revision. The Aura preset registration does not prove rendered appearance. Prime references in source are neutral provenance context.

## Public exports

@ultimate/vue#UOrganizationChart
@ultimate/vue/organization-chart#UOrganizationChart

## Owned source and evidence

packages/vue/src/organization-chart/OrganizationChart.vue
packages/vue/src/organization-chart/BaseOrganizationChart.ts
packages/vue/src/organization-chart/organization-chart-style.ts
packages/vue/src/organization-chart/index.ts

```text
packages/vue/src/organization-chart/OrganizationChart.vue: name: "UOrganizationChart"
packages/vue/src/organization-chart/BaseOrganizationChart.ts: createBaseOrganizationChart
packages/vue/src/organization-chart/organization-chart-style.ts: export const organizationChartStyleModule
packages/vue/src/organization-chart/index.ts: export { default as UOrganizationChart } from "./OrganizationChart.vue";
packages/vue/src/index.ts: export * from "./organization-chart";
packages/vue/package.json: "./organization-chart": {
packages/vue/tsup.config.ts: "organization-chart/index"
packages/themes/src/presets/aura/index.ts: organizationchart: organizationChart,
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
packages/vue/src/organization-chart/BaseOrganizationChart.ts: import type { SelectionMode } from "@ultimate/uix-data";
packages/vue/src/organization-chart/OrganizationChart.vue: import { h } from "vue";
packages/vue/src/organization-chart/OrganizationChart.vue: update:selectionKeys
```

## Relationships

package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.uix-data.root (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "The SFC, base factory and local style module exist in source; implementation evidence alone is not a passing behavior check."
  },
  {
    "state": "verified",
    "behavior": "Existing scoped Vue product specifications passed: 5 test files and 52 tests (organization-chart 5).",
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
