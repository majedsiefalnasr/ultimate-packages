import type { Meta, StoryObj } from "@storybook/react-vite";
import { UDataScroller } from "./data-scroller";

const items = Array.from({ length: 30 }, (_, i) => `Item ${i + 1}`);

const meta: Meta<typeof UDataScroller> = {
  title: "React/DataScroller",
  component: UDataScroller,
};

export default meta;
type Story = StoryObj<typeof UDataScroller>;

export const Default: Story = {
  args: {
    value: items,
    rows: 5,
    itemTemplate: (item) => <div key={item as string} style={{ padding: "0.5rem" }}>{item as string}</div>,
  },
};

export const Inline: Story = {
  args: {
    value: items,
    rows: 5,
    inline: true,
    scrollHeight: "250px",
    itemTemplate: (item) => <div key={item as string} style={{ padding: "0.5rem" }}>{item as string}</div>,
  },
};
