import type { Meta, StoryObj } from "@storybook/angular";
import { UScrollPanel } from "./scroll-panel";

const meta: Meta<UScrollPanel> = {
  title: "Ng/ScrollPanel",
  component: UScrollPanel,
};

export default meta;
type Story = StoryObj<UScrollPanel>;

export const Default: Story = {
  render: () => ({
    template: `
      <u-scroll-panel style="width: 200px; height: 200px; border: 1px solid #ccc;">
        <div style="width: 400px; height: 400px; background: linear-gradient(45deg, #eee, #ccc);">
          Scrollable content
        </div>
      </u-scroll-panel>
    `,
  }),
};
