import type { Meta, StoryObj } from "@storybook/vue3-vite";
import UOrganizationChart from "./OrganizationChart.vue";

const meta: Meta<typeof UOrganizationChart> = {
  title: "Panel/OrganizationChart",
  component: UOrganizationChart,
};
export default meta;
type Story = StoryObj<typeof UOrganizationChart>;
export const Default: Story = {
  args: {
    value: {
      label: "CEO",
      key: "0",
      children: [
        { label: "CTO", key: "0_0" },
        { label: "CFO", key: "0_1" },
      ],
    },
  },
};
