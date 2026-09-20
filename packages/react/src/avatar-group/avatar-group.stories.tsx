import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UAvatar } from "../avatar";
import { UAvatarGroup } from "./avatar-group";

const meta: Meta<typeof UAvatarGroup> = {
  title: "React/AvatarGroup",
  component: UAvatarGroup,
};

export default meta;
type Story = StoryObj<typeof UAvatarGroup>;

export const Default: Story = {
  render: () => (
    <UAvatarGroup>
      <UAvatar label="A" shape="circle" />
      <UAvatar label="B" shape="circle" />
      <UAvatar label="C" shape="circle" />
      <UAvatar label="+3" shape="circle" />
    </UAvatarGroup>
  ),
};
