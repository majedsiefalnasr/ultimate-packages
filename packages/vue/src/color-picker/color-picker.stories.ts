import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UColorPicker } from "./index";

const meta: Meta<typeof UColorPicker> = {
  title: "Vue/ColorPicker",
  component: UColorPicker,
};

export default meta;
type Story = StoryObj<typeof UColorPicker>;

/** Default hex-format color picker. */
export const Default: Story = {
  args: {
    modelValue: null,
  },
};

/** RGB object value format. */
export const RgbFormat: Story = {
  args: {
    modelValue: null,
    format: "rgb",
  },
};
