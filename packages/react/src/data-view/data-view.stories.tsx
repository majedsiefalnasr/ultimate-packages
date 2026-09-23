import type { Meta, StoryObj } from "@storybook/react-vite";
import { UDataView } from "./data-view";

const meta: Meta<typeof UDataView> = { title: "Data/DataView", component: UDataView };

export default meta;

type Story = StoryObj<typeof UDataView>;

export const Default: Story = {
  args: {
    value: [{ name: "Apple" }, { name: "Banana" }],
    itemTemplate: (item) => <span>{(item as { name: string }).name}</span>,
  },
};
