import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UCheckbox } from "./checkbox";

/**
 * Accessibility info source: `packages/component-metadata/src/records/checkbox.ts`
 * (the `CHECKBOX_METADATA` record — one of the shared 8 `component-metadata`
 * records). State coverage below is sourced from
 * `packages/react/src/checkbox/checkbox.spec.tsx`'s existing test cases
 * (checked/unchecked reflecting the `checked` prop, disabled, aria-invalid).
 *
 * `UCheckbox` is a fully-controlled component (per its own spec's "does not
 * manage its own internal checked state" test) — every interactive story
 * below wraps it in a small local-state harness so the checkbox is actually
 * togglable when rendered in Storybook, mirroring how any real consumer must
 * drive it.
 */
const meta: Meta<typeof UCheckbox> = {
  title: "React/Checkbox",
  component: UCheckbox,
};

export default meta;
type Story = StoryObj<typeof UCheckbox>;

function CheckboxHarness(props: React.ComponentProps<typeof UCheckbox>) {
  const [checked, setChecked] = React.useState(props.checked);
  return (
    <UCheckbox
      {...props}
      checked={checked}
      onChange={(event) => setChecked(event.checked)}
    />
  );
}

/** Default state — unchecked, per checkbox.spec.tsx's base fixture. */
export const Default: Story = {
  args: {
    checked: false,
  },
  render: (args) => <CheckboxHarness {...args} />,
};

/** Checked state, per checkbox.spec.tsx's "renders a native checkbox input reflecting the checked prop" test. */
export const Checked: Story = {
  args: {
    checked: true,
  },
  render: (args) => <CheckboxHarness {...args} />,
};

/** Disabled state, per checkbox.spec.tsx's "applies disabled to the native input and prevents onChange" test. */
export const Disabled: Story = {
  args: {
    checked: false,
    disabled: true,
  },
  render: (args) => <CheckboxHarness {...args} />,
};

/** Invalid state, per checkbox.spec.tsx's "sets aria-invalid from the invalid prop" test. */
export const Invalid: Story = {
  args: {
    checked: false,
    invalid: true,
  },
  render: (args) => <CheckboxHarness {...args} />,
};
