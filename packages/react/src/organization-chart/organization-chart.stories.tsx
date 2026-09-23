import type { Meta, StoryObj } from "@storybook/react-vite";
import { UOrganizationChart } from "./organization-chart";

const meta: Meta<typeof UOrganizationChart> = {
  title: "Panel/OrganizationChart",
  component: UOrganizationChart,
};
export default meta;
type Story = StoryObj<typeof UOrganizationChart>;
export const Default: Story = {
  args: {
    value: [{ label: "CEO", expanded: true, children: [{ label: "CTO" }, { label: "CFO" }] }],
  },
};
