import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UInputChips } from "./input-chips";

/**
 * `UInputChips` is a fully-controlled component — every interactive story
 * below wraps it in a small local-state harness, mirroring
 * `date-picker.stories.tsx`'s own harness pattern.
 *
 * ACCESSIBILITY-INFO FALLBACK NOTICE: `UInputChips` has no
 * `packages/component-metadata/src/records/` entry — that directory only
 * covers the shared 8 (Button, Checkbox, Dialog, Menu, Paginator, Scroller,
 * Table, Tooltip). Per this task's brief, this story file's own prose (this
 * comment) is the accessibility-info source instead of an invented metadata
 * record.
 *
 * Accessibility notes: the tag list is a `role="listbox"` with each tag as
 * `role="option"`; the freeform text input is a plain native `<input>`.
 * Keyboard support: Enter commits the current text as a new tag; Backspace
 * on an empty input removes the last tag; ArrowLeft/ArrowRight move focus
 * between tag tokens and the input.
 */
const meta: Meta<typeof UInputChips> = {
  title: "React/InputChips",
  component: UInputChips,
};

export default meta;
type Story = StoryObj<typeof UInputChips>;

function InputChipsHarness(props: React.ComponentProps<typeof UInputChips>) {
  const [value, setValue] = React.useState(props.value);
  return <UInputChips {...props} value={value} onChange={setValue} />;
}

/** Default — type a value and press Enter to add a tag. */
export const Default: Story = {
  args: { value: [], placeholder: "Add a tag" },
  render: (args) => <InputChipsHarness {...args} />,
};

/** Pre-populated with existing tags. */
export const WithInitialTags: Story = {
  args: { value: ["design", "frontend"], placeholder: "Add a tag" },
  render: (args) => <InputChipsHarness {...args} />,
};

/** Limits the number of tags via `max`. */
export const MaxTags: Story = {
  args: { value: ["one", "two"], max: 2, placeholder: "Max reached" },
  render: (args) => <InputChipsHarness {...args} />,
};

/** Disabled state. */
export const Disabled: Story = {
  args: { value: ["locked"], disabled: true },
  render: (args) => <InputChipsHarness {...args} />,
};
