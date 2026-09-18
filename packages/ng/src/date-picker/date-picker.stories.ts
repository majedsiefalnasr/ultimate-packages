import type { Meta, StoryObj } from "@storybook/angular";
import { UDatePicker } from "./date-picker";

/**
 * State coverage below is sourced from
 * `packages/ng/src/date-picker/date-picker.spec.ts`'s existing test cases
 * (overlay open/close, date selection, month navigation, keyboard grid
 * navigation, min/max constraints).
 */
const meta: Meta<UDatePicker> = {
  title: "Ng/DatePicker",
  component: UDatePicker,
};

export default meta;
type Story = StoryObj<UDatePicker>;

/** Default state — click the input to open the calendar overlay. */
export const Default: Story = {
  args: {
    placeholder: "Select a date",
  },
};

/** Shows a calendar trigger icon alongside the text input. */
export const WithIcon: Story = {
  args: {
    placeholder: "Select a date",
    showIcon: true,
  },
};

/** Shows a clear icon once a date is selected. */
export const Clearable: Story = {
  args: {
    placeholder: "Select a date",
    showClear: true,
  },
};

/** Constrains selectable dates to a min/max range. */
export const MinMaxDate: Story = {
  args: {
    placeholder: "Select a date",
    minDate: new Date(new Date().getFullYear(), new Date().getMonth(), 5),
    maxDate: new Date(new Date().getFullYear(), new Date().getMonth(), 25),
  },
};
