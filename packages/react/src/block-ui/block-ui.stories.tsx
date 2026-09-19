import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UBlockUI } from "./block-ui";

const meta: Meta<typeof UBlockUI> = {
  title: "React/BlockUI",
  component: UBlockUI,
};

export default meta;
type Story = StoryObj<typeof UBlockUI>;

export const Default: Story = {
  args: { blocked: true },
  render: (args) => (
    <UBlockUI {...args} style={{ display: "block", height: 150, border: "1px dashed #999" }}>
      <p style={{ padding: "1rem" }}>Content that can be blocked.</p>
    </UBlockUI>
  ),
};

export const Unblocked: Story = {
  args: { blocked: false },
  render: (args) => (
    <UBlockUI {...args} style={{ display: "block", height: 150, border: "1px dashed #999" }}>
      <p style={{ padding: "1rem" }}>Content that can be blocked.</p>
    </UBlockUI>
  ),
};
