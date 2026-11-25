import { defineComponent, type PropType } from "vue";
import { createBaseEditableHolder } from "@ultimate/vue-core";
import { $dt } from "@ultimate/uix-styled";
import { knobStyleModule } from "./knob-style";

/** A `{value}` placeholder string, or a function that formats the value. */
export type UKnobValueTemplate = string | ((value: number) => string);

// extends: createBaseEditableHolder(), matching verified BaseKnob.vue's real
// chain exactly: `export default { name: 'BaseKnob', extends:
// BaseEditableHolder, ... }` — same tier URating/USlider already extend,
// NOT BaseInput.
//
// `componentName` and `styleModule` go through createBaseEditableHolder, so
// `cx`, style registration under the Aura `knob` key, `unstyled`,
// per-instance `dt` and `pt` all come from the shared base chain. The colour
// defaults are the `knob` token variables, read with `$dt()` as PrimeVue does.
export function createBaseKnob() {
  return defineComponent({
    extends: createBaseEditableHolder({
      componentName: "knob",
      styleModule: knobStyleModule,
    }),
    props: {
      size: { type: Number, default: 100 },
      readonly: { type: Boolean, default: false },
      step: { type: Number, default: 1 },
      min: { type: Number, default: 0 },
      max: { type: Number, default: 100 },
      valueColor: { type: String, default: () => $dt("knob.value.background").variable },
      rangeColor: { type: String, default: () => $dt("knob.range.background").variable },
      textColor: { type: String, default: () => $dt("knob.text.color").variable },
      strokeWidth: { type: Number, default: 14 },
      showValue: { type: Boolean, default: true },
      valueTemplate: {
        type: [String, Function] as PropType<UKnobValueTemplate>,
        default: "{value}",
      },
      tabindex: { type: Number, default: 0 },
      disabled: { type: Boolean, default: false },
      invalid: { type: Boolean, default: false },
      ariaLabelledby: { type: String, default: null },
      ariaLabel: { type: String, default: null },
    },
  });
}
