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
  { label: "File", icon: "pi pi-file", items: [{ label: "New" }, { label: "Open", items: [{ label: "Recent" }] }] },
  { label: "Edit", items: [{ label: "Undo" }, { label: "Redo" }] },
  { label: "Help", url: "/help" },
];

export const Default: Story = {
  args: { model: defaultItems },
};

export const WithDisabledItem: Story = {
  args: {
    model: [{ label: "File", items: [{ label: "New" }] }, { label: "Disabled", disabled: true }],
  },
};
