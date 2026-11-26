import type { Meta, StoryObj } from "@storybook/angular";
import { UColorPicker } from "./color-picker";

const meta: Meta<UColorPicker> = {
  title: "Ng/ColorPicker",
  component: UColorPicker,
};

export default meta;
type Story = StoryObj<UColorPicker>;

/** Default hex-format color picker. */
export const Default: Story = {
  args: {},
};

/** RGB object value format. */
export const RgbFormat: Story = {
  args: {
    format: "rgb",
  },
};

/** The panel rendered in place, without the preview input. */
export const Inline: Story = {
  args: {
    inline: true,
  },
};
