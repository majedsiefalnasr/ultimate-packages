import type { Meta, StoryObj } from "@storybook/angular";
import { UInputNumber } from "./input-number";

/**
 * Verification fixture for GAP-064 Tranche 1 screenshot coverage (Spec §13.3).
 */
const meta: Meta<UInputNumber> = {
  title: "Ng/InputNumber",
  component: UInputNumber,
};

export default meta;
type Story = StoryObj<UInputNumber>;

export const Default: Story = {};
