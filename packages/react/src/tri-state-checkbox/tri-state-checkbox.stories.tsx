import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UTriStateCheckbox } from "./tri-state-checkbox";

/**
 * `UTriStateCheckbox` is a fully-controlled component — every interactive
 * story below wraps it in a small local-state harness, mirroring
 * `date-picker.stories.tsx`'s own harness pattern.
 *
 * ACCESSIBILITY-INFO FALLBACK NOTICE: `UTriStateCheckbox` has no
 * `packages/component-metadata/src/records/` entry — that directory only
 * covers the shared 8 (Button, Checkbox, Dialog, Menu, Paginator, Scroller,
 * Table, Tooltip). Per this task's brief, this story file's own prose (this
 * comment) is the accessibility-info source instead of an invented metadata
 * record.
 *
 * Accessibility notes: renders `role="checkbox"` with
 * `aria-checked="true"`/`"false"`/`"mixed"` for true/false/null. Keyboard
 * support: Space or Enter cycles to the next state. `aria-*` props go on the
 * focusable box. A `<label htmlFor={inputId}>` also cycles the value.
 */
const meta: Meta<typeof UTriStateCheckbox> = {
  title: "React/TriStateCheckbox",
  component: UTriStateCheckbox,
};

export default meta;
type Story = StoryObj<typeof UTriStateCheckbox>;

function TriStateCheckboxHarness(props: React.ComponentProps<typeof UTriStateCheckbox>) {
  const [value, setValue] = React.useState(props.value);
  return <UTriStateCheckbox {...props} value={value} onChange={(event) => setValue(event.value)} />;
}

/** Default — click to cycle null -> true -> false -> null. */
export const Default: Story = {
  args: { value: null },
  render: (args) => <TriStateCheckboxHarness {...args} />,
};

/** Invalid state. */
export const Invalid: Story = {
  args: { value: null, invalid: true },
  render: (args) => <TriStateCheckboxHarness {...args} />,
};

/** Disabled state. */
export const Disabled: Story = {
  args: { value: true, disabled: true },
  render: (args) => <TriStateCheckboxHarness {...args} />,
};

/** Filled variant. */
export const Filled: Story = {
  args: { value: null, variant: "filled" },
  render: (args) => <TriStateCheckboxHarness {...args} />,
};

/** Clicking the label cycles the value through the hidden input. */
export const WithLabel: Story = {
  args: { value: null, inputId: "tri-state-story" },
  render: (args) => (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <TriStateCheckboxHarness {...args} />
      <label htmlFor={args.inputId}>Accept the terms</label>
    </div>
  ),
};

/** Localized live-region labels. */
export const LocalizedLabels: Story = {
  args: { value: null, trueLabel: "Oui", falseLabel: "Non", nullLabel: "Aucun choix" },
  render: (args) => <TriStateCheckboxHarness {...args} />,
};
