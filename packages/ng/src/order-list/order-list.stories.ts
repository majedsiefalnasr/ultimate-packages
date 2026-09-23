import { Component } from "@angular/core";
import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { UOrderList } from "./order-list";

@Component({
  selector: "story-controlled-order-list",
  standalone: true,
  imports: [UOrderList],
  template: `<u-order-list [value]="value" (valueChange)="value = $event" />`,
})
class ControlledOrderListStory {
  value = ["Apple", "Banana", "Cherry", "Date"];
}

const meta: Meta<UOrderList> = {
  title: "Data/OrderList",
  component: UOrderList,
};
export default meta;

type Story = StoryObj<UOrderList>;

export const Default: Story = {
  args: { value: ["Apple", "Banana", "Cherry", "Date"] },
};

export const WithDragDrop: Story = {
  args: { value: ["Apple", "Banana", "Cherry", "Date"], dragdrop: true },
};

export const Controlled: Story = {
  decorators: [moduleMetadata({ imports: [ControlledOrderListStory] })],
  render: () => ({ template: "<story-controlled-order-list />" }),
};
