import { defineComponent } from "vue";
import { createBaseInput, registerComponentStyle } from "@ultimate/vue-core";
import { inputMaskStyleModule } from "./input-mask-style";
import type { ClassValue } from "@ultimate/vue-core";

// extends: createBaseInput(), matching verified BaseInputMask.vue's real
// chain exactly: InputMask extends BaseInputMask extends BaseInput extends
// BaseEditableHolder extends BaseComponent. Real BaseInputMask.vue's own
// prop set (slotChar, mask, placeholder, autoClear, unmask, readonly) is
// ported below verbatim.
export function createBaseInputMask() {
  return defineComponent({
    extends: createBaseInput(),
    props: {
      slotChar: { type: String, default: "_" },
      mask: { type: String, default: null },
      placeholder: { type: String, default: null },
      autoClear: { type: Boolean, default: true },
      unmask: { type: Boolean, default: false },
      readonly: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false },
      invalid: { type: Boolean, default: false },
      name: { type: String, default: null },
    },
    methods: {
      cx(key: string, params?: Record<string, unknown>): ClassValue | undefined {
        const resolver = inputMaskStyleModule.classes[key];
        if (resolver === undefined) return undefined;
        return typeof resolver === "function" ? resolver(params) : resolver;
      },
    },
    mounted() {
      registerComponentStyle("input-mask", inputMaskStyleModule);
    },
  });
}
