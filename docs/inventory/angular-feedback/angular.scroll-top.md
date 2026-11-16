# Angular UScrollTop

ID: angular.scroll-top

Framework: angular; availability: public

## Authored interpretation

Button that scrolls the window or its parent to the top.

## Framework surface

UScrollTop; Inputs target:"window"|"parent"="window", threshold:number=400 (numberAttribute), behavior:"auto"|"smooth"="smooth", buttonAriaLabel:string="Scroll to top"; outputs onShow/onHide:void. Composes real UButton. The template's protected onClick() scrolls the selected target; there is no public scrollToTop method. Listener installed on init; visibility checks scroll position > threshold after scroll events, without an initial scroll-position check. An effect emits initial onHide and subsequent visibility events and queues overlay ZIndex.set. Destroy removes the scroll listener. ngOnInit overrides the base without calling super.ngOnInit, so inherited style registration is not invoked there. Local structural style uses componentName "scroll-top", which has no Aura component key. Standalone OnPush component, selector u-scroll-top, extends UBaseComponent with inherited dt:Record<string,unknown>|undefined and unstyled:boolean|undefined. Owned source-only scrollTopStyleModule exports css/classes; it is not barrel-exported and does not import @ultimate/uix-styles. No record for this family exists in the current ALL_COMPONENTS metadata registry. Consumer availability is root-only; the package manifest has no ./scroll-top export.

## Public exports

@ultimate/ng#UScrollTop

## Owned source and evidence

packages/ng/src/scroll-top/index.ts
packages/ng/src/scroll-top/scroll-top.ts
packages/ng/src/scroll-top/scroll-top-style.ts

```text
packages/ng/src/scroll-top/scroll-top.ts: export class UScrollTop
packages/ng/src/scroll-top/index.ts: UScrollTop
packages/ng/src/index.ts: export * from "./scroll-top";
packages/component-metadata/src/index.ts: export const ALL_COMPONENTS: ComponentMetadata[] = [
packages/ng/src/scroll-top/scroll-top.spec.ts: UScrollTop
.github/workflows/ci.yml: pnpm run test
packages/ng/src/scroll-top/scroll-top-style.ts: export const scrollTopStyleModule
packages/ng-core/src/basecomponent/base-component.ts: registerThemeVariables(sheet, this.componentName);
packages/themes/src/presets/aura/index.ts: components:
packages/ng/src/button/index.ts: UButton
packages/uix-utils/src/dom/index.ts: export
packages/uix-utils/src/zindex/index.ts: export
```

## Relationships

package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.ng.button (pending cross-batch)
package.ultimate.uix-utils.dom (pending cross-batch)
package.ultimate.uix-utils.zindex (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Button that scrolls the window or its parent to the top. Interface, local helpers, ownership and source observations are supported by cited source, not exhaustive behavioral verification."
  },
  {
    "state": "verified",
    "behavior": "The existing scoped spec suite passed once: scroll-top.spec.ts. Only assertions in the cited tests are verified; the full authored surface is source evidence.",
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
