# Angular UMeterGroup

ID: angular.meter-group

Framework: angular; availability: public

## Authored interpretation

Multiple proportional meter segments with a legend.

## Framework surface

UMeterGroup; Inputs value:UMeterItem[]=[], min:number=0, max:number=100, orientation:"horizontal"|"vertical"="horizontal". Exported UMeterItem has label?:string, color?:string, value:number, icon?:string. Only positive values produce segments; all items produce legend entries. Percentage is rounded and clamped from (value-min)/(max-min)*100, with equal endpoints returning 100. aria-valuenow normalizes the sum of item values through percent(), while min/max attributes retain raw range values. No outputs. Standalone OnPush component, selector u-meter-group, extends UBaseComponent with inherited dt:Record<string,unknown>|undefined and unstyled:boolean|undefined. Owned source-only meterGroupStyleModule exports css/classes; it is not barrel-exported and does not import @ultimate/uix-styles. componentName "metergroup" selects the Aura components key metergroup; base initialization registers theme variables and styles. No record for this family exists in the current ALL_COMPONENTS metadata registry. Consumer availability is the root and matching secondary manifest entry.

## Public exports

@ultimate/ng#UMeterGroup
@ultimate/ng#UMeterItem
@ultimate/ng/meter-group#UMeterGroup
@ultimate/ng/meter-group#UMeterItem

## Owned source and evidence

packages/ng/src/meter-group/index.ts
packages/ng/src/meter-group/meter-group.ts
packages/ng/src/meter-group/meter-group-style.ts

```text
packages/ng/src/meter-group/meter-group.ts: export class UMeterGroup
packages/ng/src/meter-group/index.ts: UMeterGroup
packages/ng/src/index.ts: export * from "@ultimate/ng/meter-group";
packages/component-metadata/src/index.ts: export const ALL_COMPONENTS: ComponentMetadata[] = [
packages/ng/src/meter-group/meter-group.spec.ts: UMeterGroup
.github/workflows/ci.yml: pnpm run test
packages/ng/package.json: "./meter-group":
packages/ng/src/meter-group/meter-group-style.ts: export const meterGroupStyleModule
packages/ng-core/src/basecomponent/base-component.ts: registerThemeVariables(sheet, this.componentName);
packages/themes/src/presets/aura/index.ts: metergroup
packages/ng/src/meter-group/meter-group.ts: export interface UMeterItem
```

## Relationships

package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Multiple proportional meter segments with a legend. Interface, local helpers, ownership and source observations are supported by cited source, not exhaustive behavioral verification."
  },
  {
    "state": "verified",
    "behavior": "The existing scoped spec suite passed once: meter-group.spec.ts. Only assertions in the cited tests are verified; the full authored surface is source evidence.",
    "command": "NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/{progress-bar,progress-spinner,meter-group,skeleton,terminal,inplace,scroll-top,ripple,autofocus,fluid,key-filter,style-class,animate-on-scroll}/*.spec.ts'",
    "outcome": "passed",
    "revision": "c531e881dfa14e18449553ecfe45b0ab17d3210a",
    "run": "docs/inventory/angular-feedback/product-run.json",
    "output": "Vitest 4.0.8: Test Files 13 passed (13); Tests 62 passed (62). key-filter 8; animate-on-scroll 5; style-class 9; autofocus 1; progress-bar 5; fluid 2; progress-spinner 4; scroll-top 4; skeleton 7; inplace 6; meter-group 5; terminal 5; ripple 1. Compiler warnings: NG8113 unused UStepList/UStepPanels in VerticalStepperHost; NG8102 step() ?? 1 in InputNumber. Runtime warning: NG0912 SsrHostComponent/HostComponent component-ID collision in style-class toggle test.",
    "limitations": "One bounded local jsdom unit run under Node 24.15.0 after worktree-local prerequisite builds; no browser, visual, accessibility, Storybook, full platform/build, installed-package or publication proof. IntersectionObserver is mocked in animate-on-scroll; ripple only checks ink-span presence and fluid checks host class/DOM content. Coverage includes imported foundations and Button, not just this scope; existing tests are not exhaustive."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configuration only: the non-docs CI Test step invokes root pnpm run test, whose recursive package tests include Angular. This does not prove a remote run or branch protection. Inventory node tests are outside provenance-only test:scripts.",
    "workflow": ".github/workflows/ci.yml"
  }
]
```
