import type { Meta, StoryObj } from "@storybook/react-vite";
import { UProgressBar } from "./progress-bar";

const meta: Meta<typeof UProgressBar> = {
  title: "React/ProgressBar",
  component: UProgressBar,
};

export default meta;
type Story = StoryObj<typeof UProgressBar>;

export const Determinate: Story = {
  args: { value: 60 },
};

export const Indeterminate: Story = {
  args: { mode: "indeterminate" },
};
