<template>
  <div :class="cx('root')" role="group" v-bind="ptmi('root')">
    <slot />
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `AvatarGroup` component (see
// .vendor-extracted/vue/avatargroup/AvatarGroup.vue). A trivial
// content-projecting wrapper for a set of `UAvatar` instances: a single root
// <div> rendering the default slot, no props of its own. `ptmi('root')`
// carries `pt` and the fall-through attributes onto the root, so
// `inheritAttrs` is off; `unstyled` and `dt` come from the base chain. The
// overlapping-avatars visual is CSS-only (see `avatar-group-style.ts`).
import { createBaseAvatarGroup } from "./BaseAvatarGroup";

export default {
  name: "UAvatarGroup",
  extends: createBaseAvatarGroup(),
  inheritAttrs: false,
};
</script>
