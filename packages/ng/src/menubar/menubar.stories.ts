import { provideRouter } from "@angular/router";
import type { Meta, StoryObj } from "@storybook/angular";
import { applicationConfig } from "@storybook/angular";
import { UMenubar } from "./menubar";
import type { UMenuItem } from "@ultimate/ng-core";

const meta: Meta<UMenubar> = {
  title: "Ng/Menubar",
  component: UMenubar,
  decorators: [applicationConfig({ providers: [provideRouter([])] })],
};

export default meta;
type Story = StoryObj<UMenubar>;

const defaultItems: UMenuItem[] = [
  {
    label: "File",
    icon: "pi pi-file",
    items: [{ label: "New" }, { label: "Open", items: [{ label: "Recent" }] }],
  },
  { label: "Edit", items: [{ label: "Undo" }, { label: "Redo" }] },
  { label: "Help", url: "/help" },
];

export const Default: Story = {
  args: { model: defaultItems },
};

export const WithDisabledItem: Story = {
  args: {
    model: [
      { label: "File", items: [{ label: "New" }] },
      { label: "Disabled", disabled: true },
    ],
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
