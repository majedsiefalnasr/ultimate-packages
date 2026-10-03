import { defineComponent } from "vue";
import { createBaseEditableHolder, registerComponentStyle } from "@ultimate/vue-core";
import { knobStyleModule } from "./knob-style";
import type { ClassValue } from "@ultimate/vue-core";

// extends: createBaseEditableHolder(), matching verified BaseKnob.vue's real
// chain exactly: `export default { name: 'BaseKnob', extends:
// BaseEditableHolder, ... }` — confirmed against
// .vendor-extracted/vue/knob/BaseKnob.vue — same tier URating/USlider
// already extend, NOT BaseInput.
export function createBaseKnob() {
  return defineComponent({
    extends: createBaseEditableHolder(),
    props: {
      size: { type: Number, default: 100 },
      readonly: { type: Boolean, default: false },
      step: { type: Number, default: 1 },
      min: { type: Number, default: 0 },
      max: { type: Number, default: 100 },
      strokeWidth: { type: Number, default: 14 },
      showValue: { type: Boolean, default: true },
      valueTemplate: { type: String, default: "{value}" },
      disabled: { type: Boolean, default: false },
      valueColor: { type: String, default: "#3B82F6" },
      rangeColor: { type: String, default: "#D1D5DB" },
      textColor: { type: String, default: "#374151" },
      ariaLabelledby: { type: String, default: null },
      ariaLabel: { type: String, default: null },
    },
    methods: {
      cx(key: string, params?: Record<string, unknown>): ClassValue | undefined {
        const resolver = knobStyleModule.classes[key];
        if (resolver === undefined) return undefined;
        return typeof resolver === "function" ? resolver(params) : resolver;
      },
    },
    mounted() {
      registerComponentStyle("knob", knobStyleModule);
    },
  });
}
