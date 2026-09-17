import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UListbox } from "./listbox";

/**
 * `UListbox` is a fully-controlled component — every interactive story
 * below wraps it in a small local-state harness, mirroring
 * `../select/select.stories.tsx`'s own harness pattern.
 */
const meta: Meta<typeof UListbox> = {
  title: "React/Listbox",
  component: UListbox,
};

export default meta;
type Story = StoryObj<typeof UListbox>;

function ListboxHarness(props: React.ComponentProps<typeof UListbox>) {
  const [value, setValue] = React.useState(props.value);
  return <UListbox {...props} value={value} onChange={setValue} />;
}

/** Default state — always-visible single-select list. */
export const Default: Story = {
  args: {
    value: null,
    options: ["Apple", "Banana", "Cherry"],
  },
  render: (args) => <ListboxHarness {...args} />,
};

/** Multi-select — checkbox per option. */
export const Multiple: Story = {
  args: {
    value: [],
    options: ["Apple", "Banana", "Cherry"],
    multiple: true,
  },
  render: (args) => <ListboxHarness {...args} />,
};

/** Filterable — types into a search box above the list. */
export const Filterable: Story = {
  args: {
    value: null,
    options: ["Apple", "Banana", "Cherry", "Date", "Elderberry"],
    filter: true,
  },
  render: (args) => <ListboxHarness {...args} />,
};
