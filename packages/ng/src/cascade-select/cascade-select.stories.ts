import type { Meta, StoryObj } from "@storybook/angular";
import { UCascadeSelect } from "./cascade-select";

/**
 * State coverage below is sourced from
 * `packages/ng/src/cascade-select/cascade-select.spec.ts`'s existing test
 * cases (overlay open/close, drill-down through nested groups, leaf
 * selection).
 */
const meta: Meta<UCascadeSelect> = {
  title: "Ng/CascadeSelect",
  component: UCascadeSelect,
};

export default meta;
type Story = StoryObj<UCascadeSelect>;

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

/** Default state — click to drill through Country > City > District. */
export const Default: Story = {
  args: {
    options: COUNTRIES,
    optionLabel: "name",
    placeholder: "Select a district",
  },
};
