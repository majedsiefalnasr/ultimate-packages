# React UConfirmDialog

ID: react.confirm-dialog

Framework: react; availability: public

## Authored interpretation

Event-bus driven confirmation dialog composed from the dialog and button families, matched by group.

## Framework surface

UConfirmDialog is a plain function component, not a forwardRef. Barrel exports: UConfirmDialog and type UConfirmDialogProps (group?: string). The component subscribes to confirmationEventBus "confirm-dialog" in an effect and unsubscribes on cleanup. The handler sets confirmation to null when options.visible === false for any group, otherwise stores the options only when options.group === group. The callbacks accept and reject come from the stored options; onAccept calls accept then hides, onReject calls reject then hides. It always renders the composed UDialog (from ../dialog/dialog) with visible={confirmation !== null}, onHide set to hide, header from options.header, modal from options.modal ?? true, closeOnEscape from options.closeOnEscape ?? true and className cx("root"); dismissableMask, closable, showCloseIcon, blockScroll, appendTo, focusOnShow and baseZIndex are not passed. Escape handling and the close icon come from the composed UDialog and call hide, so the reject callback is not called; without options.header the composed dialog renders no header and therefore no close icon. The footer holds two UButton elements from ../button/button: reject (default label "No", severity secondary, text) unless rejectVisible === false, and accept (default label "Yes") unless acceptVisible === false. Because the footer reads confirmation?.… the labels fall back to "No" and "Yes" and the body empties while the composed dialog finishes its leave motion after hide. The icon option is rendered raw before a span with cx("message"); cx("icon") is never called although the style module defines the icon class. The options target is not read. Style: classes root, icon, message and footer; CSS rules exist for ".u-confirmdialog .u-dialog-content", u-confirmdialog-icon, u-confirmdialog-message and u-confirmdialog-footer. The confirmDialog() helper that emits the event lives in @ultimate/react-core, not in this family. componentName confirm-dialog is passed to useComponentBase together with confirmDialogStyleModule; the theme preset lookup uses that name as given and the Aura registry key confirmdialog differs from the componentName confirm-dialog, so the preset lookup by name does not resolve to the registry entry. confirmDialogStyleModule is a typed StyleModule exported from confirm-dialog-style.ts and is not part of the package barrels.

## Public exports

@ultimate/react#UConfirmDialog
@ultimate/react/confirm-dialog#UConfirmDialog
@ultimate/react#UConfirmDialogProps
@ultimate/react/confirm-dialog#UConfirmDialogProps

## Owned source and evidence

packages/react/src/confirm-dialog/index.ts
packages/react/src/confirm-dialog/confirm-dialog.tsx
packages/react/src/confirm-dialog/confirm-dialog-style.ts

```text
packages/react/src/confirm-dialog/index.ts: export { UConfirmDialog } from
packages/react/src/confirm-dialog/confirm-dialog.tsx: export function UConfirmDialog(
packages/react/src/confirm-dialog/confirm-dialog.tsx: options.visible === false
packages/react/src/confirm-dialog/confirm-dialog.tsx: options.group === group
packages/react/src/confirm-dialog/confirm-dialog.tsx: closeOnEscape={confirmation?.closeOnEscape ?? true}
packages/react/src/confirm-dialog/confirm-dialog.tsx: confirmation?.rejectLabel ?? "No"
packages/react/src/confirm-dialog/confirm-dialog.tsx: <span className={cx("message")}>
packages/react/src/confirm-dialog/confirm-dialog-style.ts: export const confirmDialogStyleModule: StyleModule
packages/themes/src/presets/aura/index.ts:     confirmdialog: confirmDialog,
packages/react/src/index.ts: export * from "./confirm-dialog";
packages/react/package.json: "./confirm-dialog": {
.github/workflows/ci.yml: run: pnpm run test
packages/react/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.react.confirm-dialog → [react.confirm-dialog](react.confirm-dialog.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.react-core.confirmation (pending cross-batch)
package.ultimate.react.button (pending cross-batch)
package.ultimate.react.dialog → [react.dialog](react.dialog.md) (reconciled family alias)
package.ultimate.themes.presets (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Component, declared props and local style module exist in source with a colocated spec; source inspection is not a passing test."
  },
  {
    "state": "not-run",
    "behavior": "Bounded React product specs for the overlay and notification families were not executed for this inventory.",
    "command": "pnpm --filter @ultimate/react exec vitest run src/dialog/ src/drawer/ src/popover/ src/confirm-dialog/ src/confirm-popup/ src/tooltip/ src/toast/ src/message/ src/block-ui/",
    "outcome": "not-run",
    "revision": "7b296258f469ba37ed2367cafbf3f2dbf95398f0",
    "limitations": "Not run by instruction to avoid heavy local load (no vitest, build or Storybook); node_modules is absent in the worktree. No product or host repair attempted; presence of spec files is not pass evidence."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking the @ultimate/react test script (vitest run). This is workflow configuration evidence only, not a successful CI execution or branch-protection claim. Scoped inventory Node tests are not included in test:scripts (provenance-only glob).",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on classification scope != docs and !cancelled(); upstream steps/dependencies can prevent assertions. No remote CI observed."
  }
]
```
