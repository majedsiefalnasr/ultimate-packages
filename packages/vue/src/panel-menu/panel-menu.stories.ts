import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UPanelMenu } from "./index";

const meta: Meta<typeof UPanelMenu> = {
  title: "Vue/PanelMenu",
  component: UPanelMenu,
};

export default meta;
type Story = StoryObj<typeof UPanelMenu>;

const model = [
  { label: "File", items: [{ label: "New" }, { label: "Open", items: [{ label: "Recent" }] }] },
  { label: "Edit", items: [{ label: "Undo" }, { label: "Redo" }] },
  { label: "Help", url: "/help" },
];

/** Default state — only one branch expanded at a time. */
export const Default: Story = {
  args: {
    model,
  },
};

/** Multiple concurrently-expanded branches. */
export const Multiple: Story = {
  args: {
    model,
    multiple: true,
  },
};
