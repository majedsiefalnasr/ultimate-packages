import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UAccordion, type UAccordionPanel } from "./accordion";

const meta: Meta<typeof UAccordion> = {
  title: "React/Accordion",
  component: UAccordion,
};

export default meta;
type Story = StoryObj<typeof UAccordion>;

const panels: UAccordionPanel[] = [
  { value: "0", header: "Header I", content: <p>Content for Header I.</p> },
  { value: "1", header: "Header II", content: <p>Content for Header II.</p> },
  { value: "2", header: "Header III", content: <p>Content for Header III.</p>, disabled: true },
];

export const Default: Story = {
  args: { panels },
};

export const Multiple: Story = {
  args: { panels, multiple: true },
};
