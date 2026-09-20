import type { Meta, StoryObj } from "@storybook/angular";
import { UTimeline } from "./timeline";

const meta: Meta<UTimeline> = {
  title: "Ng/Timeline",
  component: UTimeline,
};

export default meta;
type Story = StoryObj<UTimeline>;

export const Default: Story = {
  render: () => ({
    props: { events: ["Ordered", "Shipped", "Delivered"] },
    template: `<u-timeline [value]="events">
      <ng-template #content let-event>{{ event }}</ng-template>
    </u-timeline>`,
  }),
};
