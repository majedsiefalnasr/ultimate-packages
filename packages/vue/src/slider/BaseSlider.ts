import { createBaseEditableHolder, registerComponentStyle } from "@ultimate/vue-core";
import { sliderStyleModule } from "./slider-style";
import type { ComponentOptions } from "vue";
import type { ClassValue } from "@ultimate/vue-core";

// extends: createBaseEditableHolder(), matching verified BaseSlider.vue's
// real chain exactly: `export default { name: 'BaseSlider', extends:
// BaseEditableHolder, ... }` — confirmed against
// .vendor-extracted/vue/slider/BaseSlider.vue — same tier URating/
// USelectButton already extend, NOT BaseInput.
export function createBaseSlider(): ComponentOptions {
  return {
    extends: createBaseEditableHolder(),
    props: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 100 },
      orientation: { type: String, default: "horizontal" },
      step: { type: Number, default: null },
      range: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false },
      ariaLabelledby: { type: String, default: null },
      ariaLabel: { type: String, default: null },
    },
    methods: {
      cx(key: string, params?: Record<string, unknown>): ClassValue | undefined {
        const resolver = sliderStyleModule.classes[key];
        if (resolver === undefined) return undefined;
        return typeof resolver === "function" ? resolver(params) : resolver;
      },
    },
    mounted() {
      registerComponentStyle("slider", sliderStyleModule);
    },
  };
}
