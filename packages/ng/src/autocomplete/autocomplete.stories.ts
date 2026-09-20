import type { Meta, StoryObj } from "@storybook/angular";
import { UAutoComplete } from "./autocomplete";

/**
 * State coverage below is sourced from
 * `packages/ng/src/autocomplete/autocomplete.spec.ts`'s existing test cases
 * (debounced completeMethod, suggestion overlay, keyboard navigation,
 * Escape-to-close).
 */
const meta: Meta<UAutoComplete> = {
  title: "Ng/AutoComplete",
  component: UAutoComplete,
};

export default meta;
type Story = StoryObj<UAutoComplete>;

/** Default state — type at least one character to trigger `completeMethod`. */
export const Default: Story = {
  args: {
    placeholder: "Search a fruit",
  },
};

/** Pre-populated suggestions, simulating a resolved async search. */
export const WithSuggestions: Story = {
  args: {
    placeholder: "Search a fruit",
    suggestions: ["Apple", "Banana", "Cherry"],
  },
};

/** Loading state — shows a loader indicator while a search is in flight. */
export const Loading: Story = {
  args: {
    placeholder: "Search a fruit",
    loading: true,
  },
};
