# Angular UKeyFilter

ID: angular.key-filter

Framework: angular; availability: public

## Authored interpretation

Filters keypress and pasted characters on an input host.

## Framework surface

UKeyFilter; Selector [uKeyFilter]. pattern:RegExp|UKeyFilterPattern|undefined aliases uKeyFilter; validateOnly:boolean=false has no boolean transform. Exported UKeyFilterPattern is "pint"|"int"|"pnum"|"money"|"num"|"hex"|"email"|"alpha"|"alphanum". Source-only DEFAULT_MASKS and handlers belong here. Keypress checks existingValue+key, bypassing modifiers/Enter or validateOnly; paste checks each character and does not consult validateOnly. Undefined pattern uses /./. No outputs, NG_VALIDATORS provider, validation result, base component or styling integration. No dedicated Aura component key is registered. No record for this family exists in the current ALL_COMPONENTS metadata registry. Consumer availability is the root and matching secondary manifest entry.

## Public exports

@ultimate/ng#UKeyFilter
@ultimate/ng#UKeyFilterPattern
@ultimate/ng/key-filter#UKeyFilter
@ultimate/ng/key-filter#UKeyFilterPattern

## Owned source and evidence

packages/ng/src/key-filter/index.ts
packages/ng/src/key-filter/key-filter.ts

```text
packages/ng/src/key-filter/key-filter.ts: export class UKeyFilter
packages/ng/src/key-filter/index.ts: UKeyFilter
packages/ng/src/index.ts: export * from "@ultimate/ng/key-filter";
packages/component-metadata/src/index.ts: export const ALL_COMPONENTS: ComponentMetadata[] = [
packages/ng/src/key-filter/key-filter.spec.ts: UKeyFilter
.github/workflows/ci.yml: pnpm run test
packages/ng/package.json: "./key-filter":
packages/ng/src/key-filter/key-filter.ts: export type UKeyFilterPattern
packages/themes/src/presets/aura/index.ts: components:
```

## Relationships

None recorded.

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Filters keypress and pasted characters on an input host. Interface, local helpers, ownership and source observations are supported by cited source, not exhaustive behavioral verification."
  },
  {
    "state": "verified",
    "behavior": "The existing scoped spec suite passed once: key-filter.spec.ts. Only assertions in the cited tests are verified; the full authored surface is source evidence.",
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
