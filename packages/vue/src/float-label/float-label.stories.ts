import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UFloatLabel } from "./index";

/**
 * ACCESSIBILITY-INFO FALLBACK NOTICE: `UFloatLabel` has no
 * `packages/component-metadata/src/records/` entry — that directory only
 * covers the shared 8 (Button, Checkbox, Dialog, Menu, Paginator, Scroller,
 * Table, Tooltip). Per this task's brief, this story file's own prose (this
 * comment) is the accessibility-info source instead of an invented metadata
 * record.
 *
 * Accessibility notes: `UFloatLabel` renders a `<span>` wrapping its
 * default slot (typically an input plus its `<label>`), applying no ARIA
 * role of its own. The slotted `<label>`/`<input>` pair remains responsible
 * for its own label association (`for`/`id`).
 */
const meta: Meta<typeof UFloatLabel> = {
  title: "Vue/FloatLabel",
  component: UFloatLabel,
};

export default meta;
type Story = StoryObj<typeof UFloatLabel>;

/** Default 'over' variant — label overlaps the input's top edge, floats up on focus/content. */
export const Default: Story = {
  args: { variant: "over" },
  render: (args) => ({
    components: { UFloatLabel },
    setup() {
      return { args };
    },
    template: `
      <UFloatLabel v-bind="args">
        <input id="username" type="text" class="u-input-text" />
        <label for="username">Username</label>
      </UFloatLabel>
    `,
  }),
};

/** 'in' variant — label sits inside the input's padding area once floated. */
export const InVariant: Story = {
  args: { variant: "in" },
  render: (args) => ({
    components: { UFloatLabel },
    setup() {
      return { args };
    },
    template: `
      <UFloatLabel v-bind="args">
        <input id="username-in" type="text" class="u-input-text" />
        <label for="username-in">Username</label>
      </UFloatLabel>
    `,
  }),
};

/** 'on' variant — floated label sits directly on the input's border. */
export const OnVariant: Story = {
  args: { variant: "on" },
  render: (args) => ({
    components: { UFloatLabel },
    setup() {
      return { args };
    },
    template: `
      <UFloatLabel v-bind="args">
        <input id="username-on" type="text" class="u-input-text" />
        <label for="username-on">Username</label>
      </UFloatLabel>
    `,
  }),
};
