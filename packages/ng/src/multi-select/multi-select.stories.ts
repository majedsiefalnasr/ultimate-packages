import type { Meta, StoryObj } from "@storybook/angular";
import { UMultiSelect } from "./multi-select";

/**
 * State coverage below is sourced from
 * `packages/ng/src/multi-select/multi-select.spec.ts`'s existing test cases
 * (overlay open/close, toggling, select-all, filter).
 */
const meta: Meta<UMultiSelect> = {
  title: "Ng/MultiSelect",
  component: UMultiSelect,
};

export default meta;
type Story = StoryObj<UMultiSelect>;

/** Default state — click to open the checkbox-per-option list. */
export const Default: Story = {
  args: {
    options: ["Apple", "Banana", "Cherry"],
    placeholder: "Choose fruits",
  },
};

/** Filterable — types into a search box within the overlay panel. */
export const Filterable: Story = {
  args: {
    options: ["Apple", "Banana", "Cherry", "Date", "Elderberry"],
    placeholder: "Choose fruits",
    filter: true,
  },
};
