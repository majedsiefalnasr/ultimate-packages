# Vue UBadge

ID: vue.badge

Framework: vue; availability: public

## Authored interpretation

Compact count or status display with value fallback and caller content.

## Framework surface

value:string|number|null, severity:string|null, size:string|null props. span default slot falls back to value; styleParams tracks value, slot presence, size and severity. BadgeClassesParams is source-only: small/large/xlarge; secondary/info/success/warn/danger/contrast. Dot class is null value without default slot; one-character values get circle class. inheritAttrs is false and ptmi('root') carries pt and the fall-through attrs onto the single root; unstyled and dt come from the base chain (ADR-088). There is no badge directive export in this family. UBadge and createBaseBadge are named exports from both @ultimate/vue and @ultimate/vue/badge. createBaseBadge is a public zero-argument Options-API base factory, extending createBaseComponent({componentName,styleModule}), not a Composition API hook. cx class resolution and mounted registerComponentStyle belong to vue-core, not this record. BadgeClassesParams, badgeStyleModule and local css/classes resolvers are owned source-only style/helper/type declarations; no style subpath is advertised. CSS imports the shared token-bearing style string from @ultimate/uix-styles/badge. Aura registry has the badge token namespace. No dedicated metadata record for this family exists in the current metadata registry. Declared manifest dist entry/type paths establish intended consumer availability, not built artifacts or publication. No standalone scoped composable or directive implementation is exported.

## Public exports

@ultimate/vue#UBadge
@ultimate/vue#createBaseBadge
@ultimate/vue/badge#UBadge
@ultimate/vue/badge#createBaseBadge

## Owned source and evidence

packages/vue/src/badge/Badge.vue
packages/vue/src/badge/badge-style.ts
packages/vue/src/badge/base-badge.ts
packages/vue/src/badge/index.ts

```text
packages/vue/src/badge/index.ts: export { default as UBadge } from "./Badge.vue";
export { createBaseBadge } from "./base-badge";
packages/vue/src/badge/base-badge.ts: export function createBaseBadge
packages/vue/src/badge/badge-style.ts: export const badgeStyleModule
packages/vue/src/badge/Badge.vue: name: "UBadge"
packages/vue/src/badge/Badge.vue: v-bind="ptmi('root')"
```

## Relationships

package.ultimate.vue.badge → [vue.badge](vue.badge.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.uix-styles.badge (pending cross-batch)

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
