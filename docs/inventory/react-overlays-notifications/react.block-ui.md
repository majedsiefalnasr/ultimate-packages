# React UBlockUI

ID: react.block-ui

Framework: react; availability: public

## Authored interpretation

Wrapper that overlays its content with a blocking mask, optionally full screen with a body scroll lock.

## Framework surface

UBlockUI is React.forwardRef<HTMLDivElement, UBlockUIProps> and is not rendered through a portal. Barrel exports: UBlockUI and type UBlockUIProps. UBlockUIProps: blocked (default false), autoZIndex (true), baseZIndex (0), fullScreen (false), onBlocked, onUnblocked, children, className, style. The forwarded ref is the root div. State: a module-level counter instanceCount is incremented inside the useRef initial-value expression, which is evaluated on every render, so the counter advances on every render while only the first id is kept. An effect keyed on [blocked] (the hooks dependency rule is not satisfied) returns when blocked equals the previous value, so blocked on first render runs the block branch on mount: it registers a scroll lock when fullScreen, sets the "modal" z-index on the mask when autoZIndex, and calls onBlocked. The unblock branch unregisters the lock when fullScreen, clears the z-index and calls onUnblocked. The unmount cleanup unregisters the lock only when it was blocked and when fullScreen was set on the first render; it does not call clearZIndex. Z-index: baseZIndex defaults to 0 and is forwarded as the base value, so the modal bucket value of useZIndex is not used. The mask is removed on unblock before the effect runs, so the clear receives null and the ZIndex entry is never reverted. Rendering: the root div has aria-busy={blocked}; when blocked it renders a mask div after the children with no role, no aria-hidden and no content; children are not made inert. Style: CSS has exactly three rules, .u-blockui-container (position: relative), .u-blockui-mask (flex layout and a translucent background) and .u-blockui-mask-document (position: fixed covering the viewport); no CSS rule gives the non-fullScreen mask a position, so it follows the children in normal flow. Classes: root, mask. componentName block-ui is passed to useComponentBase together with blockUiStyleModule; the theme preset lookup uses that name as given and the Aura registry key blockui differs from the componentName block-ui, so the preset lookup by name does not resolve to the registry entry. blockUiStyleModule is an untyped style module (a plain { css, classes } object) exported from block-ui-style.ts and is not part of the package barrels. No @ultimate/uix-styles entry exists for block-ui; the style file says so in a comment and no source file in this family imports @ultimate/uix-styles.

## Public exports

@ultimate/react#UBlockUI
@ultimate/react/block-ui#UBlockUI
@ultimate/react#UBlockUIProps
@ultimate/react/block-ui#UBlockUIProps

## Owned source and evidence

packages/react/src/block-ui/index.ts
packages/react/src/block-ui/block-ui.tsx
packages/react/src/block-ui/block-ui-style.ts

```text
packages/react/src/block-ui/index.ts: export { UBlockUI } from
packages/react/src/block-ui/block-ui.tsx: let instanceCount = 0;
packages/react/src/block-ui/block-ui.tsx: `u-block-ui-${++instanceCount}`
packages/react/src/block-ui/block-ui.tsx: if (blocked === wasBlockedRef.current) {
packages/react/src/block-ui/block-ui.tsx: aria-busy={blocked}
packages/react/src/block-ui/block-ui.tsx: setZIndex("modal", maskRef.current, baseZIndex);
packages/react/src/block-ui/block-ui-style.ts: export const blockUiStyleModule = { css, classes };
packages/themes/src/presets/aura/index.ts:     blockui: blockUI,
packages/react/src/index.ts: export * from "./block-ui";
packages/react/package.json: "./block-ui": {
.github/workflows/ci.yml: run: pnpm run test
packages/react/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.react.block-ui → [react.block-ui](react.block-ui.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.react-core.zindex (pending cross-batch)
package.ultimate.react-core.scroll-lock (pending cross-batch)
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
