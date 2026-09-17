import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { URadioButton } from "./radio-button";

/**
 * `URadioButton` is a fully-controlled component (per its own spec's "does
 * not manage its own internal checked state" test) — every interactive
 * story below wraps it in a small local-state harness, mirroring
 * `checkbox.stories.tsx`'s own harness pattern.
 */
const meta: Meta<typeof URadioButton> = {
  title: "React/RadioButton",
  component: URadioButton,
};

export default meta;
type Story = StoryObj<typeof URadioButton>;

function RadioButtonHarness(props: React.ComponentProps<typeof URadioButton>) {
  const [checked, setChecked] = React.useState(props.checked);
  return (
    <URadioButton {...props} checked={checked} onChange={(event) => setChecked(event.checked)} />
  );
}

/** Default state — unchecked, per radio-button.spec.tsx's base fixture. */
export const Default: Story = {
  args: {
    checked: false,
  },
  render: (args) => <RadioButtonHarness {...args} />,
};

/** Checked state, per radio-button.spec.tsx's "renders a native radio input reflecting the checked prop" test. */
export const Checked: Story = {
  args: {
    checked: true,
  },
  render: (args) => <RadioButtonHarness {...args} />,
};

/** Disabled state, per radio-button.spec.tsx's "applies disabled to the native input" test. */
export const Disabled: Story = {
  args: {
    checked: false,
    disabled: true,
  },
  render: (args) => <RadioButtonHarness {...args} />,
};

/** Invalid state, per radio-button.spec.tsx's "sets aria-invalid" test. */
export const Invalid: Story = {
  args: {
    checked: false,
    invalid: true,
  },
  render: (args) => <RadioButtonHarness {...args} />,
};
