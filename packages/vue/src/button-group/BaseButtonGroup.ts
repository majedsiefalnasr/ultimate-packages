import { createBaseComponent } from "@ultimate/vue-core";
import { buttonGroupStyleModule } from "./button-group-style";
import type { ComponentOptions } from "vue";

// extends: createBaseComponent(...) directly — ButtonGroup is a trivial
// content-wrapping primitive with no editable/input state and no props of
// its own, matching the real extracted PrimeVue BaseButtonGroup.vue's own
// `extends: BaseComponent` shape exactly.
export function createBaseButtonGroup(): ComponentOptions {
  return {
    extends: createBaseComponent({
      componentName: "button-group",
      styleModule: buttonGroupStyleModule,
    }),
  };
}
