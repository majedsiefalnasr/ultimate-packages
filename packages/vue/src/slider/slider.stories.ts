import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { USlider } from "./index";

const meta: Meta<typeof USlider> = {
  title: "Vue/Slider",
  component: USlider,
};

export default meta;
type Story = StoryObj<typeof USlider>;

/** Single-handle slider. */
export const Default: Story = {
  args: {
    modelValue: 50,
    min: 0,
    max: 100,
  },
};

/** Two-handle range slider. */
export const Range: Story = {
  args: {
    modelValue: [20, 80],
    min: 0,
    max: 100,
    range: true,
  },
};

/** Vertical orientation. */
export const Vertical: Story = {
  args: {
    modelValue: 50,
    min: 0,
    max: 100,
    orientation: "vertical",
  },
};
