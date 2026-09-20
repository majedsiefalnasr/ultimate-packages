import type { Meta, StoryObj } from "@storybook/angular";
import { UTextarea } from "./textarea";

/**
 * State coverage below is sourced from
 * `packages/ng/src/textarea/textarea.spec.ts`'s existing test cases
 * (fluid, invalid, autoResize).
 */
const meta: Meta<UTextarea> = {
  title: "Ng/Textarea",
  component: UTextarea,
};

export default meta;
type Story = StoryObj<UTextarea>;

/** Default state. */
export const Default: Story = {};

/** Invalid state, per textarea.spec.ts's "reflects the invalid input" test. */
export const Invalid: Story = {
  args: {
    invalid: true,
  },
};

/** Fluid (100% width), per textarea.spec.ts's "reflects the fluid input" test. */
export const Fluid: Story = {
  args: {
    fluid: true,
  },
};

/** Auto-resizing height as content grows, per textarea.spec.ts's autoResize test. */
export const AutoResize: Story = {
  args: {
    autoResize: true,
  },
};
