import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UInputMask } from "./input-mask";

const meta: Meta<typeof UInputMask> = {
  title: "React/InputMask",
  component: UInputMask,
};

export default meta;
type Story = StoryObj<typeof UInputMask>;

function InputMaskHarness(props: React.ComponentProps<typeof UInputMask>) {
  const [value, setValue] = React.useState(props.value ?? "");
  return <UInputMask {...props} value={value} onChange={(e) => setValue(e.value)} />;
}

export const PhoneNumber: Story = {
  args: { value: "", mask: "(999) 999-9999" },
  render: (args) => <InputMaskHarness {...args} />,
};

export const SSN: Story = {
  args: { value: "", mask: "999-99-9999" },
  render: (args) => <InputMaskHarness {...args} />,
};

export const Disabled: Story = {
  args: { value: "123-45-6789", mask: "999-99-9999", disabled: true },
  render: (args) => <InputMaskHarness {...args} />,
};

export const Invalid: Story = {
  args: { value: "", mask: "999-99-9999", invalid: true },
  render: (args) => <InputMaskHarness {...args} />,
};
