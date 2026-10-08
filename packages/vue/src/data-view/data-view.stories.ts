import type { Meta, StoryObj } from "@storybook/vue3-vite";
import UDataView from "./DataView.vue";

const meta: Meta<typeof UDataView> = { title: "Data/DataView", component: UDataView };

export default meta;

type Story = StoryObj<typeof UDataView>;

export const Default: Story = { args: { value: [{ name: "Apple" }, { name: "Banana" }] } };

const six = ["Apple", "Banana", "Cherry", "Date", "Elderberry", "Fig"].map((name) => ({ name }));
/** GAP-064 G3-E verification story: grid layout. */
export const Grid: Story = {
  args: { value: [{ name: "Apple" }, { name: "Banana" }], layout: "grid" },
};
/** GAP-064 G3-E verification story: paginator, 2 rows per page. */
export const Paginator: Story = { args: { value: six, paginator: true, rows: 2 } };
/** GAP-064 G3-E verification story: empty value. */
export const Empty: Story = { args: { value: [] } };
