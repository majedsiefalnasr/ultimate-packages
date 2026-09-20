import { createBaseComponent } from "@ultimate/vue-core";
import { imageStyleModule } from "./image-style";
import type { ComponentOptions } from "vue";

// extends: createBaseComponent(...) directly — Image is a display-only
// primitive with its own internal preview-mask state, not a form control,
// matching real extracted PrimeVue's own BaseImage.vue's
// `extends: BaseComponent`.
export function createBaseImage(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "image", styleModule: imageStyleModule }),
    props: {
      src: { type: String, default: null },
      alt: { type: String, default: null },
      width: { type: String, default: null },
      height: { type: String, default: null },
      preview: { type: Boolean, default: false },
    },
  };
}
