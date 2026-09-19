import type { Meta, StoryObj } from "@storybook/react-vite";
import { UDock } from "./dock";
import type { UMenuItem } from "../menu";

const meta: Meta<typeof UDock> = {
  title: "React/Dock",
  component: UDock,
};

export default meta;
type Story = StoryObj<typeof UDock>;

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
