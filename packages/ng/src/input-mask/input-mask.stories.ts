import type { Meta, StoryObj } from "@storybook/angular";
import { UInputMask } from "./input-mask";

/**
 * State coverage below is sourced from
 * `packages/ng/src/input-mask/input-mask.spec.ts`'s existing test cases
 * (phone-number-shaped mask, custom slotChar, invalid).
 */
const meta: Meta<UInputMask> = {
  title: "Ng/InputMask",
  component: UInputMask,
};

export default meta;
type Story = StoryObj<UInputMask>;

/** Default state — a phone-number-shaped mask. */
export const Default: Story = {
  args: {
    mask: "(999) 999-9999",
  },
};

/** Custom placeholder character in place of the default underscore. */
export const CustomSlotChar: Story = {
  args: {
    mask: "9999",
    slotChar: "*",
  },
};

/** Invalid state, per input-mask.spec.ts's "reflects the invalid input" test. */
export const Invalid: Story = {
  args: {
    mask: "9999",
    invalid: true,
  },
};
