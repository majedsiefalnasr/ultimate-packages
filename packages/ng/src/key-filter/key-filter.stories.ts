import type { Meta, StoryObj } from "@storybook/angular";
import { UKeyFilter } from "./key-filter";

/**
 * ACCESSIBILITY-INFO FALLBACK NOTICE: `UKeyFilter` has no
 * `packages/component-metadata/src/records/` entry (same fallback pattern
 * `UAutoFocus`'s own story file documents) — this comment is the
 * accessibility-info source instead of an invented metadata record.
 *
 * `UKeyFilter` (`[uKeyFilter]`) is a keystroke-filtering behavior, not a
 * form control — it blocks `keypress`/`paste` events that would produce a
 * value not matching its pattern. It does not manage focus, ARIA state, or
 * any visible UI of its own; the host `<input>` retains full ownership of
 * its own accessibility semantics.
 *
 * State coverage below is sourced from
 * `packages/ng/src/key-filter/key-filter.spec.ts` (named presets, custom
 * RegExp, paste blocking, `validateOnly`).
 */
const meta: Meta<UKeyFilter> = {
  title: "Ng/KeyFilter",
  component: UKeyFilter,
};

export default meta;
type Story = StoryObj<UKeyFilter>;

/** Integer-only preset — allows digits and a leading '-'. */
export const IntegerOnly: Story = {
  render: () => ({
    template: `<input type="text" uKeyFilter="int" placeholder="Integer only" />`,
  }),
};

/** Alphanumeric preset. */
export const Alphanumeric: Story = {
  render: () => ({
    template: `<input type="text" uKeyFilter="alphanum" placeholder="Letters and numbers" />`,
  }),
};

/** Custom RegExp pattern. */
export const CustomPattern: Story = {
  render: () => ({
    template: `<input type="text" [uKeyFilter]="pattern" placeholder="a, b, or c only" />`,
    props: { pattern: /^[abc]*$/ },
  }),
};
