import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { UInputText } from "./input-text";

/**
 * Verification fixture for GAP-064 Tranche 1 screenshot coverage (Spec §13.3).
 * `UInputText` is an attribute directive, so the story applies it to a native
 * input.
 */
const meta: Meta = {
  title: "Ng/InputText",
  decorators: [moduleMetadata({ imports: [UInputText] })],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => ({
    template: `<input uInputText placeholder="Text" aria-label="Text" />`,
  }),
};
