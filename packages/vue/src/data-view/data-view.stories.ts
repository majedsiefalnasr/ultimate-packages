import type { Meta, StoryObj } from "@storybook/vue3-vite";
import UDataView from "./DataView.vue";

const meta: Meta<typeof UDataView> = { title: "Data/DataView", component: UDataView };

export default meta;

type Story = StoryObj<typeof UDataView>;

export const Default: Story = { args: { value: [{ name: "Apple" }, { name: "Banana" }] } };
