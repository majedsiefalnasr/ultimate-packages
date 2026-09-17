import { createBaseEditableHolder, registerComponentStyle } from "@ultimate/vue-core";
import { toggleButtonStyleModule } from "./toggle-button-style";
import type { ComponentOptions } from "vue";
import type { ClassValue } from "@ultimate/vue-core";

// extends: createBaseEditableHolder(), matching verified BaseToggleButton.vue's
// real chain exactly: ToggleButton extends BaseToggleButton extends
// BaseEditableHolder extends BaseComponent — NOT BaseInput. Confirmed against
// .vendor-extracted/vue/togglebutton/BaseToggleButton.vue: real PrimeVue
// ToggleButton has no `value`/`binary` prop dichotomy (it is always a pure
// boolean toggle) and no `fluid`-ancestor-injection usage inside its own
// template/style resolution beyond a plain own `fluid` prop — it extends
// BaseEditableHolder directly, one tier below BaseInput, unlike
// RadioButton/Checkbox (which are real BaseInput consumers). Per spec §7's
// binding instruction, ambient-Fluid injection (`resolvedFluid`/`pcFluid`)
// is only established at the BaseInput tier in this repo's own foundation
// (packages/vue-core/src/base/base-input.ts) — inventing an equivalent for a
// BaseEditableHolder-tier component would be a new architectural pattern,
// not authorized here, so `fluid` is kept as the plain own boolean prop real
// upstream itself declares, with no ambient-injection fallback.
//
// Same createBaseInput()-parameterless-signature finding documented in
// packages/vue/src/checkbox/BaseCheckbox.ts applies identically to
// createBaseEditableHolder(): calling it bare always internally defaults to
// an empty `{componentName: "", styleModule: {css: "", classes: {}}}`, so
// cx()/mounted() are shadowed locally with real closures over
// toggleButtonStyleModule, matching Checkbox/RadioButton's established fix.
export function createBaseToggleButton(): ComponentOptions {
  return {
    extends: createBaseEditableHolder(),
    props: {
      onIcon: { type: String, default: null },
      offIcon: { type: String, default: null },
      onLabel: { type: String, default: "Yes" },
      offLabel: { type: String, default: "No" },
      readonly: { type: Boolean, default: false },
      tabindex: { type: Number, default: null },
      ariaLabelledby: { type: String, default: null },
      ariaLabel: { type: String, default: null },
      disabled: { type: Boolean, default: false },
      invalid: { type: Boolean, default: false },
      fluid: { type: Boolean, default: false },
    },
    methods: {
      cx(key: string, params?: Record<string, unknown>): ClassValue | undefined {
        const resolver = toggleButtonStyleModule.classes[key];
        if (resolver === undefined) return undefined;
        return typeof resolver === "function" ? resolver(params) : resolver;
      },
    },
    mounted() {
      registerComponentStyle("toggle-button", toggleButtonStyleModule);
    },
  };
}
