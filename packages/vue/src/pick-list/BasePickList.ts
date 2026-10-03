import type { PropType } from "vue";
import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { pickListStyleModule } from "./pick-list-style";

export function createBasePickList() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "pick-list", styleModule: pickListStyleModule }),
    props: {
      modelValue: { type: Array as PropType<readonly unknown[]>, default: () => [[], []] },
      dataKey: { type: String, default: null },
      metaKeySelection: { type: Boolean, default: false },
      autoOptionFocus: { type: Boolean, default: true },
      focusOnHover: { type: Boolean, default: false },
      responsive: { type: Boolean, default: true },
      breakpoint: { type: String, default: "960px" },
      striped: { type: Boolean, default: false },
      scrollHeight: { type: String, default: "14rem" },
      tabindex: { type: Number, default: 0 },
      disabled: { type: Boolean, default: false },
      ariaLabel: { type: String, default: "Pick list" },
      ariaLabelledby: { type: String, default: null },
      showSourceControls: { type: Boolean, default: true },
      showTargetControls: { type: Boolean, default: true },
      buttonProps: { type: Object, default: () => ({}) },
      moveUpButtonProps: { type: Object, default: () => ({}) },
      moveTopButtonProps: { type: Object, default: () => ({}) },
      moveDownButtonProps: { type: Object, default: () => ({}) },
      moveBottomButtonProps: { type: Object, default: () => ({}) },
      moveToTargetButtonProps: { type: Object, default: () => ({}) },
      moveAllToTargetButtonProps: { type: Object, default: () => ({}) },
      moveToSourceButtonProps: { type: Object, default: () => ({}) },
      moveAllToSourceButtonProps: { type: Object, default: () => ({}) },
    },
    emits: ["update:modelValue"],
  });
}
