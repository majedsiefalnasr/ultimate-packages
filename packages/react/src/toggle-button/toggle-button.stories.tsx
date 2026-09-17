import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UToggleButton } from "./toggle-button";

/**
 * `UToggleButton` is a fully-controlled component (per its own spec's "does
 * not manage its own internal checked state" test) — every interactive
 * story below wraps it in a small local-state harness, mirroring
 * `checkbox.stories.tsx`'s own harness pattern.
 */
const meta: Meta<typeof UToggleButton> = {
  title: "React/ToggleButton",
  component: UToggleButton,
};

export default meta;
type Story = StoryObj<typeof UToggleButton>;

function ToggleButtonHarness(props: React.ComponentProps<typeof UToggleButton>) {
  const [checked, setChecked] = React.useState(props.checked);
  return (
    <UToggleButton {...props} checked={checked} onChange={(event) => setChecked(event.value)} />
  );
}

/** Default state — unchecked, "Yes"/"No" default labels. */
export const Default: Story = {
  args: {
    checked: false,
  },
  render: (args) => <ToggleButtonHarness {...args} />,
};

/** Custom on/off labels, per toggle-button.spec.tsx's "renders onLabel/offLabel" test. */
export const CustomLabels: Story = {
  args: {
    checked: false,
    onLabel: "On",
    offLabel: "Off",
  },
  render: (args) => <ToggleButtonHarness {...args} />,
};

/** Disabled state, per toggle-button.spec.tsx's "applies disabled to the native input" test. */
export const Disabled: Story = {
  args: {
    checked: false,
    disabled: true,
  },
  render: (args) => <ToggleButtonHarness {...args} />,
};
