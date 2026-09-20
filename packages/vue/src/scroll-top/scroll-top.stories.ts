import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UScrollTop } from "./index";

const meta: Meta<typeof UScrollTop> = {
  title: "Vue/ScrollTop",
  component: UScrollTop,
};

export default meta;
type Story = StoryObj<typeof UScrollTop>;

export const Default: Story = {
  args: { threshold: 100 },
  render: (args) => ({
    components: { UScrollTop },
    setup: () => ({ args }),
    template: `
      <div>
        <div style="height: 2000px;">
          <p>Scroll down to reveal the scroll-to-top button.</p>
        </div>
        <UScrollTop v-bind="args" />
      </div>
    `,
  }),
};
