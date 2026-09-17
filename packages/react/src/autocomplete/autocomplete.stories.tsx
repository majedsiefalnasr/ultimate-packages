import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UAutoComplete } from "./autocomplete";

/**
 * `UAutoComplete` has no `packages/component-metadata/src/records/` entry
 * — same fallback pattern `password.stories.tsx` documents. State coverage
 * below is sourced from
 * `packages/react/src/autocomplete/autocomplete.spec.tsx`'s existing test
 * cases (debounced completeMethod, suggestion overlay, keyboard navigation,
 * Escape-to-close).
 */
const meta: Meta<typeof UAutoComplete> = {
  title: "React/AutoComplete",
  component: UAutoComplete,
};

export default meta;
type Story = StoryObj<typeof UAutoComplete>;

const FRUITS = ["Apple", "Banana", "Cherry", "Date", "Elderberry"];

function AutoCompleteHarness(props: Partial<React.ComponentProps<typeof UAutoComplete>>) {
  const [value, setValue] = React.useState<string | null>(null);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  return (
    <UAutoComplete
      {...props}
      value={value}
      onChange={setValue}
      suggestions={suggestions}
      completeMethod={(event) =>
        setSuggestions(FRUITS.filter((f) => f.toLowerCase().includes(event.query.toLowerCase())))
      }
    />
  );
}

/** Default state — type at least one character to trigger `completeMethod`. */
export const Default: Story = {
  render: () => <AutoCompleteHarness placeholder="Search a fruit" />,
};

/** Loading state — shows a loader indicator while a search is in flight. */
export const Loading: Story = {
  render: () => <AutoCompleteHarness placeholder="Search a fruit" loading />,
};
