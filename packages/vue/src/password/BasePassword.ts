import { createBaseInput, registerComponentStyle } from "@ultimate/vue-core";
import { passwordStyleModule } from "./password-style";
import type { ComponentOptions } from "vue";
import type { ClassValue } from "@ultimate/vue-core";

// extends: createBaseInput(), matching verified BasePassword.vue's real
// chain exactly: Password extends BasePassword extends BaseInput extends
// BaseEditableHolder extends BaseComponent (`BasePassword.vue`:
// `extends: BaseInput` — confirmed directly against real source, same tier
// `UInputNumber`(Angular)/`UPassword`(this batch's own Angular realization)
// already prove for this capability specifically).
//
// Same createBaseInput()-parameterless-signature finding documented in
// `packages/vue/src/checkbox/BaseCheckbox.ts` applies identically here:
// calling createBaseEditableHolder()/createBaseInput() bare always
// internally defaults to an empty `{componentName: "", styleModule: {css:
// "", classes: {}}}`, so cx()/mounted() are shadowed locally with real
// closures over passwordStyleModule, matching Checkbox/RadioButton/
// ToggleButton/ToggleSwitch's established fix.
export function createBasePassword(): ComponentOptions {
  return {
    extends: createBaseInput(),
    props: {
      feedback: { type: Boolean, default: true },
      toggleMask: { type: Boolean, default: false },
      promptLabel: { type: String, default: "Enter a password" },
      weakLabel: { type: String, default: "Weak" },
      mediumLabel: { type: String, default: "Medium" },
      strongLabel: { type: String, default: "Strong" },
      mediumRegex: {
        type: String,
        default:
          "^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})",
      },
      strongRegex: { type: String, default: "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})" },
      placeholder: { type: String, default: null },
      disabled: { type: Boolean, default: false },
      inputId: { type: String, default: null },
      ariaLabel: { type: String, default: null },
      ariaLabelledby: { type: String, default: null },
      appendTo: { type: [String, Object], default: "body" },
    },
    methods: {
      cx(key: string, params?: Record<string, unknown>): ClassValue | undefined {
        const resolver = passwordStyleModule.classes[key];
        if (resolver === undefined) return undefined;
        return typeof resolver === "function" ? resolver(params) : resolver;
      },
    },
    mounted() {
      registerComponentStyle("password", passwordStyleModule);
    },
  };
}
