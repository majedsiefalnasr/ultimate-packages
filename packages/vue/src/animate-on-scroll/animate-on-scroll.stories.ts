import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { animateOnScrollDirective } from "./animate-on-scroll";

const meta: Meta = {
  title: "Vue/AnimateOnScroll",
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => ({
    directives: { "animate-on-scroll": animateOnScrollDirective },
    template: `<div style="height: 150vh;">
      <p>Scroll down</p>
      <div v-animate-on-scroll="{ enterClass: 'fade-in', leaveClass: 'fade-out' }" style="margin-top: 100vh; padding: 2rem; background: #eee;">
        I animate on scroll
      </div>
    </div>`,
  }),
};
