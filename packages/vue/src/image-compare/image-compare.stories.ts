import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UImageCompare } from "./index";

const meta: Meta<typeof UImageCompare> = {
  title: "Vue/ImageCompare",
  component: UImageCompare,
};

export default meta;
type Story = StoryObj<typeof UImageCompare>;

export const Default: Story = {
  render: () => ({
    components: { UImageCompare },
    template: `
      <UImageCompare style="width: 20rem;">
        <template #left><img src="/media/landscape-1.png" alt="before" /></template>
        <template #right><img src="/media/landscape-2.png" alt="after" /></template>
      </UImageCompare>
    `,
  }),
};

/** GAP-064 G3-E verification story: sized by a wrapper, so the clipping cases do not depend on GAP-102. */
export const Sized: Story = {
  render: () => ({
    components: { UImageCompare },
    template: `
      <div style="width: 20rem;">
        <UImageCompare>
          <template #left><img src="/media/landscape-1.png" alt="before" /></template>
          <template #right><img src="/media/landscape-2.png" alt="after" /></template>
        </UImageCompare>
      </div>
    `,
  }),
};

/** GAP-064 G3-E verification story: RTL (upstream :dir(rtl) clip rule). */
export const Rtl: Story = {
  render: () => ({
    components: { UImageCompare },
    template: `
      <div dir="rtl" style="width: 20rem;">
        <UImageCompare>
          <template #left><img src="/media/landscape-1.png" alt="before" /></template>
          <template #right><img src="/media/landscape-2.png" alt="after" /></template>
        </UImageCompare>
      </div>
    `,
  }),
};
