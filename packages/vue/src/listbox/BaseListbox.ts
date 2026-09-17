import { createBaseEditableHolder, registerComponentStyle } from "@ultimate/vue-core";
import { listboxStyleModule } from "./listbox-style";
import type { ComponentOptions } from "vue";
import type { ClassValue } from "@ultimate/vue-core";

// extends: createBaseEditableHolder(), matching verified BaseListbox.vue's
// real chain exactly: `export default { name: 'BaseListbox', extends:
// BaseEditableHolder, ... }` — confirmed against
// .vendor-extracted/vue/listbox/BaseListbox.vue — NOT BaseInput, same tier
// UMultiSelect/USelectButton already extend.
//
// Same createBaseInput()-parameterless-signature cx()/mounted()-shadow fix
// documented in packages/vue/src/checkbox/BaseCheckbox.ts applies
// identically here.
export function createBaseListbox(): ComponentOptions {
  return {
    extends: createBaseEditableHolder(),
    props: {
      options: { type: Array, default: () => [] },
      optionLabel: { type: [String, Function], default: null },
      optionValue: { type: [String, Function], default: null },
      optionDisabled: { type: [String, Function], default: null },
      multiple: { type: Boolean, default: false },
      filter: { type: Boolean, default: false },
      filterPlaceholder: { type: String, default: null },
      disabled: { type: Boolean, default: false },
      ariaLabel: { type: String, default: null },
      emptyMessage: { type: String, default: "No results found" },
    },
    methods: {
      cx(key: string, params?: Record<string, unknown>): ClassValue | undefined {
        const resolver = listboxStyleModule.classes[key];
        if (resolver === undefined) return undefined;
        return typeof resolver === "function" ? resolver(params) : resolver;
      },
    },
    mounted() {
      registerComponentStyle("listbox", listboxStyleModule);
    },
  };
}
