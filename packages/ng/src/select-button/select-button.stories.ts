import type { Meta, StoryObj } from "@storybook/angular";
import { USelectButton } from "./select-button";

/**
 * State coverage below is sourced from
 * `packages/ng/src/select-button/select-button.spec.ts`'s existing test
 * cases (single-select, allowEmpty, multi-select, per-option disabled).
 */
const meta: Meta<USelectButton> = {
  title: "Ng/SelectButton",
  component: USelectButton,
};

export default meta;
type Story = StoryObj<USelectButton>;

/** Single-select — default state. */
export const Default: Story = {
  args: {
    options: ["Off", "Medium", "High"],
  },
};

/** Multi-select — more than one option can be active at once. */
export const Multiple: Story = {
  args: {
    options: ["Bold", "Italic", "Underline"],
    multiple: true,
  },
};
