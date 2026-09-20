import type { Meta, StoryObj } from "@storybook/angular";
import { UPassword } from "./password";

/**
 * State coverage below is sourced from
 * `packages/ng/src/password/password.spec.ts`'s existing test cases (mask
 * toggle, strength-meter overlay, weak/strong classification, Escape-to-hide).
 */
const meta: Meta<UPassword> = {
  title: "Ng/Password",
  component: UPassword,
};

export default meta;
type Story = StoryObj<UPassword>;

/** Default state — strength-meter feedback enabled, no mask toggle. */
export const Default: Story = {};

/** Adds a show/hide icon that toggles the input between masked and plain text. */
export const WithToggleMask: Story = {
  args: {
    toggleMask: true,
  },
};

/** Strength feedback overlay disabled — a plain password input. */
export const NoFeedback: Story = {
  args: {
    feedback: false,
  },
};

/** Custom prompt/strength labels. */
export const CustomLabels: Story = {
  args: {
    promptLabel: "Choose a password",
    weakLabel: "Too weak",
    mediumLabel: "Okay",
    strongLabel: "Great",
  },
};
