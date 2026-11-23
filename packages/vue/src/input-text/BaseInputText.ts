import { defineComponent } from "vue";
import { createBaseInput } from "@ultimate/vue-core";
import { inputTextStyleModule } from "./input-text-style";

// extends: createBaseInput(...), matching verified BaseInputText.vue's real
// chain exactly: InputText extends BaseInputText extends BaseInput extends
// BaseEditableHolder extends BaseComponent. `componentName` and
// `styleModule` go through createBaseInput, so `cx`, style registration,
// `unstyled`, per-instance `dt` and `pt` all come from the shared base chain.
export function createBaseInputText() {
  return defineComponent({
    extends: createBaseInput({ componentName: "inputtext", styleModule: inputTextStyleModule }),
    props: {
      disabled: { type: Boolean, default: false },
      invalid: { type: Boolean, default: false },
      name: { type: String, default: null },
      placeholder: { type: String, default: null },
    },
  });
}
