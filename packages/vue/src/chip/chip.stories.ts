import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UChip } from "./index";

const meta: Meta<typeof UChip> = {
  title: "Vue/Chip",
  component: UChip,
};

export default meta;
type Story = StoryObj<typeof UChip>;

export const Default: Story = {
  args: { label: "Action" },
};

export const WithIcon: Story = {
  args: { label: "Apple", icon: "pi pi-apple" },
};

export const Removable: Story = {
  args: { label: "Removable Chip", removable: true },
};
