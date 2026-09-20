import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UImage } from "./index";

const meta: Meta<typeof UImage> = {
  title: "Vue/Image",
  component: UImage,
};

export default meta;
type Story = StoryObj<typeof UImage>;

export const Default: Story = {
  args: {
    src: "https://primefaces.org/cdn/primevue/images/galleria/galleria10.jpg",
    alt: "Image",
    width: "200",
  },
};

export const WithPreview: Story = {
  args: {
    src: "https://primefaces.org/cdn/primevue/images/galleria/galleria10.jpg",
    alt: "Image",
    width: "200",
    preview: true,
  },
};
