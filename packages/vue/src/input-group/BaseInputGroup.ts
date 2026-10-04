import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { inputGroupStyleModule } from "./input-group-style";

// extends: createBaseComponent(...) directly — matching verified
// BaseInputGroup.vue's own `extends: BaseComponent` chain: real InputGroup
// has no CVA/controlled-value concept, only slot projection.
export function createBaseInputGroup() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "input-group", styleModule: inputGroupStyleModule }),
  });
}
