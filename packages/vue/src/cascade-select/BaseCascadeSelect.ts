import { createBaseInput, registerComponentStyle } from "@ultimate/vue-core";
import { cascadeSelectStyleModule } from "./cascade-select-style";
import type { ComponentOptions } from "vue";
import type { ClassValue } from "@ultimate/vue-core";

// extends: createBaseInput(), matching verified BaseCascadeSelect.vue's real
// chain exactly: `export default { name: 'BaseCascadeSelect', extends:
// BaseInput, ... }` — confirmed against
// .vendor-extracted/vue/cascadeselect/BaseCascadeSelect.vue. Note this
// differs from Angular's own CascadeSelect, which extends
// BaseEditableHolder, not BaseInput — same per-framework tier divergence
// already documented for MultiSelect's own BaseMultiSelect.ts; both are
// followed as verified per this batch's binding instruction to check each
// framework's real extends chain independently.
//
// Same createBaseInput()-parameterless-signature cx()/mounted()-shadow fix
// documented in packages/vue/src/checkbox/BaseCheckbox.ts applies
// identically here.
export function createBaseCascadeSelect(): ComponentOptions {
  return {
    extends: createBaseInput(),
    props: {
      options: { type: Array, default: () => [] },
      optionLabel: { type: [String, Function], default: null },
      optionValue: { type: [String, Function], default: null },
      optionGroupChildren: { type: String, default: "items" },
      optionDisabled: { type: [String, Function], default: null },
      placeholder: { type: String, default: null },
      disabled: { type: Boolean, default: false },
      emptyMessage: { type: String, default: "No results found" },
      appendTo: { type: [String, Object], default: "body" },
    },
    methods: {
      cx(key: string, params?: Record<string, unknown>): ClassValue | undefined {
        const resolver = cascadeSelectStyleModule.classes[key];
        if (resolver === undefined) return undefined;
        return typeof resolver === "function" ? resolver(params) : resolver;
      },
    },
    mounted() {
      registerComponentStyle("cascade-select", cascadeSelectStyleModule);
    },
  };
}
