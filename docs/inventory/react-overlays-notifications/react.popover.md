# React UPopover

ID: react.popover

Framework: react; availability: public

## Authored interpretation

Anchored popover controlled through an imperative handle, positioned below its target and dismissed by outside click, resize or Escape.

## Framework surface

UPopover is React.forwardRef<UPopoverHandle, UPopoverProps>, rendered through Portal without appendTo. Barrel exports: UPopover and types UPopoverProps and UPopoverHandle. UPopoverProps: dismissable (default true), onShow, onHide, children. UPopoverHandle: toggle(event, target?), show(event, target?) and hide(), exposed through useImperativeHandle without a dependency array. show calls event.stopPropagation(), sets the target to target ?? event.currentTarget ?? event.target, then sets visible and calls onShow; toggle branches on the current visible; hide sets visible false and calls onHide, so hide() calls onHide even when already hidden. Dismissal: Escape hides regardless of dismissable (useGlobalEscapeKey with priority [ESCAPE_PRIORITIES.OVERLAY_PANEL, displayOrder] while visible); useOverlayListener hides on an outside click only when dismissable and on window resize always. Placement: align() computes top and left from the target rectangle plus scroll offsets and sets the "overlay" z-index, but align() returns early because contentRef.current is null when the effect runs: Portal is remounted on every open and renders its children one render after the effect, so no inline top, left or z-index is ever set by UPopover (the effect depends only on visible and stable callbacks and does not re-run once the panel exists). The effect cleanup calls clearZIndex only in the cleanup of an effect run made while hidden, which runs when the popover opens and still sees a null ref, so no clear ever reaches the panel element. The panel is positioned only by the CSS rule position: absolute; top: 0; left: 0. Accessibility: the panel has role="dialog" and aria-modal={visible}, which is always true while rendered, and has no accessible name, focus trap or focus restore. Style: classes root and content; CSS rules exist for both u-popover and u-popover-content. componentName popover is passed to useComponentBase together with popoverStyleModule; the theme preset lookup uses that name as given and the Aura registry key popover matches it. popoverStyleModule is a typed StyleModule exported from popover-style.ts and is not part of the package barrels.

## Public exports

@ultimate/react#UPopover
@ultimate/react/popover#UPopover
@ultimate/react#UPopoverProps
@ultimate/react/popover#UPopoverProps
@ultimate/react#UPopoverHandle
@ultimate/react/popover#UPopoverHandle

## Owned source and evidence

packages/react/src/popover/index.ts
packages/react/src/popover/popover.tsx
packages/react/src/popover/popover-style.ts

```text
packages/react/src/popover/index.ts: export { UPopover } from
packages/react/src/popover/popover.tsx: React.forwardRef<UPopoverHandle, UPopoverProps>
packages/react/src/popover/popover.tsx: React.useImperativeHandle(ref, () => ({ toggle, show, hide }));
packages/react/src/popover/popover.tsx: if (!content || !target) return;
packages/react/src/popover/popover.tsx: if (!visible) clearZIndex(contentRef.current);
packages/react/src/popover/popover.tsx: meta.type === "resize" || dismissable
packages/react/src/popover/popover.tsx: role="dialog" aria-modal={visible}
packages/react/src/popover/popover-style.ts: export const popoverStyleModule: StyleModule
packages/themes/src/presets/aura/index.ts:     popover,
packages/react/src/index.ts: export * from "./popover";
packages/react/package.json: "./popover": {
.github/workflows/ci.yml: run: pnpm run test
packages/react/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.react.popover → [react.popover](react.popover.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.react-core.overlay (pending cross-batch)
package.ultimate.react-core.escape (pending cross-batch)
package.ultimate.react-core.zindex (pending cross-batch)
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
