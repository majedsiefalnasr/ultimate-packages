import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UCard } from "./card";

const meta: Meta<typeof UCard> = {
  title: "React/Card",
  component: UCard,
};

export default meta;
type Story = StoryObj<typeof UCard>;

export const Default: Story = {
  args: { title: "Simple Card", subTitle: "Card subtitle" },
  render: (args) => (
    <UCard {...args}>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </UCard>
  ),
};

export const WithHeaderAndFooter: Story = {
  render: () => (
    <UCard
      title="Advanced Card"
      header={
        <img
          src="https://primefaces.org/cdn/primereact/images/usercard.jpg"
          style={{ width: "100%", display: "block" }}
        />
      }
      footer={
        <div>
          <button type="button">Cancel</button>
          <button type="button">Save</button>
        </div>
      }
    >
      <p>Card content with a header image and footer actions.</p>
    </UCard>
  ),
};
