import type { Meta, StoryObj } from "@storybook/react-vite";
import { UImage } from "./image";

const meta: Meta<typeof UImage> = {
  title: "React/Image",
  component: UImage,
};

export default meta;
type Story = StoryObj<typeof UImage>;

export const Default: Story = {
  args: {
    src: "https://primefaces.org/cdn/primereact/images/galleria/galleria10.jpg",
    alt: "Image",
    width: "200",
  },
};

export const WithPreview: Story = {
  args: {
    src: "https://primefaces.org/cdn/primereact/images/galleria/galleria10.jpg",
    alt: "Image",
    width: "200",
    preview: true,
  },
};
