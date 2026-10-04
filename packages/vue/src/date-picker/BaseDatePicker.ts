import type { PropType } from "vue";
import { defineComponent } from "vue";
import { createBaseInput, registerComponentStyle } from "@ultimate/vue-core";
import { datePickerStyleModule } from "./date-picker-style";
import type { ClassValue } from "@ultimate/vue-core";

// extends: createBaseInput(), matching verified BaseDatePicker.vue's real
// chain exactly: `export default { name: 'BaseDatePicker', extends:
// BaseInput, ... }` — confirmed against
// .vendor-extracted/vue/datepicker/BaseDatePicker.vue — same tier
// USelect/UAutoComplete already extend.
//
// Same createBaseInput()-parameterless-signature cx()/mounted()-shadow fix
// documented in packages/vue/src/select/BaseSelect.ts applies identically
// here.
export function createBaseDatePicker() {
  return defineComponent({
    extends: createBaseInput(),
    props: {
      placeholder: { type: String, default: null },
      disabled: { type: Boolean, default: false },
      inputId: { type: String, default: null },
      minDate: { type: Date, default: null },
      maxDate: { type: Date, default: null },
      disabledDates: { type: Array as PropType<readonly unknown[]>, default: () => [] },
      showIcon: { type: Boolean, default: false },
      showClear: { type: Boolean, default: false },
      dayNames: {
        type: Array as PropType<readonly unknown[]>,
        default: () => ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
      },
      monthNames: {
        type: Array as PropType<readonly unknown[]>,
        default: () => [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ],
      },
      appendTo: { type: [String, Object], default: "body" },
    },
    methods: {
      cx(key: string, params?: Record<string, unknown>): ClassValue | undefined {
        const resolver = datePickerStyleModule.classes[key];
        if (resolver === undefined) return undefined;
        return typeof resolver === "function" ? resolver(params) : resolver;
      },
    },
    mounted() {
      registerComponentStyle("date-picker", datePickerStyleModule);
    },
  });
}
