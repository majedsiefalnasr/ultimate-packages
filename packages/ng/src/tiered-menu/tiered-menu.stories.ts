import { provideRouter } from "@angular/router";
import type { Meta, StoryObj } from "@storybook/angular";
import { applicationConfig } from "@storybook/angular";
import { UTieredMenu } from "./tiered-menu";
import type { UMenuItem } from "@ultimate/ng-core";

const meta: Meta<UTieredMenu> = {
  title: "Ng/TieredMenu",
  component: UTieredMenu,
  decorators: [applicationConfig({ providers: [provideRouter([])] })],
};

export default meta;
type Story = StoryObj<UTieredMenu>;

const defaultItems: UMenuItem[] = [
  { label: "File", items: [{ label: "New" }, { label: "Open", items: [{ label: "Recent" }] }] },
  { label: "Edit", items: [{ label: "Undo" }, { label: "Redo" }] },
];

export const Default: Story = {
  args: { model: defaultItems },
};

export const Popup: Story = {
  args: { model: defaultItems, popup: true },
};
