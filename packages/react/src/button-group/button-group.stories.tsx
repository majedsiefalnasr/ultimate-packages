import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UButton } from "../button";
import { UButtonGroup } from "./button-group";

const meta: Meta<typeof UButtonGroup> = {
  title: "React/ButtonGroup",
  component: UButtonGroup,
};

export default meta;
type Story = StoryObj<typeof UButtonGroup>;

export const Default: Story = {
  render: () => (
    <UButtonGroup>
      <UButton label="One" />
      <UButton label="Two" />
      <UButton label="Three" />
    </UButtonGroup>
  ),
};
