import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { avatarStyleModule } from "./avatar-style";

// extends: createBaseComponent(...) directly — Avatar is a display-only
// primitive with no editable/input state, matching the real extracted
// PrimeVue BaseAvatar.vue's own `extends: BaseComponent` (one tier, not the
// editable-holder/input chain), same precedent as this package's own
// UBadge (packages/vue/src/badge/base-badge.ts).
//
// Prop surface verified against the real extracted
// (via extract-primevue-source.mjs primevue root) BaseAvatar.vue:
// label/icon/image/size/shape/ariaLabelledby/ariaLabel all match verbatim.
export function createBaseAvatar() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "avatar", styleModule: avatarStyleModule }),
    props: {
      label: { type: String, default: null },
      icon: { type: String, default: null },
      image: { type: String, default: null },
      size: { type: String, default: "normal" },
      shape: { type: String, default: "square" },
      ariaLabelledby: { type: String, default: null },
      ariaLabel: { type: String, default: null },
    },
  });
}
