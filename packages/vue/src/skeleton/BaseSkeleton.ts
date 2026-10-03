import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { skeletonStyleModule } from "./skeleton-style";

// extends: createBaseComponent(...) directly — Skeleton is a pure
// placeholder/display component, not a form control, matching real
// extracted PrimeVue's own BaseSkeleton.vue's `extends: BaseComponent`.
// Props verified against real source: shape/animation/borderRadius/size/
// width/height all match verbatim.
export function createBaseSkeleton() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "skeleton", styleModule: skeletonStyleModule }),
    props: {
      shape: { type: String, default: "rectangle" },
      animation: { type: String, default: "wave" },
      borderRadius: { type: String, default: undefined },
      size: { type: String, default: undefined },
      width: { type: String, default: "100%" },
      height: { type: String, default: "1rem" },
    },
  });
}
