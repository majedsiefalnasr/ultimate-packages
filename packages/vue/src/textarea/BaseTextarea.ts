import { createBaseInput, registerComponentStyle } from "@ultimate/vue-core";
import { textareaStyleModule } from "./textarea-style";
import type { ComponentOptions } from "vue";
import type { ClassValue } from "@ultimate/vue-core";

// extends: createBaseInput(), matching verified BaseTextarea.vue's real
// chain exactly: Textarea extends BaseTextarea extends BaseInput extends
// BaseEditableHolder extends BaseComponent — same createBaseInput()-tier
// chain already established for RadioButton/InputText. `autoResize` is real
// BaseTextarea.vue's own single local prop addition on top of BaseInput
// (confirmed: BaseTextarea.vue declares `props: { autoResize: Boolean }`
// and nothing else of its own).
export function createBaseTextarea(): ComponentOptions {
  return {
    extends: createBaseInput(),
    props: {
      autoResize: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false },
      invalid: { type: Boolean, default: false },
      name: { type: String, default: null },
      placeholder: { type: String, default: null },
    },
    methods: {
      cx(key: string, params?: Record<string, unknown>): ClassValue | undefined {
        const resolver = textareaStyleModule.classes[key];
        if (resolver === undefined) return undefined;
        return typeof resolver === "function" ? resolver(params) : resolver;
      },
    },
    mounted() {
      registerComponentStyle("textarea", textareaStyleModule);
    },
  };
}
