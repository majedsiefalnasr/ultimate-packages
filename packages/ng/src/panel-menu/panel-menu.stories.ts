import { provideRouter } from "@angular/router";
import type { Meta, StoryObj } from "@storybook/angular";
import { applicationConfig } from "@storybook/angular";
import { UPanelMenu } from "./panel-menu";
import type { UMenuItem } from "@ultimate/ng-core";

const meta: Meta<UPanelMenu> = {
  title: "Ng/PanelMenu",
  component: UPanelMenu,
  decorators: [applicationConfig({ providers: [provideRouter([])] })],
};

export default meta;
type Story = StoryObj<UPanelMenu>;

const defaultItems: UMenuItem[] = [
  {
    label: "Files",
    icon: "pi pi-folder",
    items: [{ label: "Documents", items: [{ label: "Work" }] }, { label: "Photos" }],
  },
  { label: "Settings", icon: "pi pi-cog" },
];

export const Default: Story = {
  args: { model: defaultItems },
};

export const Multiple: Story = {
  args: { model: defaultItems, multiple: true },
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
