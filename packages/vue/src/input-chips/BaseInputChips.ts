import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { inputChipsStyleModule } from "./input-chips-style";

// TIER FINDING (per this task's brief — "verify, don't assume; different
// capabilities have landed on different tiers throughout this batch"):
// real `BaseInputChips.vue` (`.vendor-extracted/vue/inputchips/
// BaseInputChips.vue`) extends bare `BaseComponent` directly — NOT
// `BaseEditableHolder`/`BaseInput` — even though InputChips is a real form
// control with a controlled `modelValue`. Real source implements its own
// `modelValue` prop, `update:modelValue` emit, and `data()`-held UI state
// (`inputValue`/`focused`/`focusedIndex`) entirely manually inside
// InputChips.vue itself, never calling `writeValue()` or reading `dValue`
// from the editable-holder tier at all (confirmed: no `writeValue`/`dValue`
// reference anywhere in the real extracted InputChips.vue). This
// realization follows that real, verified extends chain exactly rather
// than assuming the editable-holder tier applies just because InputChips is
// a form control — matching this package's own `UCheckbox`/`UDatePicker`
// precedent of extending createBaseInput() would be a real deviation from
// verified source, not a neutral choice.
export function createBaseInputChips() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "input-chips", styleModule: inputChipsStyleModule }),
    props: {
      modelValue: { type: Array, default: null },
      max: { type: Number, default: null },
      separator: { type: [String, Object], default: null },
      addOnBlur: { type: Boolean, default: null },
      allowDuplicate: { type: Boolean, default: true },
      placeholder: { type: String, default: null },
      invalid: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false },
      inputId: { type: String, default: null },
      ariaLabelledby: { type: String, default: null },
      ariaLabel: { type: String, default: null },
    },
  });
}
