import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UDivider } from "./index";

const meta: Meta<typeof UDivider> = {
  title: "Vue/Divider",
  component: UDivider,
};

export default meta;
type Story = StoryObj<typeof UDivider>;

export const Horizontal: Story = {
  render: () => ({
    components: { UDivider },
    template: `
      <div>
        <p>Content above</p>
        <UDivider />
        <p>Content below</p>
      </div>
    `,
  }),
};

export const Vertical: Story = {
  render: () => ({
    components: { UDivider },
    template: `
      <div style="display: flex; height: 4rem;">
        <span>Left</span>
        <UDivider layout="vertical" />
        <span>Right</span>
      </div>
    `,
  }),
};
