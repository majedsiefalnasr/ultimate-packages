import { defineComponent } from "vue";
import { createBaseInput, registerComponentStyle } from "@ultimate/vue-core";
import { autoCompleteStyleModule } from "./autocomplete-style";
import type { ClassValue } from "@ultimate/vue-core";

// extends: createBaseInput(), matching verified BaseAutoComplete.vue's real
// chain exactly: `export default { name: 'BaseAutoComplete', extends:
// BaseInput, ... }` — same tier UPassword (this batch's own Vue
// realization) already proves for this capability family. Same
// createBaseInput()-parameterless-signature cx()/mounted()-shadow fix
// documented in `packages/vue/src/checkbox/BaseCheckbox.ts`/
// `packages/vue/src/password/BasePassword.ts` applies identically here.
export function createBaseAutoComplete() {
  return defineComponent({
    extends: createBaseInput(),
    props: {
      suggestions: { type: Array, default: () => [] },
      optionLabel: { type: [String, Function], default: null },
      minLength: { type: Number, default: 1 },
      delay: { type: Number, default: 300 },
      placeholder: { type: String, default: null },
      disabled: { type: Boolean, default: false },
      loading: { type: Boolean, default: false },
      emptyMessage: { type: String, default: "No results found" },
      showEmptyMessage: { type: Boolean, default: true },
      inputId: { type: String, default: null },
      ariaLabel: { type: String, default: null },
      appendTo: { type: [String, Object], default: "body" },
    },
    methods: {
      cx(key: string, params?: Record<string, unknown>): ClassValue | undefined {
        const resolver = autoCompleteStyleModule.classes[key];
        if (resolver === undefined) return undefined;
        return typeof resolver === "function" ? resolver(params) : resolver;
      },
    },
    mounted() {
      registerComponentStyle("autocomplete", autoCompleteStyleModule);
    },
  });
}
