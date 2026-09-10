import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UTooltip } from "./tooltip";

/**
 * Accessibility info source: `packages/component-metadata/src/records/tooltip.ts`
 * (the `TOOLTIP_METADATA` record — one of the shared 8 `component-metadata`
 * records). State coverage below is sourced from
 * `packages/react/src/tooltip/tooltip.spec.tsx`'s existing test cases (hover
 * shows role="tooltip" content, disabled).
 *
 * `UTooltip` targets an external element via a `target` ref/selector prop —
 * it renders nothing of its own to attach hover/focus listeners to — so
 * every story below wraps it in a small host harness (a `<button>` plus a
 * ref) matching tooltip.spec.tsx's own `Trigger` component pattern. Hover or
 * focus the button to show the tooltip.
 */
const meta: Meta<typeof UTooltip> = {
  title: "React/Tooltip",
  component: UTooltip,
};

export default meta;
type Story = StoryObj<typeof UTooltip>;

function TooltipHarness(props: Omit<React.ComponentProps<typeof UTooltip>, "target">) {
  const ref = React.useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={ref} type="button">
        Hover me
      </button>
      <UTooltip {...props} target={ref} showDelay={0} hideDelay={0} />
    </>
  );
}

/** Default state — right position (UTooltip's own default), hover/focus the button to show. */
export const Default: Story = {
  args: {
    content: "Save changes",
  },
  render: (args) => <TooltipHarness {...args} />,
};

/** Left-positioned tooltip, per tooltip.spec.tsx's position-specific class coverage. */
export const LeftPosition: Story = {
  args: {
    content: "Save changes",
    position: "left",
  },
  render: (args) => <TooltipHarness {...args} />,
};

/** Disabled tooltip, per tooltip.spec.tsx's "does not show when disabled" test. */
export const Disabled: Story = {
  args: {
    content: "Save changes",
    disabled: true,
  },
  render: (args) => <TooltipHarness {...args} />,
};
