# React UDrawer

ID: react.drawer

Framework: react; availability: public

## Authored interpretation

Edge-anchored panel with five positions, mask dismissal, escape handling, focus trap and z-index stacking, rendered into a portal.

## Framework surface

UDrawer is a plain function component, not a forwardRef, rendered through Portal without appendTo. Barrel exports: UDrawer and type UDrawerProps. UDrawerProps: visible and onHide are required; header, children; position ("left" default, right, top, bottom, full); modal (default true), dismissible (true), closable (true), closeOnEscape (true); baseZIndex. There is no footer prop, scroll lock, appendTo or motion. Rendering: UDrawer returns null when visible is false. The mask is rendered whether or not modal is set (its CSS is position: fixed; inset: 0). Mask dismissal needs onMouseDown and onMouseUp on the mask itself with the same target, and dismissible && modal. Escape: useGlobalEscapeKey with priority [ESCAPE_PRIORITIES.SIDEBAR, displayOrder] while visible && closeOnEscape, calling onHide. The content is wrapped in a FocusTrap without autoFocus. The root has role="complementary" and no accessible name. Structure: the header div is always rendered; the title span only when header !== undefined; the close button (aria-label "Close", UTimesIcon) whenever closable is set, with or without a header; an empty footer div is always rendered. Z-index: a useUpdateEffect on [visible, portalReady] sets the "modal" z-index on the mask when visible and calls clearZIndex(maskRef.current) otherwise; portalReady is set true by Portal onMount and is never reset. The mask is created by Portal one render after the effect runs, so the effect that runs when visible changes sees a null ref and only the re-run caused by portalReady turning true on the first open sets a z-index; later opens leave the mask without an inline z-index. When visible turns false the mask is already removed, so the clear receives null and the ZIndex entry is never reverted. The unmount cleanup receives null for the mask ref for the same reason. Style: classes mask, root, header, title, closeButton, content and footer; CSS rules exist for u-drawer-mask, u-drawer, the five u-drawer-position-* classes, u-drawer-header, u-drawer-content and u-drawer-footer, where the footer rule is an empty rule; no rule exists for u-drawer-title or u-drawer-close-button. componentName drawer is passed to useComponentBase together with drawerStyleModule; the theme preset lookup uses that name as given and the Aura registry key drawer matches it. drawerStyleModule is a typed StyleModule exported from drawer-style.ts and is not part of the package barrels.

## Public exports

@ultimate/react#UDrawer
@ultimate/react/drawer#UDrawer
@ultimate/react#UDrawerProps
@ultimate/react/drawer#UDrawerProps

## Owned source and evidence

packages/react/src/drawer/index.ts
packages/react/src/drawer/drawer.tsx
packages/react/src/drawer/drawer-style.ts

```text
packages/react/src/drawer/index.ts: export { UDrawer } from
packages/react/src/drawer/drawer.tsx: export function UDrawer(
packages/react/src/drawer/drawer.tsx: role="complementary"
packages/react/src/drawer/drawer.tsx: onMouseUp={onMaskMouseUp}
packages/react/src/drawer/drawer.tsx: <div className={cx("footer")}></div>
packages/react/src/drawer/drawer.tsx: const closeButton = closable && (
packages/react/src/drawer/drawer-style.ts: export const drawerStyleModule: StyleModule
packages/themes/src/presets/aura/index.ts:     drawer,
packages/react/src/index.ts: export * from "./drawer";
packages/react/package.json: "./drawer": {
.github/workflows/ci.yml: run: pnpm run test
packages/react/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.react.drawer → [react.drawer](react.drawer.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.react-core.overlay (pending cross-batch)
package.ultimate.react-core.escape (pending cross-batch)
package.ultimate.react-core.focus-trap (pending cross-batch)
package.ultimate.react-core.zindex (pending cross-batch)
package.ultimate.react-core.icons (pending cross-batch)
package.ultimate.react-core.hooks (pending cross-batch)
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
