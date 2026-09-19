<template>
  <div :class="cx('root')" role="group">
    <slot />
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `AvatarGroup` component (see
// .vendor-extracted/vue/avatargroup/AvatarGroup.vue). A trivial
// content-projecting wrapper for a set of `UAvatar` instances — matches
// real source's own minimal template shape exactly (a single root <div>
// rendering the default slot, no props of its own). The overlapping-avatars
// visual is CSS-only (see `avatar-group-style.ts`).
import { createBaseAvatarGroup } from "./BaseAvatarGroup";

export default {
  name: "UAvatarGroup",
  extends: createBaseAvatarGroup(),
  inheritAttrs: false,
};
</script>
