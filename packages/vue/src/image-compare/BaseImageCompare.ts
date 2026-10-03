import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { imageCompareStyleModule } from "./image-compare-style";

// extends: createBaseComponent(...) directly — ImageCompare is a
// display-only primitive with no editable/input state, matching real
// extracted PrimeVue's own BaseImageCompare.vue's `extends: BaseComponent`.
export function createBaseImageCompare() {
  return defineComponent({
    extends: createBaseComponent({
      componentName: "image-compare",
      styleModule: imageCompareStyleModule,
    }),
    props: {
      tabindex: { type: Number, default: 0 },
      ariaLabelledby: { type: String, default: null },
      ariaLabel: { type: String, default: null },
    },
  });
}
