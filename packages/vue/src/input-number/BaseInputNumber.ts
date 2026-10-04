import type { PropType } from "vue";
import { defineComponent } from "vue";
import { createBaseInput, registerComponentStyle } from "@ultimate/vue-core";
import { inputNumberStyleModule } from "./input-number-style";
import type { ClassValue } from "@ultimate/vue-core";

// extends: createBaseInput(), matching verified BaseInputNumber.vue's real
// chain exactly: InputNumber extends BaseInputNumber extends BaseInput
// extends BaseEditableHolder extends BaseComponent. Real BaseInputNumber.vue
// declares a much larger prop surface (~30 props: showButtons/buttonLayout/
// increment+decrementButton*/currency*/roundingMode/highlightOnFocus/
// showClear/etc, all spin-button/currency/clipboard-adjacent) — only the
// subset this port's own documented scope covers is ported here (see
// InputNumber.vue's class doc comment for the full cut rationale, mirroring
// UInputNumber's Angular precedent of documenting its own exclusions
// in-line rather than silently dropping surface).
export function createBaseInputNumber() {
  return defineComponent({
    extends: createBaseInput(),
    props: {
      locale: { type: String, default: undefined },
      mode: { type: String, default: "decimal" },
      currency: { type: String, default: undefined },
      useGrouping: { type: Boolean, default: true },
      minFractionDigits: { type: Number, default: undefined },
      maxFractionDigits: { type: Number, default: undefined },
      min: { type: Number as PropType<number | null>, default: null },
      max: { type: Number as PropType<number | null>, default: null },
      step: { type: Number, default: 1 },
      allowEmpty: { type: Boolean, default: true },
      prefix: { type: String as PropType<string | null>, default: null },
      suffix: { type: String as PropType<string | null>, default: null },
      placeholder: { type: String, default: null },
      readonly: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false },
      invalid: { type: Boolean, default: false },
      name: { type: String, default: null },
    },
    methods: {
      cx(key: string, params?: Record<string, unknown>): ClassValue | undefined {
        const resolver = inputNumberStyleModule.classes[key];
        if (resolver === undefined) return undefined;
        return typeof resolver === "function" ? resolver(params) : resolver;
      },
    },
    mounted() {
      registerComponentStyle("inputnumber", inputNumberStyleModule, ["inputtext"]);
    },
  });
}
