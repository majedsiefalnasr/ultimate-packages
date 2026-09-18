import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UIconField, UInputIcon } from "./index";

/**
 * ACCESSIBILITY-INFO FALLBACK NOTICE: `UIconField`/`UInputIcon` have no
 * `packages/component-metadata/src/records/` entry — that directory only
 * covers the shared 8 (Button, Checkbox, Dialog, Menu, Paginator, Scroller,
 * Table, Tooltip). Per this task's brief, this story file's own prose (this
 * comment) is the accessibility-info source instead of an invented metadata
 * record.
 *
 * Accessibility notes: `UIconField` renders a `<div>` with no ARIA role of
 * its own. `UInputIcon` renders `aria-hidden="true"` by default.
 */
const meta: Meta<typeof UIconField> = {
  title: "Vue/IconField",
  component: UIconField,
};

export default meta;
type Story = StoryObj<typeof UIconField>;

/** Leading icon. */
export const LeadingIcon: Story = {
  render: () => ({
    components: { UIconField, UInputIcon },
    template: `
      <UIconField>
        <UInputIcon>search</UInputIcon>
        <input type="text" class="u-input-text" placeholder="Search" />
      </UIconField>
    `,
  }),
};

/** Trailing icon. */
export const TrailingIcon: Story = {
  render: () => ({
    components: { UIconField, UInputIcon },
    template: `
      <UIconField>
        <input type="text" class="u-input-text" placeholder="Search" />
        <UInputIcon>search</UInputIcon>
      </UIconField>
    `,
  }),
};
