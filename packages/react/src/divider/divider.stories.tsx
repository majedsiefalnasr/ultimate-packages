import type { Meta, StoryObj } from "@storybook/react-vite";
import { UDivider } from "./divider";

const meta: Meta<typeof UDivider> = {
  title: "React/Divider",
  component: UDivider,
};

export default meta;
type Story = StoryObj<typeof UDivider>;

export const Horizontal: Story = {
  render: () => (
    <div>
      <p>Content above</p>
      <UDivider />
      <p>Content below</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{ display: "flex", height: "4rem" }}>
      <span>Left</span>
      <UDivider layout="vertical" />
      <span>Right</span>
    </div>
  ),
};
