import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UPopover, type UPopoverHandle } from "./popover";

/**
 * `UPopover` is imperatively controlled via a ref handle
 * (`toggle`/`show`/`hide`), matching real PrimeReact `OverlayPanel`'s own
 * consumption pattern — a trigger button calls `ref.current.toggle(event)`.
 */
const meta: Meta<typeof UPopover> = {
  title: "React/Popover",
  component: UPopover,
};

export default meta;
type Story = StoryObj<typeof UPopover>;

function PopoverHarness(props: React.ComponentProps<typeof UPopover>) {
  const ref = React.useRef<UPopoverHandle>(null);
  return (
    <>
      <button type="button" onClick={(e) => ref.current?.toggle(e)}>
        Toggle Popover
      </button>
      <UPopover {...props} ref={ref}>
        {props.children}
      </UPopover>
    </>
  );
}

export const Default: Story = {
  render: (args) => (
    <PopoverHarness {...args}>
      <div style={{ padding: "1rem" }}>Popover panel content.</div>
    </PopoverHarness>
  ),
};

export const NonDismissable: Story = {
  args: { dismissable: false },
  render: (args) => (
    <PopoverHarness {...args}>
      <div style={{ padding: "1rem" }}>Only closes via toggle/Escape, not outside click.</div>
    </PopoverHarness>
  ),
};
