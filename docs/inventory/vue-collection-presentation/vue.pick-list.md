# Vue UPickList

ID: vue.pick-list

Framework: vue; availability: public

## Authored interpretation

Dual-list transfer control that moves items between source and target lists with per-side reordering, built on the Vue listbox SFC.

## Framework surface

UPickList (public component) and source-only createBasePickList (componentName picklist); source-only pickListStyleModule. Props: modelValue (default a pair of empty arrays), dataKey, metaKeySelection, autoOptionFocus, focusOnHover, responsive, breakpoint, striped, scrollHeight, tabindex, disabled, ariaLabel, ariaLabelledby, buttonProps, showSourceControls, showTargetControls and per-button props for moveUp, moveTop, moveDown, moveBottom, moveToTarget, moveAllToTarget, moveToSource and moveAllToSource. Emits update:modelValue with the source and target pair. Transfer buttons (To Target, All To Target, To Source, All To Source; data-pc-section movetotargetbutton and siblings) call a transfer(side, all) method; each side has its own Move controls. Each side is a Listbox SFC from ../listbox/Listbox.vue (identity owned by #118) with aria-label derived from ariaLabel plus source or target. It carries its own select, move and identity logic, with a pair-valued model. The SFC extends its base factory from the family Base file, which is source-only and not exported from the family barrel; the factory extends createBaseComponent from @ultimate/vue-core. The barrel exposes only the component at the root and at the family subpath, and declared dist paths do not establish publication. The style module is source-only: exported from its style file, not from the family barrel. No component-metadata record or @ultimate/uix-styles entry exists for this family in this revision. The Aura preset registration does not prove rendered appearance. Prime references in source are neutral provenance context.

## Public exports

@ultimate/vue#UPickList
@ultimate/vue/pick-list#UPickList

## Owned source and evidence

packages/vue/src/pick-list/PickList.vue
packages/vue/src/pick-list/BasePickList.ts
packages/vue/src/pick-list/pick-list-style.ts
packages/vue/src/pick-list/index.ts

```text
packages/vue/src/pick-list/PickList.vue: name: "UPickList"
packages/vue/src/pick-list/BasePickList.ts: createBasePickList
packages/vue/src/pick-list/pick-list-style.ts: export const pickListStyleModule
packages/vue/src/pick-list/index.ts: export { default as UPickList } from "./PickList.vue";
packages/vue/src/index.ts: export * from "./pick-list";
packages/vue/package.json: "./pick-list": {
packages/vue/tsup.config.ts: "pick-list/index"
packages/themes/src/presets/aura/index.ts: picklist: pickList,
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
packages/vue/src/pick-list/PickList.vue: import Listbox from "../listbox/Listbox.vue";
packages/vue/src/pick-list/PickList.vue: movetotargetbutton
packages/vue/src/pick-list/PickList.vue: update:modelValue
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
    "behavior": "Existing scoped Vue product specifications passed: 5 test files and 52 tests (pick-list 22).",
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
