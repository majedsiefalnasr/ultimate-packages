# Vue UToolbar

ID: vue.toolbar

Framework: vue; availability: public

## Authored interpretation

Layout container for actions and content in named sections.

## Framework surface

ariaLabelledby:string|null prop. div role=toolbar binds aria-labelledby. Default slot plus independently conditional start, center and end named slots compose content. No button management, keyboard navigation, model interface or own events. inheritAttrs:false with the root bound through ptmi('root'), so id, class and native attributes reach the root, and each region bound through ptm(section); regions render only when their slot is provided (ADR-089). unstyled, dt, pt and ptOptions come from the base chain; local class keys root/start/center/end belong here. UToolbar and createBaseToolbar are named exports from both @ultimate/vue and @ultimate/vue/toolbar. createBaseToolbar is a public zero-argument Options-API base factory, extending createBaseComponent({componentName,styleModule}), not a Composition API hook. cx class resolution and mounted registerComponentStyle belong to vue-core, not this record. toolbarStyleModule and local css/classes resolvers are owned source-only style/helper/type declarations; no style subpath is advertised. CSS is authored locally; historical comments about missing shared styles are not treated as current availability evidence. Aura registry has the toolbar token namespace. No dedicated metadata record for this family exists in the current metadata registry. Declared manifest dist entry/type paths establish intended consumer availability, not built artifacts or publication. No standalone scoped composable or directive implementation is exported.

## Public exports

@ultimate/vue#UToolbar
@ultimate/vue#createBaseToolbar
@ultimate/vue/toolbar#UToolbar
@ultimate/vue/toolbar#createBaseToolbar

## Owned source and evidence

packages/vue/src/toolbar/BaseToolbar.ts
packages/vue/src/toolbar/Toolbar.vue
packages/vue/src/toolbar/index.ts
packages/vue/src/toolbar/toolbar-style.ts

```text
packages/vue/src/toolbar/index.ts: export { default as UToolbar } from "./Toolbar.vue";
export { createBaseToolbar } from "./BaseToolbar";
packages/vue/src/toolbar/BaseToolbar.ts: export function createBaseToolbar
packages/vue/src/toolbar/toolbar-style.ts: export const toolbarStyleModule
packages/vue/src/toolbar/Toolbar.vue: name: "UToolbar"
packages/vue/src/toolbar/Toolbar.vue: v-bind="ptmi('root')"
packages/vue/src/toolbar/Toolbar.vue: v-bind="ptm('start')"
```

## Relationships

package.ultimate.vue.toolbar → [vue.toolbar](vue.toolbar.md) (reconciled family alias)
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
