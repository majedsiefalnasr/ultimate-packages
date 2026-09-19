import type { Meta, StoryObj } from "@storybook/angular";
import { UAvatar } from "./avatar";

const meta: Meta<UAvatar> = {
  title: "Ng/Avatar",
  component: UAvatar,
};

export default meta;
type Story = StoryObj<UAvatar>;

export const Label: Story = {
  args: { label: "AB" },
};

export const Icon: Story = {
  args: { icon: "pi pi-user" },
};

export const Image: Story = {
  args: { image: "https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png" },
};

export const Circle: Story = {
  args: { label: "AB", shape: "circle" },
};

export const Large: Story = {
  args: { label: "AB", size: "large", shape: "circle" },
};
