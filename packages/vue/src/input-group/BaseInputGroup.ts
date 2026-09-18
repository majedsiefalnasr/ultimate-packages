import { createBaseComponent } from "@ultimate/vue-core";
import { inputGroupStyleModule } from "./input-group-style";
import type { ComponentOptions } from "vue";

// extends: createBaseComponent(...) directly — matching verified
// BaseInputGroup.vue's own `extends: BaseComponent` chain: real InputGroup
// has no CVA/controlled-value concept, only slot projection.
export function createBaseInputGroup(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "input-group", styleModule: inputGroupStyleModule }),
  };
}
