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

/** GAP-064 G3-B verification story (Spec §8 C5): horizontal divider with content. */
export const WithContent: Story = {
  render: () => ({
    template: `
      <div>
        <p>Content above</p>
        <u-divider><b>Label</b></u-divider>
        <p>Content below</p>
      </div>
    `,
  }),
};

/** GAP-064 G3-B verification story (Spec §8 C5): vertical divider with content. */
export const WithContentVertical: Story = {
  render: () => ({
    template: `
      <div style="display: flex; height: 4rem;">
        <span>Left</span>
        <u-divider [layout]="'vertical'"><b>OR</b></u-divider>
        <span>Right</span>
      </div>
    `,
  }),
};
