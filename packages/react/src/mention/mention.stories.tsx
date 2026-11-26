import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UMention, type UMentionProps } from "./mention";

/**
 * Every interactive story wraps `UMention` in a small harness that implements
 * `onSearch` by filtering fixed lists, mirroring `autocomplete.stories.tsx`.
 *
 * ACCESSIBILITY-INFO FALLBACK NOTICE: `UMention` has no
 * `packages/component-metadata/src/records/` entry, so this comment is the
 * accessibility-info source instead of an invented metadata record.
 *
 * Accessibility notes: the textarea is `role="combobox"` with
 * `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`,
 * `aria-autocomplete="list"` and `aria-activedescendant`; the panel holds a
 * `role="listbox"` of `role="option"` items. Keyboard support: ArrowUp and
 * ArrowDown move the highlight (no wrap), Enter picks it, Escape closes the
 * panel, ArrowLeft and ArrowRight search again at the new caret.
 */
const meta: Meta<typeof UMention> = {
  title: "React/Mention",
  component: UMention,
};

export default meta;
type Story = StoryObj<typeof UMention>;

interface Person {
  name: string;
  nickname: string;
}

const PEOPLE: Person[] = [
  { name: "John Smith", nickname: "john" },
  { name: "Joanna Lee", nickname: "joanna" },
  { name: "Jack Brown", nickname: "jack" },
  { name: "Julia Stone", nickname: "julia" },
  { name: "Jasmine Ali", nickname: "jasmine" },
];
const TAGS = ["primereact", "primevue", "primeng", "ultimate", "aura"];

function MentionHarness(props: UMentionProps<Person | string>) {
  const [value, setValue] = React.useState(props.value ?? "");
  const [suggestions, setSuggestions] = React.useState<(Person | string)[]>([]);

  return (
    <UMention<Person | string>
      field="nickname"
      {...props}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      suggestions={suggestions}
      onSearch={(event) => {
        const query = event.query.toLowerCase();
        setSuggestions(
          event.trigger === "#"
            ? TAGS.filter((tag) => tag.startsWith(query))
            : PEOPLE.filter((person) => person.nickname.startsWith(query))
        );
      }}
    />
  );
}

/** Default — type '@' followed by letters to open the suggestion panel at the caret. */
export const Default: Story = {
  args: { placeholder: "Type @ to mention someone", rows: 5, cols: 40 },
  render: (args) => <MentionHarness {...(args as UMentionProps<Person | string>)} />,
};

/** Pre-populated text containing a mention. */
export const WithInitialText: Story = {
  args: { value: "Hey @john, check this out!", rows: 5, cols: 40 },
  render: (args) => <MentionHarness {...(args as UMentionProps<Person | string>)} />,
};

/** Two triggers: '@' searches people by nickname and '#' searches tags. */
export const MultipleTriggers: Story = {
  args: {
    trigger: ["@", "#"],
    field: ["nickname"],
    placeholder: "Type @ or #",
    rows: 5,
    cols: 40,
  },
  render: (args) => <MentionHarness {...(args as UMentionProps<Person | string>)} />,
};

/** A custom item template showing the full name next to the nickname. */
export const ItemTemplate: Story = {
  args: {
    placeholder: "Type @ to mention someone",
    rows: 5,
    cols: 40,
    itemTemplate: (suggestion: unknown) => {
      const person = suggestion as Person;
      return (
        <span>
          <strong>{person.nickname}</strong> {person.name}
        </span>
      );
    },
  },
  render: (args) => <MentionHarness {...(args as UMentionProps<Person | string>)} />,
};

/** The filled variant with auto-resize. */
export const FilledAutoResize: Story = {
  args: { variant: "filled", autoResize: true, rows: 3, cols: 40 },
  render: (args) => <MentionHarness {...(args as UMentionProps<Person | string>)} />,
};
