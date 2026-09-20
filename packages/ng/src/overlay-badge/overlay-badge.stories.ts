import type { Meta, StoryObj } from "@storybook/angular";
import { UOverlayBadge } from "./overlay-badge";

const meta: Meta<UOverlayBadge> = {
  title: "Ng/OverlayBadge",
  component: UOverlayBadge,
};

export default meta;
type Story = StoryObj<UOverlayBadge>;

export const Default: Story = {
  args: { value: "2", severity: "danger" },
  render: (args) => ({
    props: args,
    template: `<u-overlay-badge [value]="value" [severity]="severity"><i class="pi pi-bell" style="font-size: 1.5rem"></i></u-overlay-badge>`,
  }),
};

export const DotOnly: Story = {
  args: { severity: "success" },
  render: (args) => ({
    props: args,
    template: `<u-overlay-badge [severity]="severity"><i class="pi pi-inbox" style="font-size: 1.5rem"></i></u-overlay-badge>`,
  }),
};
