# Angular UFluid

ID: angular.fluid

Framework: angular; availability: public

## Authored interpretation

Marks a projected subtree as a fluid ancestor for participating inputs.

## Framework surface

UFluid; Selector u-fluid; standalone OnPush component with ViewEncapsulation.None, ng-content and host class u-fluid. Provides U_FLUID_ANCESTOR with useValue:true from ng-core/base-input. No inputs, outputs, base component or local style module. This provider relationship lets participating controls derive fluid context; the component has no own CSS establishing arbitrary descendant width. No dedicated Aura component key is registered. No record for this family exists in the current ALL_COMPONENTS metadata registry. Consumer availability is the root and matching secondary manifest entry.

## Public exports

@ultimate/ng#UFluid
@ultimate/ng/fluid#UFluid

## Owned source and evidence

packages/ng/src/fluid/index.ts
packages/ng/src/fluid/fluid.ts

```text
packages/ng/src/fluid/fluid.ts: export class UFluid
packages/ng/src/fluid/index.ts: UFluid
packages/ng/src/index.ts: export * from "@ultimate/ng/fluid";
packages/component-metadata/src/index.ts: export const ALL_COMPONENTS: ComponentMetadata[] = [
packages/ng/src/fluid/fluid.spec.ts: UFluid
.github/workflows/ci.yml: pnpm run test
packages/ng/package.json: "./fluid":
packages/themes/src/presets/aura/index.ts: components:
packages/ng-core/src/base-input/fluid-ancestor.token.ts: U_FLUID_ANCESTOR
```

## Relationships

package.ultimate.ng-core.base-input (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Marks a projected subtree as a fluid ancestor for participating inputs. Interface, local helpers, ownership and source observations are supported by cited source, not exhaustive behavioral verification."
  },
  {
    "state": "verified",
    "behavior": "The existing scoped spec suite passed once: fluid.spec.ts. Only assertions in the cited tests are verified; the full authored surface is source evidence.",
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
