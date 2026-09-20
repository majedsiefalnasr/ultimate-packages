import type { Meta, StoryObj } from "@storybook/react-vite";
import { UTimeline } from "./timeline";

const meta: Meta<typeof UTimeline> = {
  title: "React/Timeline",
  component: UTimeline,
};

export default meta;
type Story = StoryObj<typeof UTimeline>;

export const Default: Story = {
  args: { value: ["Ordered", "Shipped", "Delivered"], content: (e: unknown) => String(e) },
};
