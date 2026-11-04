# Vue UButtonGroup

ID: vue.button-group

Framework: vue; availability: public

## Authored interpretation

Groups supplied buttons visually without creating or managing their state.

## Framework surface

No own props or events. span role=group projects default slot. inheritAttrs:false does not forward arbitrary attrs. CSS adjoining borders, fixed 6px outer corners and focus stacking implement composition with UButton; no compound static members. UButtonGroup and createBaseButtonGroup are named exports from both @ultimate/vue and @ultimate/vue/button-group. createBaseButtonGroup is a public zero-argument Options-API base factory, extending createBaseComponent({componentName,styleModule}), not a Composition API hook. cx class resolution and mounted registerComponentStyle belong to vue-core, not this record. buttonGroupStyleModule and local css/classes resolvers are owned source-only style/helper/type declarations; no style subpath is advertised. CSS is authored locally; historical comments about missing shared styles are not treated as current availability evidence. No dedicated Aura registry key is inferred for this grouping wrapper. No dedicated metadata record for this family exists in the current metadata registry. Declared manifest dist entry/type paths establish intended consumer availability, not built artifacts or publication. No standalone scoped composable or directive implementation is exported.

## Public exports

@ultimate/vue#UButtonGroup
@ultimate/vue#createBaseButtonGroup
@ultimate/vue/button-group#UButtonGroup
@ultimate/vue/button-group#createBaseButtonGroup

## Owned source and evidence

packages/vue/src/button-group/BaseButtonGroup.ts
packages/vue/src/button-group/ButtonGroup.vue
packages/vue/src/button-group/button-group-style.ts
packages/vue/src/button-group/index.ts

```text
packages/vue/src/button-group/index.ts: export { default as UButtonGroup } from "./ButtonGroup.vue";
export { createBaseButtonGroup } from "./BaseButtonGroup";
packages/vue/src/button-group/BaseButtonGroup.ts: export function createBaseButtonGroup
packages/vue/src/button-group/button-group-style.ts: export const buttonGroupStyleModule
packages/vue/src/button-group/ButtonGroup.vue: name: "UButtonGroup"
```

## Relationships

package.ultimate.vue.button-group → [vue.button-group](vue.button-group.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
vue.button

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
