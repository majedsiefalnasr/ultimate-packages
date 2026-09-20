import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UPassword } from "./password";

/**
 * `UPassword` has no `packages/component-metadata/src/records/` entry —
 * that directory only covers the shared 8 (Button, Checkbox, Dialog, Menu,
 * Paginator, Scroller, Table, Tooltip). This story file's own prose is the
 * accessibility-info source instead of an invented metadata record, per the
 * same fallback pattern `packages/ng/src/autofocus/auto-focus.stories.ts`
 * established for Angular.
 *
 * State coverage below is sourced from
 * `packages/react/src/password/password.spec.tsx`'s existing test cases
 * (mask toggle, strength-meter overlay, weak/strong classification,
 * Escape-to-hide).
 */
const meta: Meta<typeof UPassword> = {
  title: "React/Password",
  component: UPassword,
};

export default meta;
type Story = StoryObj<typeof UPassword>;

function PasswordHarness(props: React.ComponentProps<typeof UPassword>) {
  const [value, setValue] = React.useState(props.value ?? "");
  return <UPassword {...props} value={value} onChange={(event) => setValue(event.target.value)} />;
}

/** Default state — strength-meter feedback enabled, no mask toggle. */
export const Default: Story = {
  render: (args) => <PasswordHarness {...args} />,
};

/** Adds a show/hide icon that toggles the input between masked and plain text. */
export const WithToggleMask: Story = {
  render: (args) => <PasswordHarness {...args} />,
  args: {
    toggleMask: true,
  },
};

/** Strength feedback overlay disabled — a plain password input. */
export const NoFeedback: Story = {
  render: (args) => <PasswordHarness {...args} />,
  args: {
    feedback: false,
  },
};
