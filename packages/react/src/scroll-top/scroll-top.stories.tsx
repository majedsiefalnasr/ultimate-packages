import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UScrollTop } from "./scroll-top";

const meta: Meta<typeof UScrollTop> = {
  title: "React/ScrollTop",
  component: UScrollTop,
};

export default meta;
type Story = StoryObj<typeof UScrollTop>;

export const Default: Story = {
  args: { threshold: 100 },
  render: (args) => (
    <div>
      <div style={{ height: 2000 }}>
        <p>Scroll down to reveal the scroll-to-top button.</p>
      </div>
      <UScrollTop {...args} />
    </div>
  ),
};
