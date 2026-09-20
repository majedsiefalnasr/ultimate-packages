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
        <template #left><img src="https://primefaces.org/cdn/primevue/images/imagecompare/imagecompare-1.jpg" alt="before" /></template>
        <template #right><img src="https://primefaces.org/cdn/primevue/images/imagecompare/imagecompare-2.jpg" alt="after" /></template>
      </UImageCompare>
    `,
  }),
};
