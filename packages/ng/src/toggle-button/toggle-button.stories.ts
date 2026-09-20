import type { Meta, StoryObj } from "@storybook/angular";
import { UToggleButton } from "./toggle-button";

/**
 * State coverage below is sourced from
 * `packages/ng/src/toggle-button/toggle-button.spec.ts`'s existing test
 * cases (checked/unchecked reflecting onLabel/offLabel, disabled).
 */
const meta: Meta<UToggleButton> = {
  title: "Ng/ToggleButton",
  component: UToggleButton,
};

export default meta;
type Story = StoryObj<UToggleButton>;

/** Default state — unchecked, "Yes"/"No" default labels. */
export const Default: Story = {};

/** Custom on/off labels, per toggle-button.spec.ts's "renders onLabel/offLabel" test. */
export const CustomLabels: Story = {
  args: {
    onLabel: "On",
    offLabel: "Off",
  },
};

/** Disabled state, per toggle-button.spec.ts's "respects the disabled input" test. */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
