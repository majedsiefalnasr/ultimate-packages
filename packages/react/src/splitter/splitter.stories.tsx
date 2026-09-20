import type { Meta, StoryObj } from "@storybook/react-vite";
import { USplitter } from "./splitter";

const meta: Meta<typeof USplitter> = {
  title: "React/Splitter",
  component: USplitter,
};

export default meta;
type Story = StoryObj<typeof USplitter>;

export const Default: Story = {
  args: {
    panels: [{ content: "Left panel" }, { content: "Right panel", minSize: 20 }],
  },
};
