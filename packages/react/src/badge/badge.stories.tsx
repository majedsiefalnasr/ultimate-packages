import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UBadge } from "./badge";

const meta: Meta<typeof UBadge> = {
  title: "React/Badge",
  component: UBadge,
};

export default meta;
type Story = StoryObj<typeof UBadge>;

export const Default: Story = {
  args: { value: "5" },
};

export const Severities: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <UBadge value="2" severity="secondary" />
      <UBadge value="2" severity="info" />
      <UBadge value="2" severity="success" />
      <UBadge value="2" severity="warning" />
      <UBadge value="2" severity="danger" />
      <UBadge value="2" severity="contrast" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <UBadge value="1" size="small" />
      <UBadge value="12" />
      <UBadge value="123" size="large" />
      <UBadge value="1234" size="xlarge" />
    </div>
  ),
};

export const Dot: Story = {
  render: () => <UBadge severity="danger" />,
};
