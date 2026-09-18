import type { Meta, StoryObj } from "@storybook/angular";
import { UInputGroup } from "./input-group";

/**
 * ACCESSIBILITY-INFO FALLBACK NOTICE: `UInputGroup`/`UInputGroupAddon` have
 * no `packages/component-metadata/src/records/` entry — that directory only
 * covers the shared 8 (Button, Checkbox, Dialog, Menu, Paginator, Scroller,
 * Table, Tooltip). Per this task's brief, this story file's own prose (this
 * comment) is the accessibility-info source instead of an invented metadata
 * record.
 *
 * Accessibility notes: `UInputGroup` renders a `<u-input-group>` host with
 * no ARIA role of its own — it is a purely visual layout wrapper. When an
 * addon conveys meaning (e.g. a currency symbol), the consumer should
 * associate it with the adjacent input via `aria-describedby`.
 */
const meta: Meta<UInputGroup> = {
  title: "Ng/InputGroup",
  component: UInputGroup,
};

export default meta;
type Story = StoryObj<UInputGroup>;

/** Leading text addon. */
export const LeadingAddon: Story = {
  render: () => ({
    template: `
      <u-input-group>
        <u-input-group-addon>$</u-input-group-addon>
        <input type="text" class="u-input-text" placeholder="Amount" />
      </u-input-group>
    `,
  }),
};

/** Addons on both sides. */
export const BothSides: Story = {
  render: () => ({
    template: `
      <u-input-group>
        <u-input-group-addon>$</u-input-group-addon>
        <input type="text" class="u-input-text" placeholder="Amount" />
        <u-input-group-addon>.00</u-input-group-addon>
      </u-input-group>
    `,
  }),
};
