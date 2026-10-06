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

/** GAP-064 G3-C2 verification story (Spec §9.1): top-level and nested disabled items and icons, two nested levels. */
export const ItemStates: Story = {
  args: {
    model: [
      {
        label: "Files",
        icon: "pi pi-folder",
        items: [
          {
            label: "Documents",
            icon: "pi pi-file",
            items: [
              { label: "Work", icon: "pi pi-briefcase" },
              { label: "Old", disabled: true },
            ],
          },
          { label: "Photos", disabled: true, items: [{ label: "Trip" }] },
        ],
      },
      { label: "Settings", icon: "pi pi-cog", disabled: true, items: [{ label: "Profile" }] },
      { label: "Help", icon: "pi pi-question", url: "#help" },
    ],
  },
};
