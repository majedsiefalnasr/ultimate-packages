# Angular UStepper

ID: angular.stepper

Framework: angular; availability: public

## Authored interpretation

Value-linked wizard headers and content panels with consumer-controlled navigation.

## Framework surface

UStepper (u-stepper, role=tablist) owns value = model<number | undefined>(undefined), including valueChange, and linear=false (booleanAttribute). Public updateValue(value: number) sets value without gating; isStepActive(value: number) compares equality. UStepList (u-step-list) and UStepPanels (u-step-panels) are stateless projection wrappers. UStepItem (u-step-item) requires numeric value, injects UStepper and exposes active styling for vertical grouping. UStep (u-step) requires numeric value and disabled=false; projects title beside the value number in a button. Exact disabled condition is !active && (linear || disabled): linear disables every non-active step, not only future steps; the active step remains enabled even when disabled input is true. Button click calls updateValue; native button activation, not custom arrow roving. UStepPanel (u-step-panel, exportAs uStepPanel) requires numeric value and hides inactive projected content with [hidden]; public activate(value: number) delegates directly to parent, with validation/gating left to the consumer. UStepperSeparator (u-stepper-separator) is empty visual projection-free connector with aria-hidden=true. All seven classes are public components. stepperStyleModule is source-only with inline active?/disabled? resolver parameters, no named class-parameter interface; CSS explicitly hides .u-step-panel[hidden]. All owned components extend UBaseComponent; inherited dt?: Record<string,unknown> and unstyled?: boolean inputs exist. Base ngOnInit registers theme variables and local structural CSS under componentName=stepper; local dt() token CSS and Aura stepper registration establish an indirect theme relationship, not a direct themes import or rendered-theme proof. No direct UIX style import, owned factories, base classes, hooks, separate directives or dedicated component-metadata record were found. No metadata relationship is inferred from names. Consumer availability: @ultimate/ng#UStepper, @ultimate/ng/stepper#UStepper, @ultimate/ng#UStepList, @ultimate/ng/stepper#UStepList, @ultimate/ng#UStepItem, @ultimate/ng/stepper#UStepItem, @ultimate/ng#UStep, @ultimate/ng/stepper#UStep, @ultimate/ng#UStepPanels, @ultimate/ng/stepper#UStepPanels, @ultimate/ng#UStepPanel, @ultimate/ng/stepper#UStepPanel, @ultimate/ng#UStepperSeparator, @ultimate/ng/stepper#UStepperSeparator. Manifest dist targets declare consumer entries, not verified publication/build artifacts. All remaining local css/classes constants, signals, DI references, DOM handlers and private/protected helpers in owned files belong to this family, not independent public products. Prime source comments are neutral provenance references only.

## Public exports

@ultimate/ng#UStepper
@ultimate/ng/stepper#UStepper
@ultimate/ng#UStepList
@ultimate/ng/stepper#UStepList
@ultimate/ng#UStepItem
@ultimate/ng/stepper#UStepItem
@ultimate/ng#UStep
@ultimate/ng/stepper#UStep
@ultimate/ng#UStepPanels
@ultimate/ng/stepper#UStepPanels
@ultimate/ng#UStepPanel
@ultimate/ng/stepper#UStepPanel
@ultimate/ng#UStepperSeparator
@ultimate/ng/stepper#UStepperSeparator

## Owned source and evidence

packages/ng/src/stepper/index.ts
packages/ng/src/stepper/step-item.ts
packages/ng/src/stepper/step-list.ts
packages/ng/src/stepper/step-panel.ts
packages/ng/src/stepper/step-panels.ts
packages/ng/src/stepper/step.ts
packages/ng/src/stepper/stepper-separator.ts
packages/ng/src/stepper/stepper-style.ts
packages/ng/src/stepper/stepper.ts

```text
packages/ng/src/stepper/index.ts: export { UStepper } from "./stepper";
packages/ng/src/index.ts: export * from "@ultimate/ng/stepper";
packages/ng/package.json: "./stepper"
packages/ng/src/stepper/stepper-style.ts: export const stepperStyleModule = { css, classes };
packages/ng-core/src/basecomponent/base-component.ts: registerThemeVariables(sheet, this.componentName);
packages/themes/src/presets/aura/index.ts:     stepper,
packages/ng/src/stepper/step-item.ts: export class UStepItem extends UBaseComponent
packages/ng/src/stepper/step-list.ts: export class UStepList extends UBaseComponent
packages/ng/src/stepper/step-panel.ts: export class UStepPanel extends UBaseComponent
packages/ng/src/stepper/step-panels.ts: export class UStepPanels extends UBaseComponent
packages/ng/src/stepper/step.ts: export class UStep extends UBaseComponent
packages/ng/src/stepper/stepper-separator.ts: export class UStepperSeparator extends UBaseComponent
packages/ng/src/stepper/stepper.ts: export class UStepper extends UBaseComponent
```

## Relationships

package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation, public composition/types and local style adapters exist; source evidence alone is not execution."
  },
  {
    "state": "verified",
    "behavior": "Existing bounded four-family Angular specs passed once (48 total assertions counted as tests).",
    "command": "NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/{accordion,tabs,stepper,steps}/*.spec.ts'",
    "outcome": "passed",
    "revision": "fcd2e02d28e0b9a678262d4731bb7ae31732d574",
    "output": "Exit 0. Vitest 4.0.8: Test Files 4 passed (4); Tests 48 passed (48). accordion 8, tabs 13, stepper 6, steps 21. Angular build completed; warnings NG8113 (UStepList and UStepPanels unused in VerticalStepperHost in src/g3c1-aura-styles.spec.ts), NG8102 (src/input-number/input-number.ts:90:19 step() ?? 1).",
    "run": "docs/inventory/angular-disclosure-steps/product-run.json",
    "limitations": "Local Angular unit-test environment only; not browser/visual, Storybook, package build, publication or remote CI verification. Coverage includes imported foundations, not full family/platform coverage; warnings were not repaired."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs Test step runs root pnpm run test, recursively including @ultimate/ng ng test --project=ng. Configuration only, not an observed successful remote run. Inventory tests are not in provenance-only test:scripts.",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional !cancelled() and classification scope != docs; branch protection and remote executions not observed."
  }
]
```
