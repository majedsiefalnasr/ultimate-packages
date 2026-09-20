import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UMultiSelect } from "./multi-select";

/**
 * `UMultiSelect` is a fully-controlled component — every interactive story
 * below wraps it in a small local-state harness, mirroring
 * `../select/select.stories.tsx`'s own harness pattern.
 */
const meta: Meta<typeof UMultiSelect> = {
  title: "React/MultiSelect",
  component: UMultiSelect,
};

export default meta;
type Story = StoryObj<typeof UMultiSelect>;

function MultiSelectHarness(props: React.ComponentProps<typeof UMultiSelect>) {
  const [value, setValue] = React.useState(props.value);
  return <UMultiSelect {...props} value={value} onChange={setValue} />;
}

/** Default state — click to open the checkbox-per-option list. */
export const Default: Story = {
  args: {
    value: [],
    options: ["Apple", "Banana", "Cherry"],
    placeholder: "Choose fruits",
  },
  render: (args) => <MultiSelectHarness {...args} />,
};

/** Filterable — types into a search box within the overlay panel. */
export const Filterable: Story = {
  args: {
    value: [],
    options: ["Apple", "Banana", "Cherry", "Date", "Elderberry"],
    placeholder: "Choose fruits",
    filter: true,
  },
  render: (args) => <MultiSelectHarness {...args} />,
};
