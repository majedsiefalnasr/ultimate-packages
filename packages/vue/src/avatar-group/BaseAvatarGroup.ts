import { createBaseComponent } from "@ultimate/vue-core";
import { avatarGroupStyleModule } from "./avatar-group-style";
import type { ComponentOptions } from "vue";

// extends: createBaseComponent(...) directly — AvatarGroup is a trivial
// content-wrapping primitive with no editable/input state, matching the
// real extracted PrimeVue BaseAvatarGroup.vue's own `extends: BaseComponent`
// (no props of its own).
export function createBaseAvatarGroup(): ComponentOptions {
  return {
    extends: createBaseComponent({
      componentName: "avatar-group",
      styleModule: avatarGroupStyleModule,
    }),
  };
}
