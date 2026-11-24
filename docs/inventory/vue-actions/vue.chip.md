# Vue UChip

ID: vue.chip

Framework: vue; availability: public

## Authored interpretation

Labeled identity/item token with optional image/icon, slots for custom content and a removable control.

## Framework surface

label:string|number|null, icon, image, alt, disabled(false), removable(false), removeAriaLabel (default the English "Remove") and removeIcon (a font class) props; pt and ptOptions come from the base chain. Emits remove and imageError. Slots: default (replaces the image, icon and label), icon (rendered inside the icon part) and removeicon (replaces the whole remove control and receives removeCallback and keydownCallback). inheritAttrs is false and the root binds ptmi(root), so consumer class, style and aria-* reach it. Pass-through sections root, image, icon, label and removeIcon. The root carries data-p=removable while removable and the p-disabled class while disabled. visible initially true; close hides and emits remove unless disabled. onKeydown invokes close for Enter or Backspace (not Delete); onImageError forwards imageError. Image precedes icon, label is rendered unless null. The remove span is role=button with tabindex -1 when disabled, otherwise 0, and renders TimesIcon unless removeIcon is set. UChip and createBaseChip are named exports from both @ultimate/vue and @ultimate/vue/chip. createBaseChip is a public zero-argument Options-API base factory, extending createBaseComponent({componentName,styleModule}), not a Composition API hook. cx class resolution and mounted registerComponentStyle belong to vue-core, not this record. chipStyleModule's css is the shared @ultimate/uix-styles/chip module (ADR-082, ADR-098) on the Aura chip tokens; no style subpath of the Vue package is advertised. The Aura registry has the chip token namespace. No dedicated metadata record for this family exists in the current metadata registry. Declared manifest dist entry/type paths establish intended consumer availability, not built artifacts or publication. No standalone scoped composable or directive implementation is exported.

## Public exports

@ultimate/vue#UChip
@ultimate/vue#createBaseChip
@ultimate/vue/chip#UChip
@ultimate/vue/chip#createBaseChip

## Owned source and evidence

packages/vue/src/chip/BaseChip.ts
packages/vue/src/chip/Chip.vue
packages/vue/src/chip/chip-style.ts
packages/vue/src/chip/index.ts

```text
packages/vue/src/chip/index.ts: export { default as UChip } from "./Chip.vue";
export { createBaseChip } from "./BaseChip";
packages/vue/src/chip/BaseChip.ts: export function createBaseChip
packages/vue/src/chip/chip-style.ts: export const chipStyleModule
packages/vue/src/chip/Chip.vue: name: "UChip"
packages/vue/src/chip/Chip.vue: ptmi('root')
packages/vue/src/chip/chip-style.ts: @ultimate/uix-styles/chip
```

## Relationships

package.ultimate.vue.chip → [vue.chip](vue.chip.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.vue-core.icons (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Read component template, base factory and style helpers directly; source existence and interpretation only."
  },
  {
    "state": "unavailable",
    "behavior": "Existing bounded product runner aborted before assertions.",
    "command": "pnpm --filter @ultimate/vue exec vitest run src/button/ src/button-group/ src/split-button/ src/avatar/ src/avatar-group/ src/badge/ src/overlay-badge/ src/chip/ src/tag/ src/toolbar/",
    "outcome": "unavailable",
    "revision": "37aa7ce8525c6f1622127eb1735ec41beb4096c5",
    "limitations": "Host ancestor PostCSS config requires unavailable postcss-import; no product assertions executed. No product or host repair; no browser/build/publish proof.",
    "output": "Vitest 2.1.9: Failed to load PostCSS config; Cannot find module 'postcss-import'; require stack /Users/majedsiefalnasr/postcss.config.mjs; exit 1"
  }
]
```
