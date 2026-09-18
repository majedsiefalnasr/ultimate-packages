import { createBaseComponent } from "@ultimate/vue-core";
import { iconFieldStyleModule } from "./icon-field-style";
import type { ComponentOptions } from "vue";

// extends: createBaseComponent(...) directly — matching verified
// BaseIconField.vue's own `extends: BaseComponent` chain: real IconField has
// no CVA/controlled-value concept, only slot projection (no props of its
// own at all — verified: real BaseIconField.vue declares no `props` block).
export function createBaseIconField(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "icon-field", styleModule: iconFieldStyleModule }),
  };
}
