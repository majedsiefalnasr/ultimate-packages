# Angular UConfirmPopup

ID: angular.confirm-popup

Framework: angular; availability: public

## Authored interpretation

Confirmation popup driven by UConfirmationService: a request whose key matches shows a panel (role alertdialog) positioned under confirmation.target with message, optional icon and reject/accept buttons.

## Framework surface

Selector u-confirm-popup; componentName confirmpopup; extends UBaseComponent. Input: key. No outputs. Injects UConfirmationService (ng-core, providedIn root); composes UOverlay and UButton. The constructor subscribes to requireConfirmation$: null calls hide(); a key equal to this.key() stores the confirmation and calls show(). The subscription is unsubscribed through destroyRef. show() sets visible and render, binds a document click listener and a window resize listener, registers an escape callback (ESCAPE_PRIORITIES.OVERLAY_PANEL with a per-class instanceCount uid) that calls onReject(), and aligns after the next render. align() places the container under confirmation.target (top = bottom + scrollY, left = left + scrollX) and calls ZIndex.set('overlay', ..., 1000); it does nothing when the confirmation has no target. A click outside the container and the target, and any window resize, call hide() and so close the popup; this hide() path does not call reject. onAccept and onReject run the callback, call confirmation.target?.focus() and then hide() (which also clears the confirmation). Template: a uOverlay div (appendTo body) with role=alertdialog and no aria-modal or aria-label; content with optional icon and message; a footer with reject (default 'No', hidden when rejectVisible is false) and accept (default 'Yes', hidden when acceptVisible is false) buttons. ngOnDestroy unbinds the listeners and unregisters the escape callback; it does not call ZIndex.clear. The instanceCount counter is private static to this class and shares the OVERLAY_PANEL key space with UPopover: a popover and a confirm popup that both hold uid 1 collide in escapeRegistry (the later register replaces the earlier callback, and either unregister removes the entry). Style module: confirm-popup-style.ts holds a local CSS string and exports confirmPopupStyleModule only. Entry points: re-exported by the root barrel packages/ng/src/index.ts only; there is no ./confirm-popup manifest subpath and no packages/ng/confirm-popup secondary entry-point directory. No dedicated @ultimate/uix-styles export exists for this family, so its CSS is a local string in the style module and no uix-styles relationship is linked. There is no component-metadata record for this family, so no metadata relationship is linked. Aura registry key: confirmpopup (differs from the confirm-popup folder name).

## Public exports

@ultimate/ng#UConfirmPopup

## Owned source and evidence

packages/ng/src/confirm-popup/index.ts
packages/ng/src/confirm-popup/confirm-popup.ts
packages/ng/src/confirm-popup/confirm-popup-style.ts

```text
packages/ng/src/confirm-popup/confirm-popup.ts: export class UConfirmPopup extends UBaseComponent
packages/ng/src/confirm-popup/confirm-popup.ts: role="alertdialog"
packages/ng/src/confirm-popup/confirm-popup.ts: if (confirmation.key === this.key()) {
packages/ng/src/confirm-popup/confirm-popup.ts: escapeRegistry.register(ESCAPE_PRIORITIES.OVERLAY_PANEL, this.instanceUid, () =>
packages/ng/src/confirm-popup/confirm-popup.ts: private static instanceCount = 0;
packages/ng/src/confirm-popup/confirm-popup.ts: confirmation?.target?.focus();
packages/ng/src/confirm-popup/confirm-popup.ts: ZIndex.set("overlay", content, 1000);
packages/ng/src/confirm-popup/confirm-popup-style.ts: export const confirmPopupStyleModule
packages/ng/src/confirm-popup/index.ts: export { UConfirmPopup }
packages/themes/src/presets/aura/index.ts:     confirmpopup: confirmPopup,
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
```

## Relationships

package.ultimate.ng.confirm-popup → [angular.confirm-popup](angular.confirm-popup.md) (reconciled family alias)
package.ultimate.ng.button (pending cross-batch)
package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.ng-core.overlay (pending cross-batch)
package.ultimate.ng-core.confirmation (pending cross-batch)
package.ultimate.uix-utils.escape (pending cross-batch)
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
    "behavior": "Bounded Angular product suite for the confirm-popup family was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/confirm-popup/*.spec.ts'",
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
