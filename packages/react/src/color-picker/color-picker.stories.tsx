import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UColorPicker } from "./color-picker";
import type { UColorPickerValue } from "./color-picker";

const meta: Meta<typeof UColorPicker> = {
  title: "React/ColorPicker",
  component: UColorPicker,
};

export default meta;
type Story = StoryObj<typeof UColorPicker>;

function ColorPickerHarness(props: Omit<React.ComponentProps<typeof UColorPicker>, "value" | "onChange">) {
  const [value, setValue] = React.useState<UColorPickerValue | null>(null);
  return <UColorPicker {...props} value={value} onChange={(event) => setValue(event.value)} />;
}

/** Default hex-format color picker. */
export const Default: Story = {
  render: () => <ColorPickerHarness />,
};

/** RGB object value format. */
export const RgbFormat: Story = {
  render: () => <ColorPickerHarness format="rgb" />,
};
