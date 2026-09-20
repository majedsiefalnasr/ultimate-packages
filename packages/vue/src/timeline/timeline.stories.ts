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
