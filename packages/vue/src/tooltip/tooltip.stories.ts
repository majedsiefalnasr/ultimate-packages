import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { tooltipDirective } from "./index";

/**
 * Accessibility info source: `packages/component-metadata/src/records/tooltip.ts`
 * (the `TOOLTIP_METADATA` record — one of the shared 8 `component-metadata`
 * records, covering `v-tooltip` despite it being a directive rather than a
 * component; confirmed present in that directory alongside the other 7).
 * State coverage below is sourced from
 * `packages/vue/src/tooltip/tooltip.spec.ts`'s existing test cases (hover
 * shows a role="tooltip" panel with the bound content, disabled).
 *
 * `v-tooltip` is a Vue custom directive, target-based (spec §9 of the
 * originating plan) — NOT a wrapper component — so every story below
 * declares it as a `global.directives` registration and applies it directly
 * to a `<button>` host element, matching tooltip.spec.ts's own
 * `mountTarget()` harness pattern. Hover or focus the button to show the
 * tooltip.
 */
const meta: Meta = {
  title: "Vue/Tooltip",
  render: (args) => ({
    directives: { tooltip: tooltipDirective },
    setup() {
      return { args };
    },
    template: `<button type="button" v-tooltip="args.content">Hover me</button>`,
  }),
};

export default meta;
type Story = StoryObj<{ content: string }>;

/** Default state, hover/focus the button to show. Per tooltip.spec.ts's "renders a role=tooltip panel with the content on show" test. */
export const Default: Story = {
  args: {
    content: "Save changes",
  },
};

/** Disabled tooltip, per tooltip.spec.ts's binding-object `disabled` coverage. */
export const Disabled: Story = {
  render: (args) => ({
    directives: { tooltip: tooltipDirective },
    setup() {
      return { args };
    },
    template: `<button type="button" v-tooltip="{ value: args.content, disabled: true }">Hover me (disabled)</button>`,
  }),
  args: {
    content: "Save changes",
  },
};
