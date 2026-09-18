import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { USlider } from "./slider";

const meta: Meta<typeof USlider> = {
  title: "React/Slider",
  component: USlider,
};

export default meta;
type Story = StoryObj<typeof USlider>;

function SliderHarness(props: Omit<React.ComponentProps<typeof USlider>, "value" | "onChange">) {
  const [value, setValue] = React.useState<number | number[]>(props.range ? [20, 80] : 50);
  return <USlider {...props} value={value} onChange={(event) => setValue(event.value)} />;
}

/** Single-handle slider. */
export const Default: Story = {
  render: () => <SliderHarness min={0} max={100} />,
};

/** Two-handle range slider. */
export const Range: Story = {
  render: () => <SliderHarness min={0} max={100} range />,
};

/** Vertical orientation. */
export const Vertical: Story = {
  render: () => <SliderHarness min={0} max={100} orientation="vertical" />,
};
