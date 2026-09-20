import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UIconField, UInputIcon } from "./icon-field";

/**
 * ACCESSIBILITY-INFO FALLBACK NOTICE: `UIconField`/`UInputIcon` have no
 * `packages/component-metadata/src/records/` entry — that directory only
 * covers the shared 8 (Button, Checkbox, Dialog, Menu, Paginator, Scroller,
 * Table, Tooltip). Per this task's brief, this story file's own prose (this
 * comment) is the accessibility-info source instead of an invented metadata
 * record.
 *
 * Accessibility notes: `UIconField` renders a `<div>` with no ARIA role of
 * its own. `UInputIcon` renders `aria-hidden="true"` by default, matching
 * its purely decorative real-source usage pattern.
 */
const meta: Meta<typeof UIconField> = {
  title: "React/IconField",
  component: UIconField,
};

export default meta;
type Story = StoryObj<typeof UIconField>;

/** Leading icon (default 'left' position). */
export const LeadingIcon: Story = {
  args: { iconPosition: "left" },
  render: (args) => (
    <UIconField {...args}>
      <UInputIcon>search</UInputIcon>
      <input type="text" className="u-input-text" placeholder="Search" />
    </UIconField>
  ),
};

/** Trailing icon ('right' position). */
export const TrailingIcon: Story = {
  args: { iconPosition: "right" },
  render: (args) => (
    <UIconField {...args}>
      <input type="text" className="u-input-text" placeholder="Search" />
      <UInputIcon>search</UInputIcon>
    </UIconField>
  ),
};
