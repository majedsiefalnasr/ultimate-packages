import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { iconFieldStyleModule } from "./icon-field-style";

// extends: createBaseComponent(...) directly — matching PrimeVue's
// BaseIconField.vue `extends: BaseComponent` chain: real IconField has no
// CVA/controlled-value concept, only slot projection (no props of its own
// at all — real BaseIconField.vue declares no `props` block).
export function createBaseIconField() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "iconfield", styleModule: iconFieldStyleModule }),
  });
}
