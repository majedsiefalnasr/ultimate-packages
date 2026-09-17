import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UInputMask } from "./index";

/**
 * `UInputMask` is controlled via `modelValue`/`update:modelValue`, per
 * input-mask.spec.ts's masking suite (`999-999` digit-mask formatting).
 */
const meta: Meta<typeof UInputMask> = {
  title: "Vue/InputMask",
  component: UInputMask,
};

export default meta;
type Story = StoryObj<typeof UInputMask>;

export const PhoneNumber: Story = {
  args: {
    modelValue: "",
    mask: "(999) 999-9999",
  },
  render: (args) => ({
    components: { UInputMask },
    setup() {
      const modelValue = ref(args.modelValue);
      return { args, modelValue };
    },
    template: `<UInputMask v-bind="args" v-model="modelValue" />`,
  }),
};

/** Alpha-only mask (`a` slots), per input-mask.spec.ts's masking suite pattern. */
export const AlphaCode: Story = {
  args: {
    modelValue: "",
    mask: "aaa-999",
  },
  render: PhoneNumber.render,
};

export const Disabled: Story = {
  args: {
    modelValue: "123-456",
    mask: "999-999",
    disabled: true,
  },
  render: PhoneNumber.render,
};

export const Invalid: Story = {
  args: {
    modelValue: "",
    mask: "999-999",
    invalid: true,
  },
  render: PhoneNumber.render,
};
