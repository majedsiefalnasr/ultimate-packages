import type { Meta, StoryObj } from "@storybook/angular";
import { UDock } from "./dock";
import type { UMenuItem } from "@ultimate/ng-core";

const meta: Meta<UDock> = {
  title: "Ng/Dock",
  component: UDock,
};

export default meta;
type Story = StoryObj<UDock>;

const model: UMenuItem[] = [
  { label: "Finder", icon: "pi pi-search" },
  { label: "Mail", icon: "pi pi-envelope" },
  { label: "Calendar", icon: "pi pi-calendar" },
  { label: "Trash", icon: "pi pi-trash" },
];

export const Default: Story = {
  args: { model, position: "bottom" },
};

export const LeftPosition: Story = {
  args: { model, position: "left" },
};
