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
  { label: "Files", icon: "pi pi-folder", items: [{ label: "Documents", items: [{ label: "Work" }] }, { label: "Photos" }] },
  { label: "Settings", icon: "pi pi-cog" },
];

export const Default: Story = {
  args: { model: defaultItems },
};

export const Multiple: Story = {
  args: { model: defaultItems, multiple: true },
};
