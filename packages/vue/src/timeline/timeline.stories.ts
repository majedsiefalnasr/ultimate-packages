import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UTimeline } from "./index";

const meta: Meta<typeof UTimeline> = {
  title: "Vue/Timeline",
  component: UTimeline,
};

export default meta;
type Story = StoryObj<typeof UTimeline>;

export const Default: Story = {
  render: () => ({
    components: { UTimeline },
    setup: () => ({ events: ["Ordered", "Shipped", "Delivered"] }),
    template: `<UTimeline :value="events">
      <template #content="{ item }">{{ item }}</template>
    </UTimeline>`,
  }),
};

/** GAP-064 G3-A verification story: horizontal layout. */
export const Horizontal: Story = {
  render: () => ({
    components: { UTimeline },
    setup: () => ({ events: ["Ordered", "Shipped", "Delivered"] }),
    template: `<UTimeline :value="events" layout="horizontal">
      <template #content="{ item }">{{ item }}</template>
    </UTimeline>`,
  }),
};
