import type { PropType } from "vue";
import { defineComponent } from "vue";
import { createBaseInput } from "@ultimate/vue-core";
import { inputMaskStyleModule } from "./input-mask-style";

// extends: createBaseInput(...), matching verified BaseInputMask.vue's real
// chain: InputMask extends BaseInputMask extends BaseInput extends
// BaseEditableHolder extends BaseComponent. `componentName` and `styleModule`
// go through createBaseInput, so `cx`, style registration, `unstyled`,
// per-instance `dt` and `pt` all come from the shared base chain.
export function createBaseInputMask() {
  return defineComponent({
    extends: createBaseInput({ componentName: "inputmask", styleModule: inputMaskStyleModule }),
    props: {
      slotChar: { type: String, default: "_" },
      id: { type: String as PropType<string | null>, default: null },
      mask: { type: String as PropType<string | null>, default: null },
      placeholder: { type: String as PropType<string | null>, default: null },
      autoClear: { type: Boolean, default: true },
      unmask: { type: Boolean, default: false },
      readonly: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false },
      invalid: { type: Boolean, default: false },
      name: { type: String as PropType<string | null>, default: null },
    },
  });
}
