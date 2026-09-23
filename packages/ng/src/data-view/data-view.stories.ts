import type { Meta, StoryObj } from "@storybook/angular";
import { UDataView } from "./data-view";

const meta: Meta<UDataView> = { title: "Data/DataView", component: UDataView };
export default meta;

type Story = StoryObj<UDataView>;
export const Default: Story = {
  args: {
    value: [{ name: "Apple" }, { name: "Banana" }],
    itemTemplate: (item) => (item as { name: string }).name,
  },
};
