import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UInputGroup, UInputGroupAddon } from "./index";

/**
 * ACCESSIBILITY-INFO FALLBACK NOTICE: `UInputGroup`/`UInputGroupAddon` have
 * no `packages/component-metadata/src/records/` entry — that directory only
 * covers the shared 8 (Button, Checkbox, Dialog, Menu, Paginator, Scroller,
 * Table, Tooltip). Per this task's brief, this story file's own prose (this
 * comment) is the accessibility-info source instead of an invented metadata
 * record.
 *
 * Accessibility notes: `UInputGroup` renders a `<div>` with no ARIA role of
 * its own. When an addon conveys meaning (e.g. a currency symbol), the
 * consumer should associate it with the adjacent input via
 * `aria-describedby`.
 */
const meta: Meta<typeof UInputGroup> = {
  title: "Vue/InputGroup",
  component: UInputGroup,
};

export default meta;
type Story = StoryObj<typeof UInputGroup>;

/** Leading text addon. */
export const LeadingAddon: Story = {
  render: () => ({
    components: { UInputGroup, UInputGroupAddon },
    template: `
      <UInputGroup>
        <UInputGroupAddon>$</UInputGroupAddon>
        <input type="text" class="u-input-text" placeholder="Amount" />
      </UInputGroup>
    `,
  }),
};

/** Addons on both sides. */
export const BothSides: Story = {
  render: () => ({
    components: { UInputGroup, UInputGroupAddon },
    template: `
      <UInputGroup>
        <UInputGroupAddon>$</UInputGroupAddon>
        <input type="text" class="u-input-text" placeholder="Amount" />
        <UInputGroupAddon>.00</UInputGroupAddon>
      </UInputGroup>
    `,
  }),
};
