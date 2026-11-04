# React UConfirmPopup

ID: react.confirm-popup

Framework: react; availability: public

## Authored interpretation

Event-bus driven confirmation popup anchored to a target element, matched by group, with accept and reject buttons.

## Framework surface

UConfirmPopup is a plain function component, not a forwardRef, rendered through Portal without appendTo. Barrel exports: UConfirmPopup and type UConfirmPopupProps (group?: string). It subscribes to confirmationEventBus "confirm-popup" like UConfirmDialog: visible === false hides for any group, otherwise the options are stored only when options.group === group. It reads message, icon, accept, reject, acceptLabel, rejectLabel, acceptVisible, rejectVisible and target, and ignores header, modal and closeOnEscape. Behaviour: Escape calls the reject callback, focuses the target and hides (useGlobalEscapeKey with priority [ESCAPE_PRIORITIES.OVERLAY_PANEL, displayOrder] while a confirmation is shown); onAccept calls accept, focuses the target and hides; outside click or resize hides without calling reject or restoring focus, and an outside click is ignored when the confirmation has no target because useOverlayListener treats a missing target as not outside. Placement: align() returns early while contentRef.current is null, which is the case when the effect runs for a first confirmation because Portal renders its children one render later; the effect re-runs with the panel attached, and align() positions the panel only when a new confirmation replaces an open one (top and left from the target rectangle plus scroll offsets, "overlay" z-index). That ZIndex entry is never reverted: the cleanup guard if (!confirmation) clearZIndex(...) belongs to the run that was made with a confirmation, so it does not clear when the confirmation is hidden or replaced. Structure: role="alertdialog" without accessible name or description, no focus trap or initial focus; the icon is rendered raw and cx("icon") is never called; footer buttons are the same UButton reject ("No", secondary, text) and accept ("Yes") pair as UConfirmDialog. Style: classes root, content, icon, message and footer; CSS rules exist for u-confirmpopup, u-confirmpopup-content and u-confirmpopup-footer, and none for u-confirmpopup-icon or u-confirmpopup-message. componentName confirm-popup is passed to useComponentBase together with confirmPopupStyleModule; the theme preset lookup uses that name as given and the Aura registry key confirmpopup differs from the componentName confirm-popup, so the preset lookup by name does not resolve to the registry entry. confirmPopupStyleModule is a typed StyleModule exported from confirm-popup-style.ts and is not part of the package barrels.

## Public exports

@ultimate/react#UConfirmPopup
@ultimate/react/confirm-popup#UConfirmPopup
@ultimate/react#UConfirmPopupProps
@ultimate/react/confirm-popup#UConfirmPopupProps

## Owned source and evidence

packages/react/src/confirm-popup/index.ts
packages/react/src/confirm-popup/confirm-popup.tsx
packages/react/src/confirm-popup/confirm-popup-style.ts

```text
packages/react/src/confirm-popup/index.ts: export { UConfirmPopup } from
packages/react/src/confirm-popup/confirm-popup.tsx: export function UConfirmPopup(
packages/react/src/confirm-popup/confirm-popup.tsx: callback: () => onReject(),
packages/react/src/confirm-popup/confirm-popup.tsx: if (meta.valid) hide();
packages/react/src/confirm-popup/confirm-popup.tsx: if (!confirmation) clearZIndex(contentRef.current);
packages/react/src/confirm-popup/confirm-popup.tsx: role="alertdialog"
packages/react/src/confirm-popup/confirm-popup.tsx: confirmation.rejectLabel ?? "No"
packages/react/src/confirm-popup/confirm-popup-style.ts: export const confirmPopupStyleModule: StyleModule
packages/themes/src/presets/aura/index.ts:     confirmpopup: confirmPopup,
packages/react/src/index.ts: export * from "./confirm-popup";
packages/react/package.json: "./confirm-popup": {
.github/workflows/ci.yml: run: pnpm run test
packages/react/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.react.confirm-popup → [react.confirm-popup](react.confirm-popup.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.react-core.overlay (pending cross-batch)
package.ultimate.react-core.escape (pending cross-batch)
package.ultimate.react-core.zindex (pending cross-batch)
package.ultimate.react-core.confirmation (pending cross-batch)
package.ultimate.react.button (pending cross-batch)
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
