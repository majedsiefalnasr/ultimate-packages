import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UKeyFilter } from "./key-filter";

/**
 * `UKeyFilter` (`v-key-filter`) has no `packages/component-metadata/src/records/`
 * entry — same fallback pattern documented across this batch's other
 * stories. It is a keystroke-filtering directive, not a form control: it
 * blocks `keypress`/`paste` events that would produce a value not matching
 * its pattern, and renders no UI of its own.
 *
 * State coverage below is sourced from
 * `packages/vue/src/key-filter/key-filter.spec.ts` (named presets, custom
 * RegExp, paste blocking, `validateOnly`).
 */
const meta: Meta = {
  title: "Vue/KeyFilter",
};

export default meta;
type Story = StoryObj;

/** Integer-only preset — allows digits and a leading '-'. */
export const IntegerOnly: Story = {
  render: () => ({
    directives: { "key-filter": UKeyFilter },
    template: `<input v-key-filter="'int'" placeholder="Integer only" />`,
  }),
};

/** Alphanumeric preset. */
export const Alphanumeric: Story = {
  render: () => ({
    directives: { "key-filter": UKeyFilter },
    template: `<input v-key-filter="'alphanum'" placeholder="Letters and numbers" />`,
  }),
};

/** Custom RegExp pattern. */
export const CustomPattern: Story = {
  render: () => ({
    directives: { "key-filter": UKeyFilter },
    setup() {
      return { pattern: /^[abc]*$/ };
    },
    template: `<input v-key-filter="pattern" placeholder="a, b, or c only" />`,
  }),
};
