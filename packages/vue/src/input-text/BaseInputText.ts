import { defineComponent } from "vue";
import { createBaseInput, registerComponentStyle } from "@ultimate/vue-core";
import { inputTextStyleModule } from "./input-text-style";
import type { ClassValue } from "@ultimate/vue-core";

// extends: createBaseInput(), matching verified BaseInputText.vue's real
// chain exactly: InputText extends BaseInputText extends BaseInput extends
// BaseEditableHolder extends BaseComponent — same createBaseInput()-tier
// chain already established for RadioButton (packages/vue/src/radio-button/
// BaseRadioButton.ts), reused here for the same reason (real source's own
// `extends: BaseInput` line in BaseInputText.vue).
//
// Same createBaseInput()-parameterless-signature fix documented in
// packages/vue/src/checkbox/BaseCheckbox.ts applies identically here: cx()/
// mounted() are shadowed locally with real closures over
// inputTextStyleModule.
export function createBaseInputText() {
  return defineComponent({
    extends: createBaseInput(),
    props: {
      disabled: { type: Boolean, default: false },
      invalid: { type: Boolean, default: false },
      name: { type: String, default: null },
      placeholder: { type: String, default: null },
    },
    methods: {
      cx(key: string, params?: Record<string, unknown>): ClassValue | undefined {
        const resolver = inputTextStyleModule.classes[key];
        if (resolver === undefined) return undefined;
        return typeof resolver === "function" ? resolver(params) : resolver;
      },
    },
    mounted() {
      registerComponentStyle("inputtext", inputTextStyleModule);
    },
  });
}
