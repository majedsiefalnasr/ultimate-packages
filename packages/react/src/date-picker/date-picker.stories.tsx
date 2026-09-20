import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UDatePicker } from "./date-picker";

/**
 * `UDatePicker` is a fully-controlled component — every interactive story
 * below wraps it in a small local-state harness, mirroring `select.stories.tsx`'s
 * own harness pattern.
 */
const meta: Meta<typeof UDatePicker> = {
  title: "React/DatePicker",
  component: UDatePicker,
};

export default meta;
type Story = StoryObj<typeof UDatePicker>;

function DatePickerHarness(props: React.ComponentProps<typeof UDatePicker>) {
  const [value, setValue] = React.useState(props.value);
  return <UDatePicker {...props} value={value} onChange={setValue} />;
}

/** Default state — click the input to open the calendar overlay. */
export const Default: Story = {
  args: {
    value: null,
    placeholder: "Select a date",
  },
  render: (args) => <DatePickerHarness {...args} />,
};

/** Shows a calendar trigger icon alongside the text input. */
export const WithIcon: Story = {
  args: {
    value: null,
    placeholder: "Select a date",
    showIcon: true,
  },
  render: (args) => <DatePickerHarness {...args} />,
};

/** Shows a clear icon once a date is selected. */
export const Clearable: Story = {
  args: {
    value: new Date(),
    showClear: true,
  },
  render: (args) => <DatePickerHarness {...args} />,
};

/** Constrains selectable dates to a min/max range. */
export const MinMaxDate: Story = {
  args: {
    value: null,
    placeholder: "Select a date",
    minDate: new Date(new Date().getFullYear(), new Date().getMonth(), 5),
    maxDate: new Date(new Date().getFullYear(), new Date().getMonth(), 25),
  },
  render: (args) => <DatePickerHarness {...args} />,
};
