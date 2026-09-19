import type { Meta, StoryObj } from "@storybook/react-vite";
import { UMenubar } from "./menubar";
import type { UMenuItem } from "../menu";

const meta: Meta<typeof UMenubar> = {
  title: "React/Menubar",
  component: UMenubar,
};

export default meta;
type Story = StoryObj<typeof UMenubar>;

const defaultItems: UMenuItem[] = [
  { label: "File", items: [{ label: "New" }, { label: "Open", items: [{ label: "Recent" }] }] },
  { label: "Edit", items: [{ label: "Undo" }, { label: "Redo" }] },
  { label: "Help", url: "/help" },
];

export const Default: Story = {
  args: { model: defaultItems },
};

export const WithDisabledItem: Story = {
  args: { model: [{ label: "File", items: [{ label: "New" }] }, { label: "Disabled", disabled: true }] },
};
