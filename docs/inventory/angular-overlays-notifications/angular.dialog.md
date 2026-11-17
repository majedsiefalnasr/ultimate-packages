# Angular UDialog

ID: angular.dialog

Framework: angular; availability: public

## Authored interpretation

Modal or non-modal dialog shell: a controlled visible input renders a mask and panel with optional header, projected content and a [dialogFooter] slot, and reports close requests through visibleChange.

## Framework surface

Selector u-dialog; componentName dialog; extends UBaseComponent. Inputs: visible (false), header, closable (true), closeOnEscape (true), modal (true) and role ('dialog' or 'alertdialog', default 'dialog'). Outputs: visibleChange (boolean), onShow and onHide. Injects ComponentIdGenerator without a default: the app must provide it (ng-core ComponentIdGenerator has no providedIn), otherwise construction throws NullInjectorError. The aria-labelledby id is `${next('u_dialog')}_header`. Template: while renderMask is true a mask div with uOverlay (appendTo body) wraps a root div carrying [attr.role], [attr.aria-modal]=modal() and aria-labelledby only when header is set; inside it a uFocusTrap div bound with [uFocusTrapDisabled]=!modal(). The header block, including the title span and the close button, is rendered only inside @if (header()), so with no header there is no close button even when closable is true. The footer div is always rendered and projects [dialogFooter]. visibleChange is the only close channel: close() and the Escape callback emit visibleChange(false); the component never sets visible itself, so the consumer controls it. There is no mask-click dismissal, and no drag, resize, maximize or position input. Visibility effect: on the server it only mirrors visible into renderMask. In the browser every run calls syncEscapeRegistration (displayOrderRegistry plus escapeRegistry.register with ESCAPE_PRIORITIES.DIALOG, whose callback emits visibleChange(false) only when closeOnEscape is true, so only the highest-ordered registered dialog receives Escape) and syncScrollLock (scroll lock: scrollLockRegistry.register while visible, unregister otherwise, with a Math.random id). On opening it records document.activeElement, sets renderMask and, after the next render, runs an enter motion (createMotion name u-dialog, onShow emitted when it resolves unless destroyed; onShow is emitted immediately when no root element exists). On closing it runs the leave motion (renderMask is cleared immediately when no motion instance exists, otherwise after it resolves unless destroyed), restores focus to the recorded element and emits onHide synchronously, before the leave motion finishes. The dialog does not move focus into itself when opened; focus entry is left to the content, and the focus trap only wraps Tab at the edges (ng-core, not read here beyond its call site). ngOnDestroy unregisters escape and display order if registered and always calls scrollLockRegistry.unregister; destroyRef.onDestroy only sets a destroyed flag. Style module: dialog-style.ts imports the CSS from @ultimate/uix-styles/dialog and exports DialogClassesParams ({modal?}) and dialogStyleModule; the classes object names resizeHandle (p-resizable-handle) and pcMaximizeButton that this template does not render. Entry points: re-exported by the root barrel packages/ng/src/index.ts only; there is no ./dialog manifest subpath and no packages/ng/dialog secondary entry-point directory. Metadata: DIALOG_METADATA exists in packages/component-metadata/src/records/dialog.ts with this component as its source path, and dialog.api.mdx is a generated page excluded from this record's files. Aura registry key: dialog.

## Public exports

@ultimate/ng#UDialog

## Owned source and evidence

packages/ng/src/dialog/index.ts
packages/ng/src/dialog/dialog.ts
packages/ng/src/dialog/dialog-style.ts

```text
packages/ng/src/dialog/dialog.ts: export class UDialog extends UBaseComponent
packages/ng/src/dialog/dialog.ts: private readonly idGenerator = inject(ComponentIdGenerator);
packages/ng/src/dialog/dialog.ts: <div uFocusTrap [uFocusTrapDisabled]="!modal()">
packages/ng/src/dialog/dialog.ts: [attr.aria-labelledby]="header() ? ariaLabelledBy : null"
packages/ng/src/dialog/dialog.ts: escapeRegistry.register(ESCAPE_PRIORITIES.DIALOG, this.registeredDisplayOrder, () => {
packages/ng/src/dialog/dialog.ts: scrollLockRegistry.register(this.scrollLockId);
packages/ng/src/dialog/dialog.ts: this.triggerElement?.focus();
packages/ng/src/dialog/dialog.ts: this.motion = createMotion(el, { name: "u-dialog", appear: true });
packages/ng/src/dialog/dialog-style.ts: @ultimate/uix-styles/dialog
packages/ng/src/dialog/dialog-style.ts: export interface DialogClassesParams
packages/ng/src/dialog/dialog-style.ts: export const dialogStyleModule
packages/uix-styles/package.json: "./dialog": {
packages/component-metadata/src/records/dialog.ts: export const DIALOG_METADATA
packages/ng/src/dialog/index.ts: export { UDialog }
packages/themes/src/presets/aura/index.ts:     dialog,
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
```

## Relationships

package.ultimate.ng.dialog → [angular.dialog](angular.dialog.md) (reconciled family alias)
package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.ng-core.overlay (pending cross-batch)
package.ultimate.ng-core.focus-trap (pending cross-batch)
package.ultimate.ng-core.id (pending cross-batch)
package.ultimate.ng.button (pending cross-batch)
package.ultimate.uix-utils.escape (pending cross-batch)
package.ultimate.uix-utils.scroll-lock (pending cross-batch)
package.ultimate.uix-motion.config (pending cross-batch)
package.ultimate.uix-styles.dialog (pending cross-batch)
package.ultimate.component-metadata.records (pending cross-batch)
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
    "behavior": "Bounded Angular product suite for the dialog family was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/dialog/*.spec.ts'",
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
