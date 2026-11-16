# Angular UInplace

ID: angular.inplace

Framework: angular; availability: public

## Authored interpretation

Switches projected display content to an editable content template.

## Framework surface

UInplace; Inputs active=false, disabled=false, preventClick=false with booleanAttribute; outputs onActivate/onDeactivate:Event|undefined. Projects [displayContent] when inactive and direct-child #content TemplateRef when active. Exported UInplaceContentContext has closeCallback:(event?:Event)=>void. Private activate(event?:Event) and deactivate(event?:Event) implement template interaction, set an internal override after first use and emit; disabled blocks both. preventClick is checked in click/callback paths, while Enter calls activate directly. Display div role=button tabindex=0 and host aria-live=polite. No separate public display/content component or factory. Standalone OnPush component, selector u-inplace, extends UBaseComponent with inherited dt:Record<string,unknown>|undefined and unstyled:boolean|undefined. Owned source-only inplaceStyleModule exports css/classes; it is not barrel-exported and does not import @ultimate/uix-styles. componentName "inplace" selects the Aura components key inplace; base initialization registers theme variables and styles. No record for this family exists in the current ALL_COMPONENTS metadata registry. Consumer availability is the root and matching secondary manifest entry.

## Public exports

@ultimate/ng#UInplace
@ultimate/ng#UInplaceContentContext
@ultimate/ng/inplace#UInplace
@ultimate/ng/inplace#UInplaceContentContext

## Owned source and evidence

packages/ng/src/inplace/index.ts
packages/ng/src/inplace/inplace.ts
packages/ng/src/inplace/inplace-style.ts

```text
packages/ng/src/inplace/inplace.ts: export class UInplace
packages/ng/src/inplace/index.ts: UInplace
packages/ng/src/index.ts: export * from "@ultimate/ng/inplace";
packages/component-metadata/src/index.ts: export const ALL_COMPONENTS: ComponentMetadata[] = [
packages/ng/src/inplace/inplace.spec.ts: UInplace
.github/workflows/ci.yml: pnpm run test
packages/ng/package.json: "./inplace":
packages/ng/src/inplace/inplace-style.ts: export const inplaceStyleModule
packages/ng-core/src/basecomponent/base-component.ts: registerThemeVariables(sheet, this.componentName);
packages/themes/src/presets/aura/index.ts: inplace
packages/ng/src/inplace/inplace.ts: export interface UInplaceContentContext
```

## Relationships

package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Switches projected display content to an editable content template. Interface, local helpers, ownership and source observations are supported by cited source, not exhaustive behavioral verification."
  },
  {
    "state": "verified",
    "behavior": "The existing scoped spec suite passed once: inplace.spec.ts. Only assertions in the cited tests are verified; the full authored surface is source evidence.",
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
