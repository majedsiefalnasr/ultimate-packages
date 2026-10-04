import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { avatarGroupStyleModule } from "./avatar-group-style";

// extends: createBaseComponent(...) directly — AvatarGroup is a trivial
// content-wrapping primitive with no editable/input state, matching the
// real extracted PrimeVue BaseAvatarGroup.vue's own `extends: BaseComponent`
// (no props of its own).
export function createBaseAvatarGroup() {
  return defineComponent({
    extends: createBaseComponent({
      componentName: "avatar-group",
      styleModule: avatarGroupStyleModule,
    }),
  });
}
