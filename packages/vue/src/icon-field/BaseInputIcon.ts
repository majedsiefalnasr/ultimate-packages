import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { inputIconStyleModule } from "./icon-field-style";

// extends: createBaseComponent(...) directly — matching PrimeVue's
// BaseInputIcon.vue `extends: BaseComponent` chain: real InputIcon has no
// CVA/controlled-value concept, only slot projection.
export function createBaseInputIcon() {
  return defineComponent({
    extends: createBaseComponent({
      componentName: "inputicon",
      styleModule: inputIconStyleModule,
    }),
  });
}
