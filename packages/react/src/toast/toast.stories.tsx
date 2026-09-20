import type { Meta, StoryObj } from "@storybook/react-vite";
import { UToast } from "./toast";

const meta: Meta<typeof UToast> = {
  title: "React/Toast",
  component: UToast,
};

export default meta;
type Story = StoryObj<typeof UToast>;

export const Default: Story = { args: {} };
