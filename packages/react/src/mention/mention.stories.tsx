import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UMention } from "./mention";

/**
 * `UMention` is a fully-controlled component — every interactive story
 * below wraps it in a small local-state harness that also implements
 * `onSearch` to filter a fixed name list, mirroring
 * `autocomplete.stories.tsx`'s own harness pattern.
 *
 * ACCESSIBILITY-INFO FALLBACK NOTICE: `UMention` has no
 * `packages/component-metadata/src/records/` entry — that directory only
 * covers the shared 8 (Button, Checkbox, Dialog, Menu, Paginator, Scroller,
 * Table, Tooltip). Per this task's brief, this story file's own prose (this
 * comment) is the accessibility-info source instead of an invented metadata
 * record.
 *
 * Accessibility notes: the textarea is `role="combobox"` with
 * `aria-expanded`/`aria-autocomplete="list"`/`aria-activedescendant`; the
 * suggestion overlay is a `role="listbox"` of `role="option"` items.
 * Keyboard support: ArrowUp/ArrowDown moves the highlighted suggestion,
 * Enter selects it, Escape closes the overlay.
 */
const meta: Meta<typeof UMention> = {
  title: "React/Mention",
  component: UMention,
};

export default meta;
type Story = StoryObj<typeof UMention>;

const NAMES = ["john", "joanna", "jack", "julia", "jasmine"];

function MentionHarness(props: React.ComponentProps<typeof UMention>) {
  const [value, setValue] = React.useState(props.value ?? "");
  const [suggestions, setSuggestions] = React.useState<string[]>([]);

  return (
    <UMention
      {...props}
      value={value}
      onChange={setValue}
      suggestions={suggestions}
      onSearch={(event) => {
        setSuggestions(NAMES.filter((name) => name.startsWith(event.query.toLowerCase())));
      }}
    />
  );
}

/** Default — type '@' followed by letters to open the suggestion overlay. */
export const Default: Story = {
  args: { value: "", placeholder: "Type @ to mention someone" },
  render: (args) => <MentionHarness {...args} />,
};

/** Pre-populated text containing a mention. */
export const WithInitialText: Story = {
  args: { value: "Hey @john, check this out!" },
  render: (args) => <MentionHarness {...args} />,
};
