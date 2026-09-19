import type { Meta, StoryObj } from "@storybook/angular";
import { USpeedDial } from "./speed-dial";
import type { UMenuItem } from "@ultimate/ng-core";

const meta: Meta<USpeedDial> = {
  title: "Ng/SpeedDial",
  component: USpeedDial,
};

export default meta;
type Story = StoryObj<USpeedDial>;

const model: UMenuItem[] = [
  { label: "Add", icon: "pi pi-plus" },
  { label: "Edit", icon: "pi pi-pencil" },
  { label: "Upload", icon: "pi pi-upload" },
  { label: "Delete", icon: "pi pi-trash" },
];

export const Default: Story = {
  args: { model, icon: "pi pi-plus", direction: "up" },
};

export const Circle: Story = {
  args: { model, icon: "pi pi-plus", type: "circle", radius: 80 },
};
