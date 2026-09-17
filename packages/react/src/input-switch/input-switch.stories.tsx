import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UInputSwitch } from "./input-switch";

/**
 * `UInputSwitch` is a fully-controlled component (per its own spec's "does
 * not manage its own internal checked state" test) — every interactive
 * story below wraps it in a small local-state harness, mirroring
 * `checkbox.stories.tsx`'s own harness pattern.
 */
const meta: Meta<typeof UInputSwitch> = {
  title: "React/InputSwitch",
  component: UInputSwitch,
};

export default meta;
type Story = StoryObj<typeof UInputSwitch>;

function InputSwitchHarness(props: React.ComponentProps<typeof UInputSwitch>) {
  const [checked, setChecked] = React.useState(props.checked);
  return (
    <UInputSwitch {...props} checked={checked} onChange={(event) => setChecked(event.value)} />
  );
}

/** Default state — unchecked, per input-switch.spec.tsx's base fixture. */
export const Default: Story = {
  args: {
    checked: false,
  },
  render: (args) => <InputSwitchHarness {...args} />,
};

/** Checked state, per input-switch.spec.tsx's "renders a native switch input reflecting the checked prop" test. */
export const Checked: Story = {
  args: {
    checked: true,
  },
  render: (args) => <InputSwitchHarness {...args} />,
};

/** Disabled state, per input-switch.spec.tsx's "applies disabled to the native input" test. */
export const Disabled: Story = {
  args: {
    checked: false,
    disabled: true,
  },
  render: (args) => <InputSwitchHarness {...args} />,
};

/** Invalid state, per input-switch.spec.tsx's "sets aria-invalid" test. */
export const Invalid: Story = {
  args: {
    checked: false,
    invalid: true,
  },
  render: (args) => <InputSwitchHarness {...args} />,
};
