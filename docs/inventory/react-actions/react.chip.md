# React UChip

ID: react.chip

Framework: react; availability: public

## Authored interpretation

Compact item/person label with optional image or icon, custom content, a removable control and uncontrolled removable visibility.

## Framework surface

UChip and UChipProps forward an HTMLDivElement ref. UChipProps extends the div attributes (without children). Props: label, icon (CSS classes), image, alt, disabled, removable, removeAriaLabel (default the English "Remove"), removeIcon (a font class string or an element), template (a node, or a function of the props, replacing the image, icon and label), onRemove, onImageError, className, unstyled, pt and ptOptions. The remaining props and ptm(root) are merged onto the root, so a consumer aria-label replaces the label-derived one. Pass-through sections root, image, icon, label and removeIcon, registered under chip. The root carries data-p=removable while removable and the p-disabled class while disabled. Image takes priority over icon; label renders independently. Internal close/onKeyDown and visible state own removal; click, Enter or Backspace hides the chip before onRemove unless disabled, with the native event and no veto. The remove span is role=button with tabIndex -1 when disabled, otherwise 0. The default glyph is UTimesIcon. chipStyleModule's css is the shared @ultimate/uix-styles/chip module (ADR-082, ADR-098) on the Aura chip tokens (ADR-067); the hand-written CSS and the --u-chip-* fallbacks are gone. useComponentBase from @ultimate/react-core owns cx class resolution and the unstyled and per-instance style handling; those hooks are external foundation records, not duplicated here. Public runtime and props type are named exports from both @ultimate/react and @ultimate/react/chip. The manifest advertises dist entry/type paths; this does not prove a built or published package. No dedicated record for this family is present in the current metadata registry; no metadata association is inferred from its name.

## Public exports

@ultimate/react#UChip
@ultimate/react#UChipProps
@ultimate/react/chip#UChip
@ultimate/react/chip#UChipProps

## Owned source and evidence

packages/react/src/chip/index.ts
packages/react/src/chip/chip.tsx
packages/react/src/chip/chip-style.ts

```text
packages/react/src/chip/chip.tsx: export interface UChipProps
packages/react/src/chip/chip-style.ts: export const chipStyleModule
packages/react/src/index.ts: export * from "./chip";
packages/react/src/chip/chip.tsx: createPassThrough("chip"
packages/react/src/chip/chip-style.ts: @ultimate/uix-styles/chip
```

## Relationships

package.ultimate.react.chip → [react.chip](react.chip.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.react-core.icons (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Forward-ref component, declared props, local style module and described composition exist in source; not behavioral proof."
  },
  {
    "state": "unavailable",
    "behavior": "Bounded existing product tests aborted before assertions.",
    "command": "pnpm --filter @ultimate/react exec vitest run src/button/ src/button-group/ src/split-button/ src/avatar/ src/avatar-group/ src/chip/ src/tag/ src/toolbar/",
    "outcome": "unavailable",
    "revision": "c7a8d706e9ebfb22ebf6cc6635a77819cce95576",
    "limitations": "Host ancestor PostCSS configuration requires unavailable postcss-import. No product assertions executed, no browser/build/publish coverage; external configuration and product left unchanged.",
    "output": "Failed to load PostCSS config: Loading PostCSS Plugin failed: Cannot find module 'postcss-import'; Require stack: /Users/majedsiefalnasr/postcss.config.mjs; exit 1"
  }
]
```
