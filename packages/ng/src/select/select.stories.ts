import type { Meta, StoryObj } from "@storybook/angular";
import { USelect } from "./select";

/**
 * State coverage below is sourced from
 * `packages/ng/src/select/select.spec.ts`'s existing test cases (overlay
 * open/close, option selection, keyboard navigation, filter).
 */
const meta: Meta<USelect> = {
  title: "Ng/Select",
  component: USelect,
};

export default meta;
type Story = StoryObj<USelect>;

/** Default state — click to open the option list. */
export const Default: Story = {
  args: {
    options: ["Apple", "Banana", "Cherry"],
    placeholder: "Choose a fruit",
  },
};

/** Filterable — types into a search box within the overlay panel. */
export const Filterable: Story = {
  args: {
    options: ["Apple", "Banana", "Cherry", "Date", "Elderberry"],
    placeholder: "Choose a fruit",
    filter: true,
  },
};

/** Shows a clear icon once a value is selected. */
export const Clearable: Story = {
  args: {
    options: ["Apple", "Banana", "Cherry"],
    placeholder: "Choose a fruit",
    showClear: true,
  },
};
