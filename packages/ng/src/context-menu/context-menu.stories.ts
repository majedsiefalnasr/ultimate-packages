import type { Meta, StoryObj } from "@storybook/angular";
import { UContextMenu } from "./context-menu";
import type { UMenuItem } from "@ultimate/ng-core";

/**
 * `UContextMenu` activates on the host element's native `contextmenu`
 * (right-click) event — right-click inside the story's canvas area to open
 * it, matching real PrimeNG `ContextMenu`'s own activation mechanism.
 */
const meta: Meta<UContextMenu> = {
  title: "Ng/ContextMenu",
  component: UContextMenu,
};

export default meta;
type Story = StoryObj<UContextMenu>;

const items: UMenuItem[] = [
  { label: "Copy", icon: "pi pi-copy" },
  { label: "Paste", icon: "pi pi-clone" },
  { label: "Delete", icon: "pi pi-trash", disabled: true },
];

export const Default: Story = {
  args: { model: items },
  render: (args) => ({
    props: args,
    template: `<div style="padding: 2rem; border: 1px dashed #999;">Right-click here.<u-context-menu [model]="model"></u-context-menu></div>`,
  }),
};

export const Global: Story = {
  args: { model: items, global: true },
  render: (args) => ({
    props: args,
    template: `<div>Right-click anywhere on the page.<u-context-menu [model]="model" [global]="global"></u-context-menu></div>`,
  }),
};
