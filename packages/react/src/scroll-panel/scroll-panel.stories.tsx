import type { Meta, StoryObj } from "@storybook/react-vite";
import { UScrollPanel } from "./scroll-panel";

const meta: Meta<typeof UScrollPanel> = {
  title: "React/ScrollPanel",
  component: UScrollPanel,
};

export default meta;
type Story = StoryObj<typeof UScrollPanel>;

export const Default: Story = {
  render: () => (
    <UScrollPanel>
      <div
        style={{
          width: 400,
          height: 400,
          background: "linear-gradient(45deg, #eee, #ccc)",
        }}
      >
        Scrollable content
      </div>
    </UScrollPanel>
  ),
};
