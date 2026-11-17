# React UChip

ID: react.chip

Framework: react; availability: public

## Authored interpretation

Compact item/person label with optional image or icon and uncontrolled removable visibility.

## Framework surface

UChip and UChipProps forward HTMLDivElement ref. Props: label, icon:string (CSS classes, not ReactNode), image, alt, disabled, removable, removeAriaLabel, onRemove:(MouseEvent|KeyboardEvent)=>void, onImageError:(SyntheticEvent<HTMLImageElement>)=>void, className. No native div attributes or children spread. Image takes priority over icon; label renders independently. Internal close/onKeyDown and visible state own removal; click, Enter or Backspace hides the chip before onRemove unless disabled. Remove span role=button has tabIndex -1 when disabled, otherwise 0; removeAriaLabel supplies its accessible label. UTimesIcon is external foundation content. chipStyleModule owns classes and --u-chip-* fallbacks, not a separately exported API. Public runtime and props type are named exports from both @ultimate/react and @ultimate/react/chip. The manifest advertises dist entry/type paths; this does not prove a built or published package. useComponentBase from @ultimate/react-core owns cx class resolution and delegates mounting/style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. Local style CSS is registered; no scoped style module imports @ultimate/uix-styles. Comments claiming missing shared modules are historical, not availability evidence. Aura key chip exists; local CSS uses custom-property fallbacks rather than dt(). No dedicated record for this family is present in the current metadata registry; no metadata association is inferred from its name.

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
