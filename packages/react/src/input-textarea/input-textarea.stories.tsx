import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UInputTextarea } from "./input-textarea";

const meta: Meta<typeof UInputTextarea> = {
  title: "React/InputTextarea",
  component: UInputTextarea,
};

export default meta;
type Story = StoryObj<typeof UInputTextarea>;

function InputTextareaHarness(props: React.ComponentProps<typeof UInputTextarea>) {
  const [value, setValue] = React.useState(props.value ?? "");
  return <UInputTextarea {...props} value={value} onChange={(e) => setValue(e.target.value)} />;
}

export const Default: Story = {
  args: { value: "" },
  render: (args) => <InputTextareaHarness {...args} />,
};

export const AutoResize: Story = {
  args: { value: "Type to see this textarea grow.", autoResize: true },
  render: (args) => <InputTextareaHarness {...args} />,
};

export const Disabled: Story = {
  args: { value: "Can't edit me", disabled: true },
  render: (args) => <InputTextareaHarness {...args} />,
};

export const Invalid: Story = {
  args: { value: "", invalid: true },
  render: (args) => <InputTextareaHarness {...args} />,
};
