# Vue UOrderList

ID: vue.order-list

Framework: vue; availability: public

## Authored interpretation

Reorderable single list with move up/top/down/bottom controls and multi-selection, built on the Vue listbox SFC.

## Framework surface

UOrderList and createBaseOrderList (componentName orderlist); source-only orderListStyleModule. Props: modelValue (array), dataKey, metaKeySelection, autoOptionFocus (default true), focusOnHover, responsive (default true), breakpoint (default 960px), striped, scrollHeight (default 14rem), tabindex (default 0), disabled, ariaLabel (default Order list), ariaLabelledby, buttonProps and per-direction moveUp/moveTop/moveDown/moveBottom button props. Emits update:modelValue. Four buttons (data-pc-section moveupbutton, movetopbutton, movedownbutton, movebottombutton; text Move up, Move top, Move down, Move bottom) are disabled when nothing is selected; selection is internal state. window.matchMedia on breakpoint toggles the u-order-list-narrow class. The list is the Listbox SFC from ../listbox/Listbox.vue in multiple mode (identity owned by #116). It declares no filter and no drag-and-drop. Each is an Options API SFC extending its exported base factory, which extends createBaseComponent from @ultimate/vue-core; the family barrel exposes the same named surface at the root and at the family subpath, and declared dist paths do not establish publication. The style module is source-only: exported from its style file, not from the family barrel. No component-metadata record or @ultimate/uix-styles entry exists for this family in this revision. The Aura preset registration does not prove rendered appearance. Prime references in source are neutral provenance context.

## Public exports

@ultimate/vue#UOrderList
@ultimate/vue/order-list#UOrderList

## Owned source and evidence

packages/vue/src/order-list/OrderList.vue
packages/vue/src/order-list/BaseOrderList.ts
packages/vue/src/order-list/order-list-style.ts
packages/vue/src/order-list/index.ts

```text
packages/vue/src/order-list/OrderList.vue: name: "UOrderList"
packages/vue/src/order-list/BaseOrderList.ts: createBaseOrderList
packages/vue/src/order-list/order-list-style.ts: export const orderListStyleModule
packages/vue/src/order-list/index.ts: export { default as UOrderList } from "./OrderList.vue";
packages/vue/src/index.ts: export * from "./order-list";
packages/vue/package.json: "./order-list": {
packages/vue/tsup.config.ts: "order-list/index"
packages/themes/src/presets/aura/index.ts: orderlist: orderList,
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
packages/vue/src/order-list/OrderList.vue: import Listbox from "../listbox/Listbox.vue";
packages/vue/src/order-list/OrderList.vue: matchMedia
packages/vue/src/order-list/OrderList.vue: update:modelValue
```

## Relationships

package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.vue.listbox (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "The SFC, base factory and local style module exist in source; implementation evidence alone is not a passing behavior check."
  },
  {
    "state": "verified",
    "behavior": "Existing scoped Vue product specifications passed: 5 test files and 52 tests (order-list 14).",
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
