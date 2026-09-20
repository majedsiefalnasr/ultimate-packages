import { createBaseComponent } from "@ultimate/vue-core";
import { galleriaStyleModule } from "./galleria-style";
import type { ComponentOptions } from "vue";

// extends: createBaseComponent(...) directly — Galleria is a display-only
// collection viewer with its own internal navigation/fullscreen state, not
// a form control, matching real extracted PrimeVue's own
// BaseGalleria.vue's `extends: BaseComponent`.
export function createBaseGalleria(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "galleria", styleModule: galleriaStyleModule }),
    props: {
      value: { type: Array, default: () => [] },
      activeIndex: { type: Number, default: 0 },
      showItemNavigators: { type: Boolean, default: true },
      showThumbnails: { type: Boolean, default: true },
      circular: { type: Boolean, default: false },
      autoplayInterval: { type: Number, default: 0 },
      fullScreen: { type: Boolean, default: false },
      fullScreenActive: { type: Boolean, default: false },
    },
  };
}
