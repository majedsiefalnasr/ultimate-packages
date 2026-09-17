import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UInputNumber } from "./index";

/**
 * `UInputNumber` is controlled via `modelValue`/`update:modelValue`, per
 * input-number.spec.ts's "formats modelValue with grouping separators"
 * test — displays a locale-formatted string while blurred, the raw numeric
 * text while focused.
 */
const meta: Meta<typeof UInputNumber> = {
  title: "Vue/InputNumber",
  component: UInputNumber,
};

export default meta;
type Story = StoryObj<typeof UInputNumber>;

export const Default: Story = {
  args: {
    modelValue: 1234,
    locale: "en-US",
  },
  render: (args) => ({
    components: { UInputNumber },
    setup() {
      const modelValue = ref(args.modelValue);
      return { args, modelValue };
    },
    template: `<UInputNumber v-bind="args" v-model="modelValue" />`,
  }),
};

/** Clamped range, per input-number.spec.ts's min/max clamping suite. */
export const MinMax: Story = {
  args: {
    modelValue: 5,
    min: 0,
    max: 10,
    locale: "en-US",
  },
  render: Default.render,
};

/** Currency mode using Intl.NumberFormat's currency formatting. */
export const Currency: Story = {
  args: {
    modelValue: 99.99,
    mode: "currency",
    currency: "USD",
    locale: "en-US",
  },
  render: Default.render,
};

export const Disabled: Story = {
  args: {
    modelValue: 42,
    disabled: true,
    locale: "en-US",
  },
  render: Default.render,
};

export const Invalid: Story = {
  args: {
    modelValue: null,
    invalid: true,
    locale: "en-US",
  },
  render: Default.render,
};
