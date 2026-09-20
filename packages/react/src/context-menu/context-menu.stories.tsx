import type { Meta, StoryObj } from "@storybook/react-vite";
import { UContextMenu, type UContextMenuItem } from "./context-menu";

/**
 * `UContextMenu` activates on its trigger content's native `contextmenu`
 * (right-click) event — right-click inside the story's canvas area to open
 * it, matching real PrimeReact `ContextMenu`'s own activation mechanism.
 */
const meta: Meta<typeof UContextMenu> = {
  title: "React/ContextMenu",
  component: UContextMenu,
};

export default meta;
type Story = StoryObj<typeof UContextMenu>;

const items: UContextMenuItem[] = [
  { label: "Copy" },
  { label: "Paste" },
  { label: "Delete", disabled: true },
];

export const Default: Story = {
  args: { model: items },
  render: (args) => (
    <UContextMenu {...args}>
      <div style={{ padding: "2rem", border: "1px dashed #999" }}>Right-click here.</div>
    </UContextMenu>
  ),
};

export const Global: Story = {
  args: { model: items, global: true },
  render: (args) => (
    <UContextMenu {...args}>
      <div>Right-click anywhere on the page.</div>
    </UContextMenu>
  ),
};
