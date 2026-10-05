import { defineComponent } from "vue";
import { createBaseEditableHolder, registerComponentStyle } from "@ultimate/vue-core";
import { colorPickerStyleModule } from "./color-picker-style";
import type { ClassValue } from "@ultimate/vue-core";

// extends: createBaseEditableHolder(), matching verified
// BaseColorPicker.vue's real chain exactly: `export default { name:
// 'BaseColorPicker', extends: BaseEditableHolder, ... }` — confirmed against
// .vendor-extracted/vue/colorpicker/BaseColorPicker.vue — same tier
// URating/USlider/UKnob already extend, NOT BaseInput.
export function createBaseColorPicker() {
  return defineComponent({
    extends: createBaseEditableHolder(),
    props: {
      format: { type: String, default: "hex" },
      defaultColor: { type: String, default: "ff0000" },
      disabled: { type: Boolean, default: false },
      appendTo: { type: [String, Object], default: "body" },
    },
    methods: {
      cx(key: string, params?: Record<string, unknown>): ClassValue | undefined {
        const resolver = colorPickerStyleModule.classes[key];
        if (resolver === undefined) return undefined;
        return typeof resolver === "function" ? resolver(params) : resolver;
      },
    },
    mounted() {
      registerComponentStyle("colorpicker", colorPickerStyleModule);
    },
  });
}
