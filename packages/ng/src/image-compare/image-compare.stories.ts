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
        <img left src="/media/landscape-1.png" alt="before" />
        <img right src="/media/landscape-2.png" alt="after" />
      </u-image-compare>
    `,
  }),
};

/** GAP-064 G3-E verification story: sized by a wrapper, so the clipping cases do not depend on GAP-102. */
export const Sized: Story = {
  render: () => ({
    template: `
      <div style="width: 20rem;">
        <u-image-compare>
          <img left src="/media/landscape-1.png" alt="before" />
          <img right src="/media/landscape-2.png" alt="after" />
        </u-image-compare>
      </div>
    `,
  }),
};

/** GAP-064 G3-E verification story: RTL (upstream :dir(rtl) clip rule). */
export const Rtl: Story = {
  render: () => ({
    template: `
      <div dir="rtl" style="width: 20rem;">
        <u-image-compare>
          <img left src="/media/landscape-1.png" alt="before" />
          <img right src="/media/landscape-2.png" alt="after" />
        </u-image-compare>
      </div>
    `,
  }),
};
