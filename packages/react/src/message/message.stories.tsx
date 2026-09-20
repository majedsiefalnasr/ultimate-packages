import type { Meta, StoryObj } from "@storybook/react-vite";
import { UMessage } from "./message";

const meta: Meta<typeof UMessage> = {
  title: "React/Message",
  component: UMessage,
};

export default meta;
type Story = StoryObj<typeof UMessage>;

export const Default: Story = {
  args: { severity: "info", children: "This is an informational message." },
};

export const Closable: Story = {
  args: { severity: "warn", closable: true, children: "This message can be closed." },
};
