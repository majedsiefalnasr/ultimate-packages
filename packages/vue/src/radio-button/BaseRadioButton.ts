import type { PropType } from "vue";
import { defineComponent } from "vue";
import { createBaseInput, registerComponentStyle } from "@ultimate/vue-core";
import { radioButtonStyleModule } from "./radio-button-style";
import type { ClassValue } from "@ultimate/vue-core";

// extends: createBaseInput(), matching verified BaseRadioButton.vue's real
// chain exactly: RadioButton extends BaseRadioButton extends BaseInput
// extends BaseEditableHolder extends BaseComponent — same chain
// createBaseCheckbox() already establishes and documents (see
// packages/vue/src/checkbox/BaseCheckbox.ts's own doc comment for the full
// createBaseInput()-parameterless-signature finding this file reuses
// verbatim).
export function createBaseRadioButton() {
  return defineComponent({
    extends: createBaseInput(),
    props: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Vue infers PropType<unknown> as undefined; these props accept any value (GAP-082)
      value: { type: null as unknown as PropType<any>, default: null },
      binary: { type: Boolean, default: false },
      readonly: { type: Boolean, default: false },
      tabindex: { type: Number, default: null },
      inputId: { type: String, default: null },
      inputClass: { type: [String, Object], default: null },
      inputStyle: { type: Object, default: null },
      ariaLabelledby: { type: String, default: null },
      ariaLabel: { type: String, default: null },
      disabled: { type: Boolean, default: false },
      required: { type: Boolean, default: false },
      invalid: { type: Boolean, default: false },
      name: { type: String, default: null },
    },
    methods: {
      cx(key: string, params?: Record<string, unknown>): ClassValue | undefined {
        const resolver = radioButtonStyleModule.classes[key];
        if (resolver === undefined) return undefined;
        return typeof resolver === "function" ? resolver(params) : resolver;
      },
    },
    mounted() {
      registerComponentStyle("radio-button", radioButtonStyleModule);
    },
  });
}
