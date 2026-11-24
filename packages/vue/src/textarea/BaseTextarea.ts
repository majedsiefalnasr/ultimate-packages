import { defineComponent } from "vue";
import { createBaseInput } from "@ultimate/vue-core";
import { textareaStyleModule } from "./textarea-style";

// extends: createBaseInput(...), matching verified BaseTextarea.vue's real
// chain exactly: Textarea extends BaseTextarea extends BaseInput extends
// BaseEditableHolder extends BaseComponent. `componentName` and
// `styleModule` go through createBaseInput, so `cx`, style registration,
// `unstyled`, per-instance `dt` and `pt` all come from the shared base
// chain. `autoResize` is real BaseTextarea.vue's own single local prop
// addition on top of BaseInput.
export function createBaseTextarea() {
  return defineComponent({
    extends: createBaseInput({ componentName: "textarea", styleModule: textareaStyleModule }),
    props: {
      autoResize: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false },
      invalid: { type: Boolean, default: false },
      name: { type: String, default: null },
      placeholder: { type: String, default: null },
    },
  });
}
