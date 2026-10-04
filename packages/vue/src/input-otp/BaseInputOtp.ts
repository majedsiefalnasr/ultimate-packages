import { defineComponent } from "vue";
import { createBaseInput, registerComponentStyle } from "@ultimate/vue-core";
import { inputOtpStyleModule } from "./input-otp-style";
import type { ClassValue } from "@ultimate/vue-core";

// extends: createBaseInput(), matching verified BaseInputOtp.vue's real
// chain exactly: InputOtp extends BaseInputOtp extends BaseInput extends
// BaseEditableHolder extends BaseComponent. Real BaseInputOtp.vue's own
// prop set (readonly, tabindex, length, mask, integerOnly) is ported below
// verbatim on top of createBaseInput()'s size/fluid/variant/resolved*.
export function createBaseInputOtp() {
  return defineComponent({
    extends: createBaseInput(),
    props: {
      readonly: { type: Boolean, default: false },
      tabindex: { type: Number, default: null },
      length: { type: Number, default: 4 },
      mask: { type: Boolean, default: false },
      integerOnly: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false },
      invalid: { type: Boolean, default: false },
      name: { type: String, default: null },
    },
    methods: {
      cx(key: string, params?: Record<string, unknown>): ClassValue | undefined {
        const resolver = inputOtpStyleModule.classes[key];
        if (resolver === undefined) return undefined;
        return typeof resolver === "function" ? resolver(params) : resolver;
      },
    },
    mounted() {
      registerComponentStyle("input-otp", inputOtpStyleModule);
    },
  });
}
