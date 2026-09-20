import type { Meta, StoryObj } from "@storybook/angular";
import { UKnob } from "./knob";

const meta: Meta<UKnob> = {
  title: "Ng/Knob",
  component: UKnob,
};

export default meta;
type Story = StoryObj<UKnob>;

/** Default knob. */
export const Default: Story = {
  args: {
    min: 0,
    max: 100,
  },
};

/** Larger knob without the value text. */
export const NoValueText: Story = {
  args: {
    size: 150,
    showValue: false,
  },
};

/** Read-only — value displayed but cannot be changed. */
export const Readonly: Story = {
  args: {
    readonly: true,
  },
};
