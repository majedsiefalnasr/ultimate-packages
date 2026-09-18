import type { Meta, StoryObj } from "@storybook/angular";
import { USlider } from "./slider";

const meta: Meta<USlider> = {
  title: "Ng/Slider",
  component: USlider,
};

export default meta;
type Story = StoryObj<USlider>;

/** Single-handle slider. */
export const Default: Story = {
  args: {
    min: 0,
    max: 100,
  },
};

/** Two-handle range slider. */
export const Range: Story = {
  args: {
    min: 0,
    max: 100,
    range: true,
  },
};

/** Vertical orientation. */
export const Vertical: Story = {
  args: {
    min: 0,
    max: 100,
    orientation: "vertical",
  },
};
