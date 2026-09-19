import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UDock } from "./index";

const meta: Meta<typeof UDock> = {
  title: "Vue/Dock",
  component: UDock,
};

export default meta;
type Story = StoryObj<typeof UDock>;

const model = [
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
