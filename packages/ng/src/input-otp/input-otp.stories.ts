import type { Meta, StoryObj } from "@storybook/angular";
import { UInputOtp } from "./input-otp";

/**
 * State coverage below is sourced from
 * `packages/ng/src/input-otp/input-otp.spec.ts`'s existing test cases
 * (custom length, mask, integerOnly).
 */
const meta: Meta<UInputOtp> = {
  title: "Ng/InputOtp",
  component: UInputOtp,
};

export default meta;
type Story = StoryObj<UInputOtp>;

/** Default state — 4 segments. */
export const Default: Story = {};

/** 6-segment code, per input-otp.spec.ts's custom-length test. */
export const SixDigits: Story = {
  args: {
    length: 6,
  },
};

/** Masked segments (password-style), per input-otp.spec.ts's mask test. */
export const Masked: Story = {
  args: {
    mask: true,
  },
};

/** Digit-only input filtering, per input-otp.spec.ts's integerOnly test. */
export const IntegerOnly: Story = {
  args: {
    integerOnly: true,
  },
};
