import type { PropType } from "vue";
import { defineComponent } from "vue";
import { createBaseInput, registerComponentStyle } from "@ultimate/vue-core";
import { selectStyleModule } from "./select-style";
import type { ClassValue } from "@ultimate/vue-core";

// extends: createBaseInput(), matching verified BaseSelect.vue's real chain
// exactly: `export default { name: 'BaseSelect', extends: BaseInput, ... }`
// — confirmed against .vendor-extracted/vue/select/BaseSelect.vue — same
// tier UAutoComplete/UPassword already extend.
//
// Same createBaseInput()-parameterless-signature cx()/mounted()-shadow fix
// documented in packages/vue/src/checkbox/BaseCheckbox.ts/
// packages/vue/src/autocomplete/BaseAutoComplete.ts applies identically here.
export function createBaseSelect() {
  return defineComponent({
    extends: createBaseInput(),
    props: {
      options: { type: Array as PropType<readonly unknown[]>, default: () => [] },
      optionLabel: { type: [String, Function], default: null },
      optionValue: { type: [String, Function], default: null },
      optionDisabled: { type: [String, Function], default: null },
      placeholder: { type: String, default: null },
      disabled: { type: Boolean, default: false },
      filter: { type: Boolean, default: false },
      filterPlaceholder: { type: String, default: null },
      ariaFilterLabel: { type: String, default: null },
      showClear: { type: Boolean, default: false },
      inputId: { type: String, default: null },
      ariaLabel: { type: String, default: null },
      emptyMessage: { type: String, default: "No results found" },
      appendTo: { type: [String, Object], default: "body" },
    },
    methods: {
      cx(key: string, params?: Record<string, unknown>): ClassValue | undefined {
        const resolver = selectStyleModule.classes[key];
        if (resolver === undefined) return undefined;
        return typeof resolver === "function" ? resolver(params) : resolver;
      },
    },
    mounted() {
      registerComponentStyle("select", selectStyleModule);
    },
  });
}
