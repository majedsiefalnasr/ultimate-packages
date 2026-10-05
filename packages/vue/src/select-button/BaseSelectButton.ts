import type { PropType } from "vue";
import { defineComponent } from "vue";
import { createBaseEditableHolder, registerComponentStyle } from "@ultimate/vue-core";
import { selectButtonStyleModule } from "./select-button-style";
import type { ClassValue } from "@ultimate/vue-core";

// extends: createBaseEditableHolder(), matching verified BaseSelectButton.vue's
// real chain exactly: `export default { name: 'BaseSelectButton', extends:
// BaseEditableHolder, ... }` — confirmed against
// .vendor-extracted/vue/selectbutton/BaseSelectButton.vue — NOT BaseInput,
// same tier UToggleButton (this batch's composed leaf) already extends.
//
// Same createBaseInput()-parameterless-signature cx()/mounted()-shadow fix
// documented in packages/vue/src/checkbox/BaseCheckbox.ts/
// packages/vue/src/toggle-button/BaseToggleButton.ts applies identically here.
export function createBaseSelectButton() {
  return defineComponent({
    extends: createBaseEditableHolder(),
    props: {
      options: { type: Array as PropType<readonly unknown[]>, default: () => [] },
      optionLabel: { type: [String, Function], default: null },
      optionValue: { type: [String, Function], default: null },
      optionDisabled: { type: [String, Function], default: null },
      multiple: { type: Boolean, default: false },
      allowEmpty: { type: Boolean, default: true },
      disabled: { type: Boolean, default: false },
      ariaLabelledby: { type: String, default: null },
    },
    methods: {
      cx(key: string, params?: Record<string, unknown>): ClassValue | undefined {
        const resolver = selectButtonStyleModule.classes[key];
        if (resolver === undefined) return undefined;
        return typeof resolver === "function" ? resolver(params) : resolver;
      },
    },
    mounted() {
      registerComponentStyle("selectbutton", selectButtonStyleModule);
    },
  });
}
