# React UDialog

ID: react.dialog

Framework: react; availability: public

## Authored interpretation

Modal dialog with header, footer, escape and mask dismissal, optional scroll lock, z-index stacking, leave motion and focus restore, rendered into a portal.

## Framework surface

UDialog is a plain function component, not a forwardRef, rendered through Portal with the appendTo prop forwarded and onMount flipping an internal portalReady flag. Barrel exports: UDialog and type UDialogProps. UDialogProps: visible and onHide are required (onHide receives an optional event); header, footer and children are nodes; modal (default true), closable (true), showCloseIcon (true), closeOnEscape (false), dismissableMask (false), blockScroll (false), focusOnShow (true); baseZIndex, appendTo (an element or a function returning one), className, style and id. State: containerVisible starts from visible, gates mounting, and stays true through the leave motion, so UDialog returns null only when containerVisible is false. Escape: useGlobalEscapeKey is registered with priority [ESCAPE_PRIORITIES.DIALOG, displayOrder] only while closable && closeOnEscape && visible, and calls onHide. Mask: the mask element is rendered whether or not modal is set; its onPointerUp calls onHide only when dismissableMask && modal && the mask itself is the event target. The content sits inside a FocusTrap with autoFocus={focusOnShow}. Accessibility: the root has role="dialog" and aria-modal={modal}; aria-labelledby (id plus _header) and aria-describedby (id plus _content) are always set, so aria-labelledby points at an id that does not exist when header is undefined. The header block is rendered only when header !== undefined, and the close button (hard-coded aria-label "Close", UTimesIcon) lives inside that block and is rendered only when closable && showCloseIcon, so without a header there is no close button whatever closable is. The footer is rendered only when footer !== undefined. Motion and side effects: a useUpdateEffect (it skips the first run) records document.activeElement when visible becomes true, so a dialog that is visible on first render records no element to restore. A second useUpdateEffect on [visible, containerVisible, portalReady] sets the "modal" z-index on the mask and registers a scroll lock when blockScroll is set. useMotion (name u-dialog) runs onAfterLeave, which clears the z-index, unregisters the lock, resets containerVisible and portalReady, and restores focus. onAfterLeave does not call onHide; the metadata record text for onHide (packages/component-metadata/src/records/dialog.ts, repeated in dialog.api.mdx) says onHide also fires when the leave motion completes, which the source does not do. Cleanup: the useUnmountEffect cleanup is the first-render closure and calls clearZIndex(maskRef.current) and, if blockScroll was set on the first render, unregisters the lock for the first-render id; refs are detached before passive unmount cleanups run, so the unmount cleanup receives null for the mask ref and ZIndex.clear does nothing. Closing through the motion path reverts the stack; unmounting while open does not. Style: classes mask, root, header, headerTitle, headerIcons, closeButton, closeButtonIcon, content and footer; CSS rules exist for u-dialog-mask, u-dialog, u-dialog-header, u-dialog-content and u-dialog-footer, and no rule exists for u-dialog-header-title, u-dialog-header-icons, u-dialog-close-button or u-dialog-close-icon. Links: @ultimate/component-metadata has a Dialog record (source map points at dialog.tsx) and @ultimate/uix-styles has a dialog entry; this source imports neither. dialog.api.mdx is generated documentation and is excluded. componentName dialog is passed to useComponentBase together with dialogStyleModule; the theme preset lookup uses that name as given and the Aura registry key dialog matches it. dialogStyleModule is a typed StyleModule exported from dialog-style.ts and is not part of the package barrels.

## Public exports

@ultimate/react#UDialog
@ultimate/react/dialog#UDialog
@ultimate/react#UDialogProps
@ultimate/react/dialog#UDialogProps

## Owned source and evidence

packages/react/src/dialog/index.ts
packages/react/src/dialog/dialog.tsx
packages/react/src/dialog/dialog-style.ts

```text
packages/react/src/dialog/index.ts: export { UDialog } from
packages/react/src/dialog/dialog.tsx: export function UDialog(
packages/react/src/dialog/dialog.tsx: useGlobalEscapeKey({
packages/react/src/dialog/dialog.tsx: aria-labelledby={headerId}
packages/react/src/dialog/dialog.tsx: header !== undefined &&
packages/react/src/dialog/dialog.tsx: closable && showCloseIcon &&
packages/react/src/dialog/dialog.tsx: dismissableMask && modal && maskRef.current === event.target
packages/react/src/dialog/dialog.tsx: onAfterLeave: () => {
packages/react/src/dialog/dialog.tsx: useUnmountEffect(() => {
packages/react/src/dialog/dialog-style.ts: export const dialogStyleModule: StyleModule
packages/themes/src/presets/aura/index.ts:     dialog,
packages/react/src/index.ts: export * from "./dialog";
packages/react/package.json: "./dialog": {
.github/workflows/ci.yml: run: pnpm run test
packages/react/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.react.dialog → [react.dialog](react.dialog.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.react-core.overlay (pending cross-batch)
package.ultimate.react-core.escape (pending cross-batch)
package.ultimate.react-core.focus-trap (pending cross-batch)
package.ultimate.react-core.zindex (pending cross-batch)
package.ultimate.react-core.scroll-lock (pending cross-batch)
package.ultimate.react-core.motion (pending cross-batch)
package.ultimate.react-core.icons (pending cross-batch)
package.ultimate.react-core.hooks (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.component-metadata.records (pending cross-batch)

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
