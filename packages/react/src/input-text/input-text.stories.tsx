import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UInputText } from "./input-text";

/**
 * `UInputText` is fully-controlled (`value`/`onChange`), per
 * `input-text.spec.tsx`'s own "is fully controlled" test — every
 * interactive story below wraps it in a small local-state harness so it is
 * actually typable when rendered in Storybook.
 */
const meta: Meta<typeof UInputText> = {
  title: "React/InputText",
  component: UInputText,
};

export default meta;
type Story = StoryObj<typeof UInputText>;

function InputTextHarness(props: React.ComponentProps<typeof UInputText>) {
  const [value, setValue] = React.useState(props.value ?? "");
  return <UInputText {...props} value={value} onChange={(e) => setValue(e.target.value)} />;
}

export const Default: Story = {
  args: { value: "" },
  render: (args) => <InputTextHarness {...args} />,
};

export const WithValue: Story = {
  args: { value: "Hello world" },
  render: (args) => <InputTextHarness {...args} />,
};

export const Disabled: Story = {
  args: { value: "Can't edit me", disabled: true },
  render: (args) => <InputTextHarness {...args} />,
};

export const Invalid: Story = {
  args: { value: "", invalid: true },
  render: (args) => <InputTextHarness {...args} />,
};
