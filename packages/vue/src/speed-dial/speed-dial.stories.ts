import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { USpeedDial } from "./index";

const meta: Meta<typeof USpeedDial> = {
  title: "Vue/SpeedDial",
  component: USpeedDial,
};

export default meta;
type Story = StoryObj<typeof USpeedDial>;

const model = [
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
