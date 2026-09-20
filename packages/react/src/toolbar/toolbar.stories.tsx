import type { Meta, StoryObj } from "@storybook/react-vite";
import { UToolbar } from "./toolbar";

const meta: Meta<typeof UToolbar> = {
  title: "React/Toolbar",
  component: UToolbar,
};

export default meta;
type Story = StoryObj<typeof UToolbar>;

export const Default: Story = { args: { start: "Left", end: "Right" } };
