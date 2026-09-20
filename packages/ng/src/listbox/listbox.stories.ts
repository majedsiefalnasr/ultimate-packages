import type { Meta, StoryObj } from "@storybook/angular";
import { UListbox } from "./listbox";

/**
 * State coverage below is sourced from
 * `packages/ng/src/listbox/listbox.spec.ts`'s existing test cases
 * (single-select, multi-select, keyboard navigation, filter).
 */
const meta: Meta<UListbox> = {
  title: "Ng/Listbox",
  component: UListbox,
};

export default meta;
type Story = StoryObj<UListbox>;

/** Default state — always-visible single-select list. */
export const Default: Story = {
  args: {
    options: ["Apple", "Banana", "Cherry"],
  },
};

/** Multi-select — checkbox per option. */
export const Multiple: Story = {
  args: {
    options: ["Apple", "Banana", "Cherry"],
    multiple: true,
  },
};

/** Filterable — types into a search box above the list. */
export const Filterable: Story = {
  args: {
    options: ["Apple", "Banana", "Cherry", "Date", "Elderberry"],
    filter: true,
  },
};
