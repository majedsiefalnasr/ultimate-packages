import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UOverlayBadge } from "./index";

const meta: Meta<typeof UOverlayBadge> = {
  title: "Vue/OverlayBadge",
  component: UOverlayBadge,
};

export default meta;
type Story = StoryObj<typeof UOverlayBadge>;

export const Default: Story = {
  render: (args) => ({
    components: { UOverlayBadge },
    setup() {
      return { args };
    },
    template: `<UOverlayBadge v-bind="args"><i class="pi pi-bell" style="font-size: 1.5rem"></i></UOverlayBadge>`,
  }),
  args: { value: "2", severity: "danger" },
};

export const DotOnly: Story = {
  render: (args) => ({
    components: { UOverlayBadge },
    setup() {
      return { args };
    },
    template: `<UOverlayBadge v-bind="args"><i class="pi pi-inbox" style="font-size: 1.5rem"></i></UOverlayBadge>`,
  }),
  args: { severity: "success" },
};
