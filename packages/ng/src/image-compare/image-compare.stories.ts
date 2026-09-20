import type { Meta, StoryObj } from "@storybook/angular";
import { UImageCompare } from "./image-compare";

const meta: Meta<UImageCompare> = {
  title: "Ng/ImageCompare",
  component: UImageCompare,
};

export default meta;
type Story = StoryObj<UImageCompare>;

export const Default: Story = {
  render: () => ({
    template: `
      <u-image-compare style="width: 20rem;">
        <img left src="https://primefaces.org/cdn/primeng/images/imagecompare/imagecompare-1.jpg" alt="before" />
        <img right src="https://primefaces.org/cdn/primeng/images/imagecompare/imagecompare-2.jpg" alt="after" />
      </u-image-compare>
    `,
  }),
};
