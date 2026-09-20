import type { Meta, StoryObj } from "@storybook/angular";
import { UToggleSwitch } from "./toggle-switch";

/**
 * State coverage below is sourced from
 * `packages/ng/src/toggle-switch/toggle-switch.spec.ts`'s existing test
 * cases (checked/unchecked reflecting modelValue === trueValue, disabled).
 */
const meta: Meta<UToggleSwitch> = {
  title: "Ng/ToggleSwitch",
  component: UToggleSwitch,
};

export default meta;
type Story = StoryObj<UToggleSwitch>;

/** Default state — unchecked. */
export const Default: Story = {};

/** Disabled state, per toggle-switch.spec.ts's "respects the disabled input" test. */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
