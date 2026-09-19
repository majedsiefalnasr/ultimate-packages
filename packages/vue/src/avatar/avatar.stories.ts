import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UAvatar } from "./index";

const meta: Meta<typeof UAvatar> = {
  title: "Vue/Avatar",
  component: UAvatar,
};

export default meta;
type Story = StoryObj<typeof UAvatar>;

export const Label: Story = {
  args: { label: "AB" },
};

export const Icon: Story = {
  args: { icon: "pi pi-user" },
};

export const Image: Story = {
  args: { image: "https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" },
};

export const Circle: Story = {
  args: { label: "AB", shape: "circle" },
};

export const Large: Story = {
  args: { label: "AB", size: "large", shape: "circle" },
};
