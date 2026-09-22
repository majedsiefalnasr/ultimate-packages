import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { UOrderList } from "./order-list";

function ControlledOrderListStory(): React.ReactElement {
  const [value, setValue] = useState(["Apple", "Banana", "Cherry", "Date"]);
  return <UOrderList value={value} onChange={setValue} itemTemplate={(item) => <span>{item}</span>} />;
}

const meta: Meta<typeof UOrderList> = {
  title: "Data/OrderList",
  component: UOrderList,
};
export default meta;

type Story = StoryObj<typeof UOrderList>;

export const Default: Story = {
  args: {
    value: ["Apple", "Banana", "Cherry", "Date"],
    itemTemplate: (item) => <span>{item as string}</span>,
  },
};

export const WithDragDrop: Story = {
  args: {
    value: ["Apple", "Banana", "Cherry", "Date"],
    dragdrop: true,
    itemTemplate: (item) => <span>{item as string}</span>,
  },
};

export const Controlled: Story = {
  render: () => <ControlledOrderListStory />,
};
