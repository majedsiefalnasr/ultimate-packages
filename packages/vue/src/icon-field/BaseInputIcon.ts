import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { inputIconStyleModule } from "./icon-field-style";

// extends: createBaseComponent(...) directly — matching verified
// BaseInputIcon.vue's own `extends: BaseComponent` chain: real InputIcon
// has no CVA/controlled-value concept, only slot projection.
export function createBaseInputIcon() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "input-icon", styleModule: inputIconStyleModule }),
  });
}
