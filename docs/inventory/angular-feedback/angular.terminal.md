# Angular UTerminal

ID: angular.terminal

Framework: angular; availability: public

## Authored interpretation

Command-entry display connected to the Angular terminal service.

## Framework surface

UTerminal; Inputs welcomeMessage?:string and prompt:string="$". Enter on nonempty input appends an owned TerminalCommand {text:string;response?:string}, calls UTerminalService.sendCommand and clears the input. The response subscription updates the latest command and ignores responses before a command exists; it unsubscribes on destroy. Host click focuses the input; responses use aria-live=polite. No component outputs; service commandHandler/responseHandler are the communication seam, owned externally by ng-core. Internal command state, input handlers and TerminalCommand are attributed to this record. Standalone OnPush component, selector u-terminal, extends UBaseComponent with inherited dt:Record<string,unknown>|undefined and unstyled:boolean|undefined. Owned source-only terminalStyleModule exports css/classes; it is not barrel-exported and does not import @ultimate/uix-styles. componentName "terminal" selects the Aura components key terminal; base initialization registers theme variables and styles. No record for this family exists in the current ALL_COMPONENTS metadata registry. Consumer availability is the root and matching secondary manifest entry.

## Public exports

@ultimate/ng#UTerminal
@ultimate/ng/terminal#UTerminal

## Owned source and evidence

packages/ng/src/terminal/index.ts
packages/ng/src/terminal/terminal.ts
packages/ng/src/terminal/terminal-style.ts

```text
packages/ng/src/terminal/terminal.ts: export class UTerminal
packages/ng/src/terminal/index.ts: UTerminal
packages/ng/src/index.ts: export * from "@ultimate/ng/terminal";
packages/component-metadata/src/index.ts: export const ALL_COMPONENTS: ComponentMetadata[] = [
packages/ng/src/terminal/terminal.spec.ts: UTerminal
.github/workflows/ci.yml: pnpm run test
packages/ng/package.json: "./terminal":
packages/ng/src/terminal/terminal-style.ts: export const terminalStyleModule
packages/ng-core/src/basecomponent/base-component.ts: registerThemeVariables(sheet, this.componentName);
packages/themes/src/presets/aura/index.ts: terminal
packages/ng-core/src/terminal-service/terminal-service.ts: export class UTerminalService
```

## Relationships

package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.ng-core.terminal-service (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Command-entry display connected to the Angular terminal service. Interface, local helpers, ownership and source observations are supported by cited source, not exhaustive behavioral verification."
  },
  {
    "state": "verified",
    "behavior": "The existing scoped spec suite passed once: terminal.spec.ts. Only assertions in the cited tests are verified; the full authored surface is source evidence.",
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
