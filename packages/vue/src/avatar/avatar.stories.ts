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

/** GAP-064 G3-A verification story (Spec §13.3): extra-large size. */
export const Xl: Story = {
  args: { label: "AB", size: "xlarge" },
};

/** GAP-064 G3-A verification story: deterministic local image (no network). */
export const LocalImage: Story = {
  args: {
    image:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='64' height='64' fill='%2360a5fa'/></svg>",
  },
};
