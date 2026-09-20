import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UKnob } from "./index";

const meta: Meta<typeof UKnob> = {
  title: "Vue/Knob",
  component: UKnob,
};

export default meta;
type Story = StoryObj<typeof UKnob>;

/** Default knob. */
export const Default: Story = {
  args: {
    modelValue: 50,
    min: 0,
    max: 100,
  },
};

/** Larger knob without the value text. */
export const NoValueText: Story = {
  args: {
    modelValue: 50,
    size: 150,
    showValue: false,
  },
};

/** Read-only — value displayed but cannot be changed. */
export const Readonly: Story = {
  args: {
    modelValue: 70,
    readonly: true,
  },
};
