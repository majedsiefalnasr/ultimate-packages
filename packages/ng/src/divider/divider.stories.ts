import type { Meta, StoryObj } from "@storybook/angular";
import { UDivider } from "./divider";

const meta: Meta<UDivider> = {
  title: "Ng/Divider",
  component: UDivider,
};

export default meta;
type Story = StoryObj<UDivider>;

export const Horizontal: Story = {
  render: () => ({
    template: `
      <div>
        <p>Content above</p>
        <u-divider></u-divider>
        <p>Content below</p>
      </div>
    `,
  }),
};

export const Vertical: Story = {
  render: () => ({
    template: `
      <div style="display: flex; height: 4rem;">
        <span>Left</span>
        <u-divider [layout]="'vertical'"></u-divider>
        <span>Right</span>
      </div>
    `,
  }),
};
