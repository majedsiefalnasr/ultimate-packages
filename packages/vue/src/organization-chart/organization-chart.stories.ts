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

const tree = {
  label: "CEO",
  key: "0",
  children: [
    { label: "CTO", key: "0_0" },
    { label: "CFO", key: "0_1" },
  ],
};
/** GAP-064 G3-E verification story: single selection (one node pre-selected). */
export const SingleSelection: Story = {
  args: { value: tree, selectionMode: "single", selectionKeys: { "0_0": true } },
};
/** GAP-064 G3-E verification story: multiple selection (two nodes pre-selected). */
export const MultipleSelection: Story = {
  args: { value: tree, selectionMode: "multiple", selectionKeys: { "0_0": true, "0_1": true } },
};
/** GAP-064 G3-E verification story: collapsible nodes. */
export const Collapsible: Story = { args: { value: tree, collapsible: true } };
