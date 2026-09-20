import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { USelect } from "./select";

/**
 * `USelect` is a fully-controlled component — every interactive story below
 * wraps it in a small local-state harness, mirroring
 * `autocomplete.stories.tsx`'s own harness pattern.
 */
const meta: Meta<typeof USelect> = {
  title: "React/Select",
  component: USelect,
};

export default meta;
type Story = StoryObj<typeof USelect>;

function SelectHarness(props: React.ComponentProps<typeof USelect>) {
  const [value, setValue] = React.useState(props.value);
  return <USelect {...props} value={value} onChange={setValue} />;
}

/** Default state — click to open the option list. */
export const Default: Story = {
  args: {
    value: null,
    options: ["Apple", "Banana", "Cherry"],
    placeholder: "Choose a fruit",
  },
  render: (args) => <SelectHarness {...args} />,
};

/** Filterable — types into a search box within the overlay panel. */
export const Filterable: Story = {
  args: {
    value: null,
    options: ["Apple", "Banana", "Cherry", "Date", "Elderberry"],
    placeholder: "Choose a fruit",
    filter: true,
  },
  render: (args) => <SelectHarness {...args} />,
};

/** Shows a clear icon once a value is selected. */
export const Clearable: Story = {
  args: {
    value: "Apple",
    options: ["Apple", "Banana", "Cherry"],
    placeholder: "Choose a fruit",
    showClear: true,
  },
  render: (args) => <SelectHarness {...args} />,
};
