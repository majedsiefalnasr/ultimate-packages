import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UAvatar } from "./avatar";

const meta: Meta<typeof UAvatar> = {
  title: "React/Avatar",
  component: UAvatar,
};

export default meta;
type Story = StoryObj<typeof UAvatar>;

export const Label: Story = {
  args: { label: "AB" },
};

export const Icon: Story = {
  args: { icon: <span className="pi pi-user" /> },
};

export const Image: Story = {
  args: {
    image: "https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png",
    ariaLabel: "Amy Elsner",
  },
};

export const Circle: Story = {
  args: { label: "AB", shape: "circle" },
};

export const Large: Story = {
  args: { label: "AB", size: "large", shape: "circle" },
};
