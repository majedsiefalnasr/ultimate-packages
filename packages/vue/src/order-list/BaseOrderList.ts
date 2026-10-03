import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { orderListStyleModule } from "./order-list-style";

export function createBaseOrderList() {
  return defineComponent({
    extends: createBaseComponent({
      componentName: "order-list",
      styleModule: orderListStyleModule,
    }),
    props: {
      modelValue: { type: Array, default: () => [] },
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
      ariaLabel: { type: String, default: "Order list" },
      ariaLabelledby: { type: String, default: null },

      buttonProps: { type: Object, default: () => ({}) },
      moveUpButtonProps: { type: Object, default: () => ({}) },
      moveTopButtonProps: { type: Object, default: () => ({}) },
      moveDownButtonProps: { type: Object, default: () => ({}) },
      moveBottomButtonProps: { type: Object, default: () => ({}) },
    },
    emits: ["update:modelValue"],
  });
}
