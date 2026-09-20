import type { Meta, StoryObj } from "@storybook/angular";
import { UImage } from "./image";

const meta: Meta<UImage> = {
  title: "Ng/Image",
  component: UImage,
};

export default meta;
type Story = StoryObj<UImage>;

export const Default: Story = {
  args: { src: "https://primefaces.org/cdn/primeng/images/galleria/galleria10.jpg", alt: "Image" },
  render: (args) => ({
    props: args,
    template: `<u-image [src]="src" [alt]="alt" [width]="'200'"></u-image>`,
  }),
};

export const WithPreview: Story = {
  args: {
    src: "https://primefaces.org/cdn/primeng/images/galleria/galleria10.jpg",
    alt: "Image",
    preview: true,
  },
  render: (args) => ({
    props: args,
    template: `<u-image [src]="src" [alt]="alt" [width]="'200'" [preview]="preview"></u-image>`,
  }),
};
