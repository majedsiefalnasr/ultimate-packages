import type { Meta, StoryObj } from "@storybook/angular";
import { URadioButton } from "./radio-button";

/**
 * State coverage below is sourced from
 * `packages/ng/src/radio-button/radio-button.spec.ts`'s existing test cases
 * (value-matching checked state, disabled).
 */
const meta: Meta<URadioButton> = {
  title: "Ng/RadioButton",
  component: URadioButton,
};

export default meta;
type Story = StoryObj<URadioButton>;

/** Default state — unchecked. */
export const Default: Story = {
  args: {
    name: "option",
    value: "option1",
  },
};

/** Disabled state, per radio-button.spec.ts's "respects the disabled input" test. */
export const Disabled: Story = {
  args: {
    name: "option",
    value: "option1",
    disabled: true,
  },
};
