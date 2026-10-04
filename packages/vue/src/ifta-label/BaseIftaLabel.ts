import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { iftaLabelStyleModule } from "./ifta-label-style";

// extends: createBaseComponent(...) directly — matching verified
// BaseIftaLabel.vue's own `extends: BaseComponent` chain: real IftaLabel
// has no CVA/controlled-value concept and, unlike FloatLabel, no `variant`
// prop either (verified: real BaseIftaLabel.vue declares no `props` block)
// — only slot projection.
export function createBaseIftaLabel() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "iftalabel", styleModule: iftaLabelStyleModule }),
  });
}
