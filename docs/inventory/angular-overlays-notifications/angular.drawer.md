# Angular UDrawer

ID: angular.drawer

Framework: angular; availability: public

## Authored interpretation

Edge-anchored panel: a controlled visible input renders a mask and a panel positioned left, right, top, bottom or full, with header, content and a [drawerFooter] slot.

## Framework surface

Selector u-drawer; componentName drawer; extends UBaseComponent. Inputs: visible (false), header, position ('left','right','top','bottom','full'; default 'left'), modal (true), dismissible (true), closable (true), closeOnEscape (true). Outputs: visibleChange, onShow, onHide. Does not inject ComponentIdGenerator. Template: a uOverlay mask (appendTo body) with mousedown and mouseup handlers around a root div with role=complementary and a keydown handler (onKeyDown); inside it a uFocusTrap div with no disabled binding, so the trap is on whether or not modal is set. The header div is always rendered, the title span only when header is set, and the close button only when closable is true. No aria-modal, aria-label or aria-labelledby is bound. applyVisible(visible) is driven by an effect on visible: opening sets renderMask, registers an escape callback (ESCAPE_PRIORITIES.SIDEBAR with a per-class instanceCount uid) and emits onShow synchronously; closing clears renderMask, unregisters and emits onHide. There is no motion, focus restore or scroll lock. The public close() emits visibleChange(false) and also calls applyVisible(false), so the drawer closes locally even if the parent keeps visible true. Escape has two paths, and both paths call close() when closeOnEscape is true: onKeyDown (only for keydown events dispatched inside the root div) and the document-level escapeRegistry callback. For a keydown inside the root div, onKeyDown runs before the document listener and close() synchronously unregisters the registry callback, so that keypress emits visibleChange(false) once; the registry path is reached only when the event target is outside the root div, and an open dialog or popover (higher priorities) takes the registry Escape first. Mask dismissal needs dismissible and modal both true and requires mousedown and mouseup to both target the mask element itself. ngOnDestroy only unregisters the escape callback. The instanceCount counter is private static to this class. Style module: drawer-style.ts keeps the CSS as a local string (selectors include .u-drawer > [ufocustrap] and .u-drawer-mask:dir(rtl)) and exports DrawerClassesParams ({position?}) and drawerStyleModule. Entry points: re-exported by the root barrel packages/ng/src/index.ts only; there is no ./drawer manifest subpath and no packages/ng/drawer secondary entry-point directory. No dedicated @ultimate/uix-styles export exists for this family, so its CSS is a local string in the style module and no uix-styles relationship is linked. There is no component-metadata record for this family, so no metadata relationship is linked. Aura registry key: drawer.

## Public exports

@ultimate/ng#UDrawer

## Owned source and evidence

packages/ng/src/drawer/index.ts
packages/ng/src/drawer/drawer.ts
packages/ng/src/drawer/drawer-style.ts

```text
packages/ng/src/drawer/drawer.ts: export class UDrawer extends UBaseComponent
packages/ng/src/drawer/drawer.ts: role="complementary"
packages/ng/src/drawer/drawer.ts: <div uFocusTrap>
packages/ng/src/drawer/drawer.ts: escapeRegistry.register(ESCAPE_PRIORITIES.SIDEBAR, this.instanceUid, () => {
packages/ng/src/drawer/drawer.ts: private static instanceCount = 0;
packages/ng/src/drawer/drawer.ts: this.visibleChange.emit(false);
    this.applyVisible(false);
packages/ng/src/drawer/drawer.ts: if (event.code === "Escape" && this.closeOnEscape()) {
packages/ng/src/drawer/drawer.ts: event.target === this.maskMouseDownTarget
packages/ng/src/drawer/drawer-style.ts: export interface DrawerClassesParams
packages/ng/src/drawer/drawer-style.ts: export const drawerStyleModule
packages/ng/src/drawer/index.ts: export { UDrawer }
packages/themes/src/presets/aura/index.ts:     drawer,
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
```

## Relationships

package.ultimate.ng.drawer → [angular.drawer](angular.drawer.md) (reconciled family alias)
package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.ng-core.overlay (pending cross-batch)
package.ultimate.ng-core.focus-trap (pending cross-batch)
package.ultimate.ng.button (pending cross-batch)
package.ultimate.uix-utils.escape (pending cross-batch)
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
    "behavior": "Bounded Angular product suite for the drawer family was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/drawer/*.spec.ts'",
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
