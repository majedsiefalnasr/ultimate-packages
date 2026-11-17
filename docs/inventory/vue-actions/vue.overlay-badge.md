# Vue UOverlayBadge

ID: vue.overlay-badge

Framework: vue; availability: public

## Authored interpretation

Positions a composed UBadge at the top-right of supplied host content.

## Framework surface

value:string|number|null, severity and size props forwarded via $props to UBadge. div projects default host slot then UBadge. Attrs fall through. createBaseOverlayBadge is source-exported internally but not re-exported by index.ts, hence unavailable from declared public entrypoints. Local positioning CSS includes RTL transform and overlaybadge outline tokens. UOverlayBadge are named exports from both @ultimate/vue and @ultimate/vue/overlay-badge. createBaseOverlayBadge is an owned source-only zero-argument Options-API base factory, extending createBaseComponent({componentName,styleModule}), not a Composition API hook. cx class resolution and mounted registerComponentStyle belong to vue-core, not this record. overlayBadgeStyleModule and local css/classes resolvers are owned source-only style/helper/type declarations; no style subpath is advertised. CSS is authored locally; historical comments about missing shared styles are not treated as current availability evidence. Aura registry has the overlaybadge token namespace. No dedicated metadata record for this family exists in the current metadata registry. Declared manifest dist entry/type paths establish intended consumer availability, not built artifacts or publication. No standalone scoped composable or directive implementation is exported.

## Public exports

@ultimate/vue#UOverlayBadge
@ultimate/vue/overlay-badge#UOverlayBadge

## Owned source and evidence

packages/vue/src/overlay-badge/BaseOverlayBadge.ts
packages/vue/src/overlay-badge/OverlayBadge.vue
packages/vue/src/overlay-badge/index.ts
packages/vue/src/overlay-badge/overlay-badge-style.ts

```text
packages/vue/src/overlay-badge/index.ts: export { default as UOverlayBadge } from "./OverlayBadge.vue";
packages/vue/src/overlay-badge/BaseOverlayBadge.ts: export function createBaseOverlayBadge
packages/vue/src/overlay-badge/overlay-badge-style.ts: export const overlayBadgeStyleModule
packages/vue/src/overlay-badge/OverlayBadge.vue: name: "UOverlayBadge"
```

## Relationships

package.ultimate.vue.overlay-badge → [vue.overlay-badge](vue.overlay-badge.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
vue.badge

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
