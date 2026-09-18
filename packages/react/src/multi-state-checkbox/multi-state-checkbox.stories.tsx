import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UMultiStateCheckbox } from "./multi-state-checkbox";

/**
 * `UMultiStateCheckbox` is a fully-controlled component — every interactive
 * story below wraps it in a small local-state harness, mirroring
 * `date-picker.stories.tsx`'s own harness pattern.
 *
 * ACCESSIBILITY-INFO FALLBACK NOTICE: `UMultiStateCheckbox` has no
 * `packages/component-metadata/src/records/` entry — that directory only
 * covers the shared 8 (Button, Checkbox, Dialog, Menu, Paginator, Scroller,
 * Table, Tooltip). Per this task's brief, this story file's own prose (this
 * comment) is the accessibility-info source instead of an invented metadata
 * record.
 *
 * Accessibility notes: renders `role="button"` with an `aria-label`
 * reflecting the currently-selected option's label (or "none" when empty).
 * Keyboard support: Space cycles to the next state.
 */
const meta: Meta<typeof UMultiStateCheckbox> = {
  title: "React/MultiStateCheckbox",
  component: UMultiStateCheckbox,
};

export default meta;
type Story = StoryObj<typeof UMultiStateCheckbox>;

const STATES = ["todo", "in-progress", "done"];

function MultiStateCheckboxHarness(props: React.ComponentProps<typeof UMultiStateCheckbox>) {
  const [value, setValue] = React.useState(props.value);
  return (
    <UMultiStateCheckbox {...props} value={value} onChange={(event) => setValue(event.value)} />
  );
}

/** Default — click to cycle through todo -> in-progress -> done -> (empty). */
export const Default: Story = {
  args: { value: null, options: STATES },
  render: (args) => <MultiStateCheckboxHarness {...args} />,
};

/** empty=false — cycles back to the first option instead of an empty state. */
export const NoEmptyState: Story = {
  args: { value: "todo", options: STATES, empty: false },
  render: (args) => <MultiStateCheckboxHarness {...args} />,
};

/** Disabled state. */
export const Disabled: Story = {
  args: { value: "done", options: STATES, disabled: true },
  render: (args) => <MultiStateCheckboxHarness {...args} />,
};
