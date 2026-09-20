import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UInputOtp } from "./index";

/**
 * `UInputOtp` is controlled via `modelValue`/`update:modelValue`, joining
 * `length` per-segment native inputs into a single string value, per
 * input-otp.spec.ts's "splits modelValue across segments" test.
 */
const meta: Meta<typeof UInputOtp> = {
  title: "Vue/InputOtp",
  component: UInputOtp,
};

export default meta;
type Story = StoryObj<typeof UInputOtp>;

export const Default: Story = {
  args: {
    modelValue: "",
    length: 4,
  },
  render: (args) => ({
    components: { UInputOtp },
    setup() {
      const modelValue = ref(args.modelValue);
      return { args, modelValue };
    },
    template: `<UInputOtp v-bind="args" v-model="modelValue" />`,
  }),
};

/** Numeric-only entry, per input-otp.spec.ts's integerOnly suite. */
export const IntegerOnly: Story = {
  args: {
    modelValue: "",
    length: 6,
    integerOnly: true,
  },
  render: Default.render,
};

/** Masked (password-style) segments, per input-otp.spec.ts's masking suite. */
export const Masked: Story = {
  args: {
    modelValue: "1234",
    length: 4,
    mask: true,
  },
  render: Default.render,
};

export const Disabled: Story = {
  args: {
    modelValue: "",
    length: 4,
    disabled: true,
  },
  render: Default.render,
};

export const Invalid: Story = {
  args: {
    modelValue: "",
    length: 4,
    invalid: true,
  },
  render: Default.render,
};
