# Angular USteps

ID: angular.steps

Framework: angular; availability: public

## Authored interpretation

Flat workflow progress indicator with optional command and router selection.

## Framework surface

USteps (u-steps) is an indicator driven by model: UMenuItem[] = [], activeIndex=0 (numberAttribute), readonly=true (booleanAttribute), not a UStepper composition. onSelect emits {originalEvent: MouseEvent; item: UMenuItem; index: number}; there is no activeIndexChange or internal selection update. UMenuItem is imported from ng-core, not declared or re-exported by this family. Visible items render labels and one-based model-index numbers; routerLink is used only when !readonly and !item.disabled, otherwise url or # anchor. isItemDisabled is item.disabled || (readonly && index !== activeIndex); current readonly item can receive focus, but onItemClick rejects all readonly activation. Enabled clicks emit onSelect then command with the same payload and preventDefault if no url. Keyboard ArrowRight/Left (nonwrapping), Home/End move among enabled anchors. rendered entries preserve original model indices when invisible items are removed. Consumes label, visible, disabled, routerLink, url, target and command, not every UMenuItem field. stepsStyleModule is source-only with inline active?/disabled? resolver parameters; no named class-parameter interface. All owned components extend UBaseComponent; inherited dt?: Record<string,unknown> and unstyled?: boolean inputs exist. Base ngOnInit registers theme variables and local structural CSS under componentName=steps; local dt() token CSS and Aura steps registration establish an indirect theme relationship, not a direct themes import or rendered-theme proof. No direct UIX style import, owned factories, base classes, hooks, separate directives or dedicated component-metadata record were found. No metadata relationship is inferred from names. Consumer availability: @ultimate/ng#USteps, @ultimate/ng/steps#USteps. Manifest dist targets declare consumer entries, not verified publication/build artifacts. All remaining local css/classes constants, signals, DI references, DOM handlers and private/protected helpers in owned files belong to this family, not independent public products. Prime source comments are neutral provenance references only.

## Public exports

@ultimate/ng#USteps
@ultimate/ng/steps#USteps

## Owned source and evidence

packages/ng/src/steps/index.ts
packages/ng/src/steps/steps-style.ts
packages/ng/src/steps/steps.ts

```text
packages/ng/src/steps/index.ts: export { USteps } from "./steps";
packages/ng/src/index.ts: export * from "@ultimate/ng/steps";
packages/ng/package.json: "./steps"
packages/ng/src/steps/steps-style.ts: export const stepsStyleModule = { css, classes };
packages/ng-core/src/basecomponent/base-component.ts: registerThemeVariables(sheet, this.componentName);
packages/themes/src/presets/aura/index.ts:     steps,
packages/ng/src/steps/steps.ts: export class USteps extends UBaseComponent
packages/ng/src/steps/steps.ts: import { UBaseComponent, type UMenuItem } from "@ultimate/ng-core";
```

## Relationships

package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.ng-core.api (pending cross-batch)

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
