import type { Meta, StoryObj } from "@storybook/react-vite";
import { UPanel } from "./panel";

const meta: Meta<typeof UPanel> = {
  title: "React/Panel",
  component: UPanel,
};

export default meta;
type Story = StoryObj<typeof UPanel>;

export const Default: Story = {
  args: { header: "Panel", children: <p>Panel content.</p> },
};

export const Toggleable: Story = {
  args: { header: "Toggleable Panel", toggleable: true, children: <p>Panel content.</p> },
};
