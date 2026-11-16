# Vue UStepper

ID: vue.stepper

Framework: vue; availability: public

## Authored interpretation

Compound horizontal and vertical step navigation.

## Framework surface

UStepper, UStepList, UStep, UStepItem, UStepPanels and UStepPanel are public compositions; createBaseStepper declares value (String or Number, undefined) and linear (false). UStepper provides $pcStepper, syncs d_value and emits update:value on change. UStepList registers children and refreshes separators. UStep requires value and accepts disabled (false); its disabled expression is !active && (linear || disabled), so active stays enabled and linear blocks non-active headers. UStep has role=tab with native button behavior; no explicit arrow-key handler. UStepItem requires value and provides vertical grouping. UStepPanel requires value, stays mounted with v-show, and exposes default scoped slot {active, activateCallback}; callback invokes updateValue without linear gating. UStepPanels wraps its default slot. UStepperSeparator is internal, not a barrel export; stepperStyleModule is source-only. No named part factories or public interfaces are declared. Factories return Options API components extending createBaseComponent, which registers component styles on mount. No Prime parity judgment is implied. No direct UIX style-module import or component-metadata record exists for this scoped family.

## Public exports

@ultimate/vue#UStepper
@ultimate/vue/stepper#UStepper
@ultimate/vue#UStepList
@ultimate/vue/stepper#UStepList
@ultimate/vue#UStep
@ultimate/vue/stepper#UStep
@ultimate/vue#UStepItem
@ultimate/vue/stepper#UStepItem
@ultimate/vue#UStepPanels
@ultimate/vue/stepper#UStepPanels
@ultimate/vue#UStepPanel
@ultimate/vue/stepper#UStepPanel
@ultimate/vue#createBaseStepper
@ultimate/vue/stepper#createBaseStepper

## Owned source and evidence

packages/vue/src/stepper/BaseStepper.ts
packages/vue/src/stepper/Step.vue
packages/vue/src/stepper/StepItem.vue
packages/vue/src/stepper/StepList.vue
packages/vue/src/stepper/StepPanel.vue
packages/vue/src/stepper/StepPanels.vue
packages/vue/src/stepper/Stepper.vue
packages/vue/src/stepper/StepperSeparator.vue
packages/vue/src/stepper/index.ts
packages/vue/src/stepper/stepper-style.ts

```text
packages/vue/src/stepper/index.ts: UStepper
packages/vue/src/stepper/Step.vue: return !this.active && (this.$pcStepper.isStepDisabled() || this.disabled);
packages/vue/src/stepper/StepPanel.vue: :activateCallback="activate"
packages/vue/src/index.ts: export * from "./stepper";
.github/workflows/ci.yml: run: pnpm run test
packages/themes/src/presets/aura/index.ts:     stepper,
packages/vue-core/src/base/base-component.ts: registerComponentStyle(componentName, styleModule);
package.json: "test": "pnpm --filter @ultimate/themes run test && pnpm -r --filter '!@ultimate/themes' --if-present run test"
packages/vue/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "The documented public entries and family implementation are source-present."
  },
  {
    "state": "verified",
    "behavior": "The scoped existing Vue product suite passed locally.",
    "command": "NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/vue exec vitest run src/accordion/ src/tabs/ src/stepper/ src/steps/ --config ../../scripts/inventory/vue-disclosure-vitest.config.mjs --maxWorkers=1 --minWorkers=1",
    "revision": "3864a1d23b5ef0c5601ff740c104fdec4584d14d",
    "outcome": "passed",
    "limitations": "Local jsdom unit tests only with built workspace prerequisites and the committed inventory PostCSS override; not browser, accessibility, visual, published-package or remote CI verification.",
    "output": "Vitest 2.1.9: 4 files passed, 63 tests passed (accordion 9, tabs 17, stepper 21, steps 16).",
    "run": "docs/inventory/vue-disclosure-steps/product-run.json"
  },
  {
    "state": "failed",
    "behavior": "The first scoped Vue product-suite attempt was blocked before assertions by the host PostCSS configuration.",
    "command": "pnpm --filter @ultimate/vue exec vitest run src/accordion/ src/tabs/ src/stepper/ src/steps/ --maxWorkers=1 --minWorkers=1",
    "outcome": "failed",
    "revision": "3864a1d23b5ef0c5601ff740c104fdec4584d14d",
    "limitations": "Environment/configuration failure; no product assertion ran.",
    "output": "Vitest stopped before assertions because the ancestor /Users/majedsiefalnasr/postcss.config.mjs imports unavailable postcss-import.",
    "run": "docs/inventory/vue-disclosure-steps/product-attempts.json"
  },
  {
    "state": "failed",
    "behavior": "A retry with the committed PostCSS override failed before assertions because workspace build prerequisites were missing.",
    "command": "NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/vue exec vitest run src/accordion/ src/tabs/ src/stepper/ src/steps/ --config ../../scripts/inventory/vue-disclosure-vitest.config.mjs --maxWorkers=1 --minWorkers=1",
    "outcome": "failed",
    "revision": "3864a1d23b5ef0c5601ff740c104fdec4584d14d",
    "limitations": "Workspace build prerequisites had not yet been built; no product assertion ran. The subsequent run passed after building prerequisites.",
    "output": "Vitest collection failed for all four suites because the built @ultimate/vue-core entry was unavailable.",
    "run": "docs/inventory/vue-disclosure-steps/product-attempts.json"
  },
  {
    "state": "ci-enforced",
    "behavior": "Existing CI conditionally runs the root product-test script for non-docs changes; inventory tests are not included. No remote run or branch protection was observed.",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on non-docs scope and !cancelled(); no remote run or branch protection observed."
  }
]
```
