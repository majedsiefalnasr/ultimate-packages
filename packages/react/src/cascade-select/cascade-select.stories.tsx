import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UCascadeSelect } from "./cascade-select";

/**
 * `UCascadeSelect` is a fully-controlled component — every interactive
 * story below wraps it in a small local-state harness, mirroring
 * `../select/select.stories.tsx`'s own harness pattern.
 */
const meta: Meta<typeof UCascadeSelect> = {
  title: "React/CascadeSelect",
  component: UCascadeSelect,
};

export default meta;
type Story = StoryObj<typeof UCascadeSelect>;

const COUNTRIES = [
  {
    name: "Germany",
    items: [
      { name: "Berlin", items: [{ name: "Mitte" }, { name: "Charlottenburg" }] },
      { name: "Hamburg", items: [{ name: "Altstadt" }] },
    ],
  },
  {
    name: "USA",
    items: [
      { name: "New York", items: [{ name: "Manhattan" }, { name: "Brooklyn" }] },
      { name: "California", items: [{ name: "Los Angeles" }] },
    ],
  },
];

function CascadeSelectHarness(props: React.ComponentProps<typeof UCascadeSelect>) {
  const [value, setValue] = React.useState(props.value);
  return <UCascadeSelect {...props} value={value} onChange={setValue} />;
}

/** Default state — click to drill through Country > City > District. */
export const Default: Story = {
  args: {
    value: null,
    options: COUNTRIES,
    optionLabel: "name",
    placeholder: "Select a district",
  },
  render: (args) => <CascadeSelectHarness {...args} />,
};
