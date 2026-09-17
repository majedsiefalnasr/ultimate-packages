import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UInputNumber } from "./input-number";

const meta: Meta<typeof UInputNumber> = {
  title: "React/InputNumber",
  component: UInputNumber,
};

export default meta;
type Story = StoryObj<typeof UInputNumber>;

function InputNumberHarness(props: React.ComponentProps<typeof UInputNumber>) {
  const [value, setValue] = React.useState(props.value ?? null);
  return <UInputNumber {...props} value={value} onValueChange={(e) => setValue(e.value)} />;
}

export const Default: Story = {
  args: { value: 0 },
  render: (args) => <InputNumberHarness {...args} />,
};

export const WithButtons: Story = {
  args: { value: 0, showButtons: true },
  render: (args) => <InputNumberHarness {...args} />,
};

export const Currency: Story = {
  args: { value: 1000, mode: "currency", currency: "USD", locale: "en-US" },
  render: (args) => <InputNumberHarness {...args} />,
};

export const MinMax: Story = {
  args: { value: 5, min: 0, max: 10, showButtons: true },
  render: (args) => <InputNumberHarness {...args} />,
};

export const Disabled: Story = {
  args: { value: 42, disabled: true },
  render: (args) => <InputNumberHarness {...args} />,
};

export const Invalid: Story = {
  args: { value: null, invalid: true },
  render: (args) => <InputNumberHarness {...args} />,
};
