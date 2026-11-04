# Vue UAvatar

ID: vue.avatar

Framework: vue; availability: public

## Authored interpretation

Displays image, label or icon identity with image-error fallback.

## Framework surface

label/icon/image, size(normal), shape(square), ariaLabelledby/ariaLabel props; error event. Image wins unless imageFailed, then label, then CSS-class icon. onError sets imageFailed and emits error; there is no image-change reset watcher. No default or icon slots. inheritAttrs:false. AvatarClassesParams owns hasImage/imageFailed/shape/size class resolution; source-only type, not public barrel API. UAvatar and createBaseAvatar are named exports from both @ultimate/vue and @ultimate/vue/avatar. createBaseAvatar is a public zero-argument Options-API base factory, extending createBaseComponent({componentName,styleModule}), not a Composition API hook. cx class resolution and mounted registerComponentStyle belong to vue-core, not this record. AvatarClassesParams, avatarStyleModule and local css/classes resolvers are owned source-only style/helper/type declarations; no style subpath is advertised. CSS is authored locally; historical comments about missing shared styles are not treated as current availability evidence. Aura registry has the avatar token namespace. No dedicated metadata record for this family exists in the current metadata registry. Declared manifest dist entry/type paths establish intended consumer availability, not built artifacts or publication. No standalone scoped composable or directive implementation is exported.

## Public exports

@ultimate/vue#UAvatar
@ultimate/vue#createBaseAvatar
@ultimate/vue/avatar#UAvatar
@ultimate/vue/avatar#createBaseAvatar

## Owned source and evidence

packages/vue/src/avatar/Avatar.vue
packages/vue/src/avatar/BaseAvatar.ts
packages/vue/src/avatar/avatar-style.ts
packages/vue/src/avatar/index.ts

```text
packages/vue/src/avatar/index.ts: export { default as UAvatar } from "./Avatar.vue";
export { createBaseAvatar } from "./BaseAvatar";
packages/vue/src/avatar/BaseAvatar.ts: export function createBaseAvatar
packages/vue/src/avatar/avatar-style.ts: export const avatarStyleModule
packages/vue/src/avatar/Avatar.vue: name: "UAvatar"
```

## Relationships

package.ultimate.vue.avatar → [vue.avatar](vue.avatar.md) (reconciled family alias)
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
