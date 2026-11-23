# Vue UAvatarGroup

ID: vue.avatar-group

Framework: vue; availability: public

## Authored interpretation

Groups caller-supplied avatars with overlapping CSS that uses logical, size-specific offsets.

## Framework surface

No own props/events. div role=group projects default slot; ptmi('root') carries pt and fall-through attributes onto the root, and inheritAttrs:false. The overlap uses margin-inline-start offsets from the avatar.group dt() tokens (ADR-087); there is no dedicated Aura avatar-group registry key. UAvatarGroup and createBaseAvatarGroup are named exports from both @ultimate/vue and @ultimate/vue/avatar-group. createBaseAvatarGroup is a public zero-argument Options-API base factory, extending createBaseComponent({componentName,styleModule}), not a Composition API hook. cx class resolution and mounted registerComponentStyle belong to vue-core, not this record. avatarGroupStyleModule and local css/classes resolvers are owned source-only style/helper/type declarations; no style subpath is advertised. The CSS is the shared @ultimate/uix-styles/avatar module (ADR-082, ADR-087). No dedicated Aura registry key is inferred for this grouping wrapper. No dedicated metadata record for this family exists in the current metadata registry. Declared manifest dist entry/type paths establish intended consumer availability, not built artifacts or publication. No standalone scoped composable or directive implementation is exported.

## Public exports

@ultimate/vue#UAvatarGroup
@ultimate/vue#createBaseAvatarGroup
@ultimate/vue/avatar-group#UAvatarGroup
@ultimate/vue/avatar-group#createBaseAvatarGroup

## Owned source and evidence

packages/vue/src/avatar-group/AvatarGroup.vue
packages/vue/src/avatar-group/BaseAvatarGroup.ts
packages/vue/src/avatar-group/avatar-group-style.ts
packages/vue/src/avatar-group/index.ts

```text
packages/vue/src/avatar-group/index.ts: export { default as UAvatarGroup } from "./AvatarGroup.vue";
export { createBaseAvatarGroup } from "./BaseAvatarGroup";
packages/vue/src/avatar-group/BaseAvatarGroup.ts: export function createBaseAvatarGroup
packages/vue/src/avatar-group/avatar-group-style.ts: export const avatarGroupStyleModule
packages/vue/src/avatar-group/AvatarGroup.vue: name: "UAvatarGroup"
packages/vue/src/avatar-group/AvatarGroup.vue: ptmi('root')
packages/vue/src/avatar-group/avatar-group-style.ts: @ultimate/uix-styles/avatar
```

## Relationships

package.ultimate.vue.avatar-group → [vue.avatar-group](vue.avatar-group.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
vue.avatar

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
