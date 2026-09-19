import type { Meta, StoryObj } from "@storybook/react-vite";
import { UTieredMenu } from "./tiered-menu";
import type { UMenuItem } from "../menu";

const meta: Meta<typeof UTieredMenu> = {
  title: "React/TieredMenu",
  component: UTieredMenu,
};

export default meta;
type Story = StoryObj<typeof UTieredMenu>;

const defaultItems: UMenuItem[] = [
  { label: "File", items: [{ label: "New" }, { label: "Open", items: [{ label: "Recent" }] }] },
  { label: "Edit", items: [{ label: "Undo" }, { label: "Redo" }] },
];

export const Default: Story = {
  args: { model: defaultItems },
};

export const Popup: Story = {
  args: { model: defaultItems, popup: true },
};
