import type { Meta, StoryObj } from "@storybook/angular";
import { UIconField } from "./icon-field";

/**
 * ACCESSIBILITY-INFO FALLBACK NOTICE: `UIconField`/`UInputIcon` have no
 * `packages/component-metadata/src/records/` entry — that directory only
 * covers the shared 8 (Button, Checkbox, Dialog, Menu, Paginator, Scroller,
 * Table, Tooltip). Per this task's brief, this story file's own prose (this
 * comment) is the accessibility-info source instead of an invented metadata
 * record.
 *
 * Accessibility notes: `UIconField` renders a `<u-icon-field>` host wrapping
 * projected content (an icon plus an input). It applies no ARIA role of its
 * own. `UInputIcon` is decorative and renders `aria-hidden="true"` by
 * default (ADR-091); set `aria-hidden="false"` on it when the content is
 * interactive, such as a clear button.
 */
const meta: Meta<UIconField> = {
  title: "Ng/IconField",
  component: UIconField,
};

export default meta;
type Story = StoryObj<UIconField>;

/** Leading icon (default 'left' position). */
export const LeadingIcon: Story = {
  args: { iconPosition: "left" },
  render: (args) => ({
    props: args,
    template: `
      <u-icon-field [iconPosition]="iconPosition">
        <u-input-icon>search</u-input-icon>
        <input type="text" class="u-inputtext" placeholder="Search" />
      </u-icon-field>
    `,
  }),
};

/** Trailing icon ('right' position). */
export const TrailingIcon: Story = {
  args: { iconPosition: "right" },
  render: (args) => ({
    props: args,
    template: `
      <u-icon-field [iconPosition]="iconPosition">
        <input type="text" class="u-inputtext" placeholder="Search" />
        <u-input-icon>search</u-input-icon>
      </u-icon-field>
    `,
  }),
};
