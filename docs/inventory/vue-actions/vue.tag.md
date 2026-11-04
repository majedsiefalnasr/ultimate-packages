# Vue UTag

ID: vue.tag

Framework: vue; availability: public

## Authored interpretation

Status or category display with optional CSS-class icon.

## Framework surface

severity, value:string|null, icon(undefined), rounded(false) props. span contains conditional icon wrapper with aria-hidden i and label default slot falling back to value. Actual template has no named icon slot despite historical comment. inheritAttrs:false; no own events or model interface. UTag and createBaseTag are named exports from both @ultimate/vue and @ultimate/vue/tag. createBaseTag is a public zero-argument Options-API base factory, extending createBaseComponent({componentName,styleModule}), not a Composition API hook. cx class resolution and mounted registerComponentStyle belong to vue-core, not this record. tagStyleModule and local css/classes resolvers are owned source-only style/helper/type declarations; no style subpath is advertised. CSS is authored locally; historical comments about missing shared styles are not treated as current availability evidence. Aura registry has the tag token namespace. No dedicated metadata record for this family exists in the current metadata registry. Declared manifest dist entry/type paths establish intended consumer availability, not built artifacts or publication. No standalone scoped composable or directive implementation is exported.

## Public exports

@ultimate/vue#UTag
@ultimate/vue#createBaseTag
@ultimate/vue/tag#UTag
@ultimate/vue/tag#createBaseTag

## Owned source and evidence

packages/vue/src/tag/BaseTag.ts
packages/vue/src/tag/Tag.vue
packages/vue/src/tag/index.ts
packages/vue/src/tag/tag-style.ts

```text
packages/vue/src/tag/index.ts: export { default as UTag } from "./Tag.vue";
export { createBaseTag } from "./BaseTag";
packages/vue/src/tag/BaseTag.ts: export function createBaseTag
packages/vue/src/tag/tag-style.ts: export const tagStyleModule
packages/vue/src/tag/Tag.vue: name: "UTag"
```

## Relationships

package.ultimate.vue.tag → [vue.tag](vue.tag.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

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
