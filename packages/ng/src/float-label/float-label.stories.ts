import type { Meta, StoryObj } from "@storybook/angular";
import { UFloatLabel } from "./float-label";

/**
 * ACCESSIBILITY-INFO FALLBACK NOTICE: `UFloatLabel` has no
 * `packages/component-metadata/src/records/` entry — that directory only
 * covers the shared 8 (Button, Checkbox, Dialog, Menu, Paginator, Scroller,
 * Table, Tooltip). Per this task's brief, this story file's own prose (this
 * comment) is the accessibility-info source for `UFloatLabel` instead of an
 * invented metadata record.
 *
 * Accessibility notes: `UFloatLabel` renders a `<u-float-label>` host
 * wrapping projected content (typically an input plus its `<label>`). It
 * applies no ARIA role of its own — it is a purely visual label-position
 * wrapper. The projected `<label>`/`<input>` pair remains responsible for
 * its own label association (`for`/`id`); consumers must supply that
 * themselves, same as with a bare `<label>`.
 */
const meta: Meta<UFloatLabel> = {
  title: "Ng/FloatLabel",
  component: UFloatLabel,
};

export default meta;
type Story = StoryObj<UFloatLabel>;

/** Default 'over' variant — label overlaps the input's top edge, floats up on focus/content. */
export const Default: Story = {
  args: { variant: "over" },
  render: (args) => ({
    props: args,
    template: `
      <u-float-label [variant]="variant">
        <input id="username" type="text" class="u-input-text" />
        <label for="username">Username</label>
      </u-float-label>
    `,
  }),
};

/** 'in' variant — label sits inside the input's padding area once floated. */
export const InVariant: Story = {
  args: { variant: "in" },
  render: (args) => ({
    props: args,
    template: `
      <u-float-label [variant]="variant">
        <input id="username-in" type="text" class="u-input-text" />
        <label for="username-in">Username</label>
      </u-float-label>
    `,
  }),
};

/** 'on' variant — floated label sits directly on the input's border. */
export const OnVariant: Story = {
  args: { variant: "on" },
  render: (args) => ({
    props: args,
    template: `
      <u-float-label [variant]="variant">
        <input id="username-on" type="text" class="u-input-text" />
        <label for="username-on">Username</label>
      </u-float-label>
    `,
  }),
};
