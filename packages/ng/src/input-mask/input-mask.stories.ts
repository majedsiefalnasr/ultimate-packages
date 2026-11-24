import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { UInputMask, UInputMaskDirective } from "./input-mask";

/**
 * State coverage below is sourced from
 * `packages/ng/src/input-mask/input-mask.spec.ts`'s existing test cases
 * (phone-number-shaped mask, custom slotChar, invalid).
 */
const meta: Meta<UInputMask> = {
  title: "Ng/InputMask",
  component: UInputMask,
  decorators: [moduleMetadata({ imports: [UInputMaskDirective] })],
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

/** A clear icon that resets the field. */
export const ShowClear: Story = {
  args: {
    mask: "(999) 999-9999",
    showClear: true,
  },
};

/** The partially typed buffer stays visible after blur instead of being cleared. */
export const KeepBuffer: Story = {
  args: {
    mask: "(999) 999-9999",
    keepBuffer: true,
  },
};

/** The `[uInputMask]` directive masks a native input without the component wrapper. */
export const Directive: Story = {
  render: () => ({
    template: `<input uInputMask mask="(999) 999-9999" placeholder="(___) ___-____" />`,
  }),
};
