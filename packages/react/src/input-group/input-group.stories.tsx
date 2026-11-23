import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UInputGroup, UInputGroupAddon } from "./input-group";

/**
 * ACCESSIBILITY-INFO FALLBACK NOTICE: `UInputGroup`/`UInputGroupAddon` have
 * no `packages/component-metadata/src/records/` entry — that directory only
 * covers the shared 8 (Button, Checkbox, Dialog, Menu, Paginator, Scroller,
 * Table, Tooltip). This story file's own prose is the accessibility-info
 * source instead of an invented metadata record.
 *
 * Accessibility notes: `UInputGroup` renders a `<div>` with no ARIA role of
 * its own — it is a purely visual layout wrapper. When an addon conveys
 * meaning (e.g. a currency symbol), associate it with the adjacent input via
 * `aria-describedby`.
 */
const meta: Meta<typeof UInputGroup> = {
  title: "React/InputGroup",
  component: UInputGroup,
};

export default meta;
type Story = StoryObj<typeof UInputGroup>;

/** Leading text addon. */
export const LeadingAddon: Story = {
  render: () => (
    <UInputGroup>
      <UInputGroupAddon>$</UInputGroupAddon>
      <input type="text" className="u-inputtext" placeholder="Amount" />
    </UInputGroup>
  ),
};

/** Addons on both sides. */
export const BothSides: Story = {
  render: () => (
    <UInputGroup>
      <UInputGroupAddon>$</UInputGroupAddon>
      <input type="text" className="u-inputtext" placeholder="Amount" />
      <UInputGroupAddon>.00</UInputGroupAddon>
    </UInputGroup>
  ),
};
