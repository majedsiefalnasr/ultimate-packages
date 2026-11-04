# Vue USplitButton

ID: vue.split-button

Framework: vue; availability: public

## Authored interpretation

Primary action plus dropdown of secondary commands, composed from UButton and popup UMenu.

## Framework surface

model:readonly unknown[] defaults to [], label/icon/iconPos(left), severity/text/outlined/size/disabled are declared props. Emits click/show/hide. Two UButton instances share appearance and disabled state; dropdown uses pi pi-chevron-down. menuModel wraps command to hide the menu before calling the original callback. onDefaultButtonClick hides an open menu then emits click; onDropdownButtonClick calls menu.toggle with dropdownButton.$el. Internal refs menu/dropdownButton and handlers are owned helpers, not standalone exports. No slots are rendered; inheritAttrs:false discards unspecified attrs. USplitButton and createBaseSplitButton are named exports from both @ultimate/vue and @ultimate/vue/split-button. createBaseSplitButton is a public zero-argument Options-API base factory, extending createBaseComponent({componentName,styleModule}), not a Composition API hook. cx class resolution and mounted registerComponentStyle belong to vue-core, not this record. splitButtonStyleModule and local css/classes resolvers are owned source-only style/helper/type declarations; no style subpath is advertised. CSS is authored locally; historical comments about missing shared styles are not treated as current availability evidence. Aura registry has the splitbutton token namespace. No dedicated metadata record for this family exists in the current metadata registry. Declared manifest dist entry/type paths establish intended consumer availability, not built artifacts or publication. No standalone scoped composable or directive implementation is exported.

## Public exports

@ultimate/vue#USplitButton
@ultimate/vue#createBaseSplitButton
@ultimate/vue/split-button#USplitButton
@ultimate/vue/split-button#createBaseSplitButton

## Owned source and evidence

packages/vue/src/split-button/BaseSplitButton.ts
packages/vue/src/split-button/SplitButton.vue
packages/vue/src/split-button/index.ts
packages/vue/src/split-button/split-button-style.ts

```text
packages/vue/src/split-button/index.ts: export { default as USplitButton } from "./SplitButton.vue";
export { createBaseSplitButton } from "./BaseSplitButton";
packages/vue/src/split-button/BaseSplitButton.ts: export function createBaseSplitButton
packages/vue/src/split-button/split-button-style.ts: export const splitButtonStyleModule
packages/vue/src/split-button/SplitButton.vue: name: "USplitButton"
```

## Relationships

package.ultimate.vue.split-button → [vue.split-button](vue.split-button.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
vue.button
package.ultimate.vue.menu (pending cross-batch)

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
