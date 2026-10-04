import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { blockUiStyleModule } from "./block-ui-style";

// Props verified against real .vendor-extracted/vue/blockui/BaseBlockUI.vue:
// blocked/fullScreen/baseZIndex/autoZIndex all match verbatim. `target`
// ("block another element" mode) is excluded, same "smaller surface than
// upstream" precedent as every sibling component — this port always
// blocks its own default-slot content.
export function createBaseBlockUI() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "block-ui", styleModule: blockUiStyleModule }),
    props: {
      blocked: { type: Boolean, default: false },
      fullScreen: { type: Boolean, default: false },
      baseZIndex: { type: Number, default: 0 },
      autoZIndex: { type: Boolean, default: true },
    },
  });
}
