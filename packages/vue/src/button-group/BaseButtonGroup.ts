import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { buttonGroupStyleModule } from "./button-group-style";

// extends: createBaseComponent(...) directly — ButtonGroup is a trivial
// content-wrapping primitive with no editable/input state and no props of
// its own, matching the real extracted PrimeVue BaseButtonGroup.vue's own
// `extends: BaseComponent` shape exactly.
export function createBaseButtonGroup() {
  return defineComponent({
    extends: createBaseComponent({
      componentName: "button-group",
      styleModule: buttonGroupStyleModule,
    }),
  });
}
