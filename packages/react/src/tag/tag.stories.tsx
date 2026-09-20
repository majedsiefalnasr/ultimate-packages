import type { Meta, StoryObj } from "@storybook/react-vite";
import { UTag } from "./tag";

const meta: Meta<typeof UTag> = {
  title: "React/Tag",
  component: UTag,
};

export default meta;
type Story = StoryObj<typeof UTag>;

export const Default: Story = { args: { children: "New" } };

export const Severity: Story = { args: { severity: "success", children: "Success" } };
