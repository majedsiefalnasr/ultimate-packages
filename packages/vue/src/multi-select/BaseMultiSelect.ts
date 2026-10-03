import type { PropType } from "vue";
import { defineComponent } from "vue";
import { createBaseInput, registerComponentStyle } from "@ultimate/vue-core";
import { multiSelectStyleModule } from "./multi-select-style";
import type { ClassValue } from "@ultimate/vue-core";

// extends: createBaseInput(), matching verified BaseMultiSelect.vue's real
// chain exactly: `export default { name: 'BaseMultiSelect', extends:
// BaseInput, ... }` — confirmed against
// .vendor-extracted/vue/multiselect/BaseMultiSelect.vue. Note this differs
// from Angular's own MultiSelect, which extends BaseEditableHolder, not
// BaseInput — PrimeVue and PrimeNG land this same canonical capability on
// different tiers; both are followed as verified per-framework, per this
// batch's binding instruction to check each framework's real `extends`
// chain independently rather than assume cross-framework parity.
//
// Same createBaseInput()-parameterless-signature cx()/mounted()-shadow fix
// documented in packages/vue/src/checkbox/BaseCheckbox.ts/
// packages/vue/src/autocomplete/BaseAutoComplete.ts applies identically here.
export function createBaseMultiSelect() {
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
      showClear: { type: Boolean, default: false },
      showToggleAll: { type: Boolean, default: true },
      maxSelectedLabels: { type: Number, default: 3 },
      selectedItemsLabel: { type: String, default: "{0} items selected" },
      emptyMessage: { type: String, default: "No results found" },
      appendTo: { type: [String, Object], default: "body" },
    },
    methods: {
      cx(key: string, params?: Record<string, unknown>): ClassValue | undefined {
        const resolver = multiSelectStyleModule.classes[key];
        if (resolver === undefined) return undefined;
        return typeof resolver === "function" ? resolver(params) : resolver;
      },
    },
    mounted() {
      registerComponentStyle("multi-select", multiSelectStyleModule);
    },
  });
}
