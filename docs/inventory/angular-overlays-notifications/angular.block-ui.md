# Angular UBlockUI

ID: angular.block-ui

Framework: angular; availability: public

## Authored interpretation

Container that overlays a mask on its projected content (or the viewport) while blocked is true and reports blocked and unblocked transitions.

## Framework surface

Selector u-block-ui; componentName blockui (differs from the block-ui folder name); extends UBaseComponent. Inputs: blocked (false), autoZIndex (true), baseZIndex (0, numberAttribute) and fullScreen (false). Outputs: onBlocked and onUnblocked. Host: class root and [attr.aria-busy]=blocked(). It has no aria-live or focus handling. Template: ng-content plus, while blocked, a mask div (#mask) with the fullScreen modifier class. An effect compares blocked() with a wasBlocked field that starts false, so an initial blocked=true is treated as a transition. When blocking: fullScreen() true registers a scroll lock (scrollLockRegistry, Math.random id); autoZIndex() true and a resolved maskRef call ZIndex.set('modal', mask, baseZIndex()); this inventory did not establish whether the non-static @ViewChild maskRef is resolved when the effect runs for the first block, so the z-index step applies only when it is; then onBlocked is emitted. When unblocking: the scroll lock is unregistered if fullScreen() is true at that moment (the current value, not the one used when blocking) and onUnblocked is emitted. ngOnDestroy unregisters the scroll lock only when wasBlocked and fullScreen() are both true and does not call ZIndex.clear. Style module: block-ui-style.ts holds a local CSS string and exports blockUiStyleModule only (classes root and mask). Entry points: exported from the @ultimate/ng/block-ui manifest subpath and re-exported by the root barrel packages/ng/src/index.ts. No dedicated @ultimate/uix-styles export exists for this family, so its CSS is a local string in the style module and no uix-styles relationship is linked. There is no component-metadata record for this family, so no metadata relationship is linked. Aura registry key: blockui.

## Public exports

@ultimate/ng#UBlockUI
@ultimate/ng/block-ui#UBlockUI

## Owned source and evidence

packages/ng/src/block-ui/index.ts
packages/ng/src/block-ui/block-ui.ts
packages/ng/src/block-ui/block-ui-style.ts

```text
packages/ng/src/block-ui/block-ui.ts: export class UBlockUI extends UBaseComponent
packages/ng/src/block-ui/block-ui.ts: "[attr.aria-busy]": "blocked()"
packages/ng/src/block-ui/block-ui.ts: private wasBlocked = false;
packages/ng/src/block-ui/block-ui.ts: if (this.autoZIndex() && this.maskRef) {
packages/ng/src/block-ui/block-ui.ts: scrollLockRegistry.register(this.lockId);
packages/ng/src/block-ui/block-ui.ts: if (this.wasBlocked && this.fullScreen()) {
packages/ng/src/block-ui/block-ui-style.ts: export const blockUiStyleModule
packages/ng/package.json: "./block-ui": {
packages/ng/src/block-ui/index.ts: export { UBlockUI }
packages/themes/src/presets/aura/index.ts:     blockui: blockUI,
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
```

## Relationships

package.ultimate.ng.block-ui → [angular.block-ui](angular.block-ui.md) (reconciled family alias)
package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.uix-utils.scroll-lock (pending cross-batch)
package.ultimate.uix-utils.zindex (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Component, local style module and behavioral spec exist; source inspection is not a passing test."
  },
  {
    "state": "not-run",
    "behavior": "Bounded Angular product suite for the block-ui family was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/block-ui/*.spec.ts'",
    "outcome": "not-run",
    "revision": "02810e3a8a6ca5ccf75eb596a1ddccdb86257c9b",
    "limitations": "Not run by instruction to avoid heavy local load (no ng test, build or Storybook); node_modules is absent in the worktree. No product or host repair attempted; presence of spec files is not pass evidence."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking @ultimate/ng test. This is workflow configuration evidence only, not a successful CI execution or branch-protection claim. Scoped inventory Node tests are not included in test:scripts (provenance-only glob).",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on classification scope != docs and !cancelled(); upstream steps/dependencies can prevent assertions. No remote CI observed."
  }
]
```
