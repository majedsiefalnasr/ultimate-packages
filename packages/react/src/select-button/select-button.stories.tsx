import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { USelectButton } from "./select-button";

/**
 * `USelectButton` is a fully-controlled component — every interactive story
 * below wraps it in a small local-state harness, mirroring
 * `toggle-button.stories.tsx`'s own harness pattern.
 */
const meta: Meta<typeof USelectButton> = {
  title: "React/SelectButton",
  component: USelectButton,
};

export default meta;
type Story = StoryObj<typeof USelectButton>;

function SelectButtonHarness(props: React.ComponentProps<typeof USelectButton>) {
  const [value, setValue] = React.useState(props.value);
  return <USelectButton {...props} value={value} onChange={(event) => setValue(event.value)} />;
}

/** Single-select — default state. */
export const Default: Story = {
  args: {
    value: null,
    options: ["Off", "Medium", "High"],
  },
  render: (args) => <SelectButtonHarness {...args} />,
};

/** Multi-select — more than one option can be active at once. */
export const Multiple: Story = {
  args: {
    value: [],
    options: ["Bold", "Italic", "Underline"],
    multiple: true,
  },
  render: (args) => <SelectButtonHarness {...args} />,
};
