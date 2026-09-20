import type { Meta, StoryObj } from "@storybook/angular";
import { UAnimateOnScroll } from "./animate-on-scroll";

const meta: Meta<UAnimateOnScroll> = {
  title: "Ng/AnimateOnScroll",
  component: UAnimateOnScroll,
};

export default meta;
type Story = StoryObj<UAnimateOnScroll>;

export const Default: Story = {
  render: () => ({
    template: `<div style="height: 150vh;">
      <p>Scroll down</p>
      <div uAnimateOnScroll enterClass="fade-in" leaveClass="fade-out" style="margin-top: 100vh; padding: 2rem; background: #eee;">
        I animate on scroll
      </div>
    </div>`,
  }),
};
