import { Component } from "@angular/core";
import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { UPickList } from "./pick-list";

@Component({
  selector: "story-controlled-pick-list",
  standalone: true,
  imports: [UPickList],
  template: `<u-pick-list
    [source]="source"
    [target]="target"
    (sourceChange)="source = $event"
    (targetChange)="target = $event"
  />`,
})
class ControlledPickListStory {
  source = ["Apple", "Banana", "Cherry"];
  target: string[] = [];
}

const meta: Meta<UPickList> = { title: "Data/PickList", component: UPickList };
export default meta;
type Story = StoryObj<UPickList>;
export const Default: Story = { args: { source: ["Apple", "Banana", "Cherry"], target: [] } };
export const Controlled: Story = {
  decorators: [moduleMetadata({ imports: [ControlledPickListStory] })],
  render: () => ({ template: "<story-controlled-pick-list />" }),
};
