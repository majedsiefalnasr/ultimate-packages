import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UDeferredContent } from "./index";

const meta: Meta<typeof UDeferredContent> = {
  title: "Vue/DeferredContent",
  component: UDeferredContent,
};

export default meta;
type Story = StoryObj<typeof UDeferredContent>;

export const Default: Story = {
  render: () => ({
    components: { UDeferredContent },
    template: `<div style="height: 150vh;">
      <p>Scroll down</p>
      <UDeferredContent>
        <div style="margin-top: 100vh; padding: 2rem; background: #eee;">
          I load once scrolled into view
        </div>
      </UDeferredContent>
    </div>`,
  }),
};
