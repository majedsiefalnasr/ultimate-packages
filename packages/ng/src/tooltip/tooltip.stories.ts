import type { Meta, StoryObj } from "@storybook/angular";
import { UTooltip } from "./tooltip";

/**
 * Accessibility info source: `packages/component-metadata/src/records/tooltip.ts`
 * (the `TOOLTIP_METADATA` record — one of the shared 8 `component-metadata`
 * records). State coverage below is sourced from
 * `packages/ng/src/tooltip/tooltip.spec.ts`'s existing test cases (hover
 * shows role="tooltip" content, position variant, disabled).
 *
 * `UTooltip` is a `[uTooltip]` attribute directive, not a standalone
 * component with its own template — every story below therefore uses a
 * `render` function with a minimal host element (a `<button>`) carrying the
 * directive, matching tooltip.spec.ts's own `TestHostComponent` pattern.
 */
const meta: Meta<UTooltip> = {
  title: "Ng/Tooltip",
  component: UTooltip,
};

export default meta;
type Story = StoryObj<UTooltip>;

/** Default state — top position (default), hover/focus the button to show. */
export const Default: Story = {
  args: {
    uTooltip: "Save changes",
  },
  render: (args) => ({
    props: args,
    template: `<button [uTooltip]="uTooltip">Save</button>`,
  }),
};

/** Right-positioned tooltip, per tooltip.spec.ts's "applies a position-specific class" test. */
export const RightPosition: Story = {
  args: {
    uTooltip: "Save changes",
    uTooltipPosition: "right",
  },
  render: (args) => ({
    props: args,
    template: `<button [uTooltip]="uTooltip" [uTooltipPosition]="uTooltipPosition">Save</button>`,
  }),
};

/** Disabled tooltip, per tooltip.spec.ts's "does not show a tooltip when uTooltipDisabled is true" test. */
export const Disabled: Story = {
  args: {
    uTooltip: "Save changes",
    uTooltipDisabled: true,
  },
  render: (args) => ({
    props: args,
    template: `<button [uTooltip]="uTooltip" [uTooltipDisabled]="uTooltipDisabled">Save (tooltip disabled)</button>`,
  }),
};
