import type { Meta, StoryObj } from "@storybook/angular";
import { UScrollTop } from "./scroll-top";

const meta: Meta<UScrollTop> = {
  title: "Ng/ScrollTop",
  component: UScrollTop,
};

export default meta;
type Story = StoryObj<UScrollTop>;

export const Default: Story = {
  args: { threshold: 100 },
  render: (args) => ({
    props: args,
    template: `
      <div style="height: 2000px;">
        <p>Scroll down to reveal the scroll-to-top button.</p>
      </div>
      <u-scroll-top [threshold]="threshold"></u-scroll-top>
    `,
  }),
};
