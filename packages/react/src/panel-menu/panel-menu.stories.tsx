import type { Meta, StoryObj } from "@storybook/react-vite";
import { UPanelMenu } from "./panel-menu";
import type { UMenuItem } from "../menu";

const meta: Meta<typeof UPanelMenu> = {
  title: "React/PanelMenu",
  component: UPanelMenu,
};

export default meta;
type Story = StoryObj<typeof UPanelMenu>;

const defaultItems: UMenuItem[] = [
  { label: "Files", items: [{ label: "Documents", items: [{ label: "Work" }] }, { label: "Photos" }] },
  { label: "Settings" },
];

export const Default: Story = {
  args: { model: defaultItems },
};

export const Multiple: Story = {
  args: { model: defaultItems, multiple: true },
};
