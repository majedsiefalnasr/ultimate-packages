import { createBaseComponent } from "@ultimate/vue-core";
import { iftaLabelStyleModule } from "./ifta-label-style";
import type { ComponentOptions } from "vue";

// extends: createBaseComponent(...) directly — matching verified
// BaseIftaLabel.vue's own `extends: BaseComponent` chain: real IftaLabel
// has no CVA/controlled-value concept and, unlike FloatLabel, no `variant`
// prop either (verified: real BaseIftaLabel.vue declares no `props` block)
// — only slot projection.
export function createBaseIftaLabel(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "ifta-label", styleModule: iftaLabelStyleModule }),
  };
}
