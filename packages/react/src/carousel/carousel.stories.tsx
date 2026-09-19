import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UCarousel } from "./carousel";

const meta: Meta<typeof UCarousel> = {
  title: "React/Carousel",
  component: UCarousel,
};

export default meta;
type Story = StoryObj<typeof UCarousel>;

const items = Array.from({ length: 8 }, (_, i) => `Item ${i + 1}`);

export const Default: Story = {
  render: () => (
    <UCarousel
      value={items}
      numVisible={3}
      numScroll={1}
      itemTemplate={(item) => (
        <div style={{ padding: "1rem", textAlign: "center", border: "1px solid #ddd", margin: "0 0.5rem" }}>
          {item}
        </div>
      )}
    />
  ),
};

export const CircularWithAutoplay: Story = {
  render: () => (
    <UCarousel
      value={items}
      numVisible={1}
      circular
      autoplayInterval={3000}
      itemTemplate={(item) => (
        <div style={{ padding: "2rem", textAlign: "center", border: "1px solid #ddd" }}>{item}</div>
      )}
    />
  ),
};
