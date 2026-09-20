import type { Meta, StoryObj } from "@storybook/react-vite";
import { UTerminal } from "./terminal";

const meta: Meta<typeof UTerminal> = {
  title: "React/Terminal",
  component: UTerminal,
};

export default meta;
type Story = StoryObj<typeof UTerminal>;

export const Default: Story = {
  args: { welcomeMessage: "Welcome to Ultimate Terminal", prompt: "ultimate$" },
};
