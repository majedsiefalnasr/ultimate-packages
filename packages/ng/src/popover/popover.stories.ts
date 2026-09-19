import type { Meta, StoryObj } from "@storybook/angular";
import { UPopover } from "./popover";

/**
 * `UPopover` is imperatively controlled (`toggle(event, target)`/`show`/
 * `hide`), matching real PrimeNG `Popover`'s own consumption pattern — a
 * trigger button's `(click)` calls `op.toggle($event)` on a template-ref'd
 * `<u-popover #op>`, mirrored here via a custom `render` template.
 */
const meta: Meta<UPopover> = {
  title: "Ng/Popover",
  component: UPopover,
};

export default meta;
type Story = StoryObj<UPopover>;

export const Default: Story = {
  render: () => ({
    template: `
      <button type="button" (click)="op.toggle($event)">Toggle Popover</button>
      <u-popover #op>
        <div style="padding: 1rem;">Popover panel content.</div>
      </u-popover>
    `,
  }),
};

export const NonDismissable: Story = {
  render: () => ({
    template: `
      <button type="button" (click)="op.toggle($event)">Toggle Popover</button>
      <u-popover #op [dismissable]="false">
        <div style="padding: 1rem;">Only closes via toggle/Escape, not outside click.</div>
      </u-popover>
    `,
  }),
};
