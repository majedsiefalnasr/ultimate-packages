# Angular UConfirmDialog

ID: angular.confirm-dialog

Framework: angular; availability: public

## Authored interpretation

Confirmation dialog driven by UConfirmationService: a request whose key matches opens a UDialog (role alertdialog) with message, optional icon and reject/accept buttons.

## Framework surface

Selector u-confirm-dialog; componentName confirmdialog; extends UBaseComponent. Input: key. No outputs. Injects UConfirmationService (ng-core, providedIn root) and composes UDialog and UButton, so it inherits UDialog's requirement for a provided ComponentIdGenerator. The constructor subscribes to requireConfirmation$: a null emission sets visible false only (the confirmation signal is not cleared on that path); an emission whose key equals this.key() (undefined matches undefined) stores it and sets visible true; other keys are ignored. The subscription is unsubscribed through destroyRef. Template: u-dialog bound with role 'alertdialog', closable true, header from the confirmation, modal = confirmation.modal ?? true and closeOnEscape = confirmation.closeOnEscape ?? true. Content: an icon <i> when confirmation.icon is set, the message span, and a footer div[dialogFooter] with a reject button (text, secondary; label default 'No'; hidden when rejectVisible is false) and an accept button (default 'Yes'; hidden when acceptVisible is false). The dialog's close button appears only when the confirmation has a header. confirmation.target is not read. onAccept and onReject run the callback and then hide() (visible false, confirmation null). A dialog-originated close (Escape or close button) goes through onDialogVisibleChange(false) to hide() without calling reject. The service-side close() sends null. Style module: confirm-dialog-style.ts holds a local CSS string (one selector uses :has(> .u-confirmdialog-message)) and exports confirmDialogStyleModule only. Entry points: re-exported by the root barrel packages/ng/src/index.ts only; there is no ./confirm-dialog manifest subpath and no packages/ng/confirm-dialog secondary entry-point directory. No dedicated @ultimate/uix-styles export exists for this family, so its CSS is a local string in the style module and no uix-styles relationship is linked. There is no component-metadata record for this family, so no metadata relationship is linked. Aura registry key: confirmdialog (differs from the confirm-dialog folder name).

## Public exports

@ultimate/ng#UConfirmDialog

## Owned source and evidence

packages/ng/src/confirm-dialog/index.ts
packages/ng/src/confirm-dialog/confirm-dialog.ts
packages/ng/src/confirm-dialog/confirm-dialog-style.ts

```text
packages/ng/src/confirm-dialog/confirm-dialog.ts: export class UConfirmDialog extends UBaseComponent
packages/ng/src/confirm-dialog/confirm-dialog.ts: [role]="'alertdialog'"
packages/ng/src/confirm-dialog/confirm-dialog.ts: if (confirmation.key === this.key()) {
packages/ng/src/confirm-dialog/confirm-dialog.ts: this.destroyRef.onDestroy(() => subscription.unsubscribe());
packages/ng/src/confirm-dialog/confirm-dialog.ts: protected onDialogVisibleChange(value: boolean): void {
packages/ng/src/confirm-dialog/confirm-dialog.ts: confirmation()?.rejectVisible !== false
packages/ng/src/confirm-dialog/confirm-dialog-style.ts: export const confirmDialogStyleModule
packages/ng/src/confirm-dialog/index.ts: export { UConfirmDialog }
packages/themes/src/presets/aura/index.ts:     confirmdialog: confirmDialog,
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
```

## Relationships

package.ultimate.ng.confirm-dialog → [angular.confirm-dialog](angular.confirm-dialog.md) (reconciled family alias)
package.ultimate.ng.dialog → [angular.dialog](angular.dialog.md) (reconciled family alias)
package.ultimate.ng.button (pending cross-batch)
package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.ng-core.confirmation (pending cross-batch)
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
    "behavior": "Bounded Angular product suite for the confirm-dialog family was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/confirm-dialog/*.spec.ts'",
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
