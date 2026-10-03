import type { PropType } from "vue";
import { defineComponent } from "vue";
import { createBaseEditableHolder, registerComponentStyle } from "@ultimate/vue-core";
import { toggleSwitchStyleModule } from "./toggle-switch-style";
import type { ClassValue } from "@ultimate/vue-core";

// extends: createBaseEditableHolder(), matching verified BaseToggleSwitch.vue's
// real chain exactly: ToggleSwitch extends BaseToggleSwitch extends
// BaseEditableHolder extends BaseComponent — NOT BaseInput. Confirmed against
// .vendor-extracted/vue/toggleswitch/BaseToggleSwitch.vue: real PrimeVue
// ToggleSwitch declares no `fluid` prop at all and no BaseInput-tier
// ancestor-injection usage — same BaseEditableHolder-tier boundary already
// documented in packages/vue/src/toggle-button/BaseToggleButton.ts.
//
// Same createBaseInput()-parameterless-signature finding documented in
// packages/vue/src/checkbox/BaseCheckbox.ts applies identically here:
// calling createBaseEditableHolder() bare always internally defaults to an
// empty `{componentName: "", styleModule: {css: "", classes: {}}}`, so
// cx()/mounted() are shadowed locally with real closures over
// toggleSwitchStyleModule, matching Checkbox/RadioButton/ToggleButton's
// established fix.
export function createBaseToggleSwitch() {
  return defineComponent({
    extends: createBaseEditableHolder(),
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
    methods: {
      cx(key: string, params?: Record<string, unknown>): ClassValue | undefined {
        const resolver = toggleSwitchStyleModule.classes[key];
        if (resolver === undefined) return undefined;
        return typeof resolver === "function" ? resolver(params) : resolver;
      },
    },
    mounted() {
      registerComponentStyle("toggle-switch", toggleSwitchStyleModule);
    },
  });
}
