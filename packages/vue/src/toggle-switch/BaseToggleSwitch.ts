import type { PropType } from "vue";
import { defineComponent } from "vue";
import { createBaseEditableHolder } from "@ultimate/vue-core";
import { toggleSwitchStyleModule } from "./toggle-switch-style";

// extends: createBaseEditableHolder(), matching verified BaseToggleSwitch.vue's
// real chain exactly: ToggleSwitch extends BaseToggleSwitch extends
// BaseEditableHolder extends BaseComponent — NOT BaseInput. Confirmed against
// .vendor-extracted/vue/toggleswitch/BaseToggleSwitch.vue: real PrimeVue
// ToggleSwitch declares no `fluid` prop at all and no BaseInput-tier
// ancestor-injection usage — same BaseEditableHolder-tier boundary already
// documented in packages/vue/src/toggle-button/BaseToggleButton.ts.
//
// `componentName` and `styleModule` go through createBaseEditableHolder, so
// `cx`, style registration under the Aura `toggleswitch` key, `unstyled`,
// per-instance `dt` and `pt` all come from the shared base chain.
export function createBaseToggleSwitch() {
  return defineComponent({
    extends: createBaseEditableHolder({
      componentName: "toggleswitch",
      styleModule: toggleSwitchStyleModule,
    }),
    props: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Vue infers PropType<unknown> as undefined; these props accept any value (GAP-082)
      trueValue: { type: null as unknown as PropType<any>, default: true },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Vue infers PropType<unknown> as undefined; these props accept any value (GAP-082)
      falseValue: { type: null as unknown as PropType<any>, default: false },
      readonly: { type: Boolean, default: false },
      tabindex: { type: Number, default: null },
      inputId: { type: String, default: null },
      inputClass: { type: [String, Object], default: null },
      inputStyle: { type: Object, default: null },
      ariaLabelledby: { type: String, default: null },
      ariaLabel: { type: String, default: null },
      disabled: { type: Boolean, default: false },
      invalid: { type: Boolean, default: false },
    },
  });
}
