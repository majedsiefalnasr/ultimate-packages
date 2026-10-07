import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UMenubar } from "./index";

const meta: Meta<typeof UMenubar> = {
  title: "Vue/Menubar",
  component: UMenubar,
};

export default meta;
type Story = StoryObj<typeof UMenubar>;

const model = [
  { label: "File", items: [{ label: "New" }, { label: "Open", items: [{ label: "Recent" }] }] },
  { label: "Edit", items: [{ label: "Undo" }, { label: "Redo" }] },
  { label: "Help", url: "/help" },
];

/** Default state — top-level items, one with a nested drill-down submenu. */
export const Default: Story = {
  args: {
    model,
  },
};

/** GAP-064 G3-C2 verification story (Spec §9.1): disabled items, icons, separators and two nested levels. */
export const ItemStates: Story = {
  args: {
    model: [
      {
        label: "File",
        icon: "pi pi-file",
        items: [
          { label: "New", icon: "pi pi-plus" },
          { separator: true },
          { label: "Open", icon: "pi pi-folder-open", items: [{ label: "Recent" }] },
        ],
      },
      { label: "Edit", icon: "pi pi-pencil", disabled: true, items: [{ label: "Undo" }] },
      { separator: true },
      { label: "Archived", url: "#archived", disabled: true },
    ],
  },
};
