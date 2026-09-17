import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UInputOtp } from "./input-otp";

const meta: Meta<typeof UInputOtp> = {
  title: "React/InputOtp",
  component: UInputOtp,
};

export default meta;
type Story = StoryObj<typeof UInputOtp>;

function InputOtpHarness(props: React.ComponentProps<typeof UInputOtp>) {
  const [value, setValue] = React.useState(props.value ?? "");
  return <UInputOtp {...props} value={value} onChange={(e) => setValue(e.value)} />;
}

export const Default: Story = {
  args: { value: "", length: 4 },
  render: (args) => <InputOtpHarness {...args} />,
};

export const IntegerOnly: Story = {
  args: { value: "", length: 6, integerOnly: true },
  render: (args) => <InputOtpHarness {...args} />,
};

export const Masked: Story = {
  args: { value: "", length: 4, mask: true },
  render: (args) => <InputOtpHarness {...args} />,
};

export const Disabled: Story = {
  args: { value: "1234", length: 4, disabled: true },
  render: (args) => <InputOtpHarness {...args} />,
};

export const Invalid: Story = {
  args: { value: "", length: 4, invalid: true },
  render: (args) => <InputOtpHarness {...args} />,
};
