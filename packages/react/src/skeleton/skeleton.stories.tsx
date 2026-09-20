import type { Meta, StoryObj } from "@storybook/react-vite";
import { USkeleton } from "./skeleton";

const meta: Meta<typeof USkeleton> = {
  title: "React/Skeleton",
  component: USkeleton,
};

export default meta;
type Story = StoryObj<typeof USkeleton>;

export const Default: Story = { args: {} };

export const Circle: Story = { args: { shape: "circle", size: "4rem" } };
