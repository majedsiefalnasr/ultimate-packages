import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { UOrderList } from "./order-list";

function ControlledOrderListStory({
  dragdrop = false,
}: {
  dragdrop?: boolean;
}): React.ReactElement {
  const [value, setValue] = useState(["Apple", "Banana", "Cherry", "Date"]);
  return (
    <UOrderList
      value={value}
      onChange={setValue}
      dragdrop={dragdrop}
      itemTemplate={(item) => <span>{item}</span>}
    />
  );
}

const meta: Meta<typeof UOrderList> = {
  title: "Data/OrderList",
  component: UOrderList,
};
export default meta;

type Story = StoryObj<typeof UOrderList>;

export const Default: Story = {
  render: () => <ControlledOrderListStory />,
};

export const WithDragDrop: Story = {
  render: () => <ControlledOrderListStory dragdrop />,
};

export const Controlled: Story = {
  render: () => <ControlledOrderListStory />,
};
