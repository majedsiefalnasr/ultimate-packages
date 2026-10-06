import type { Meta, StoryObj } from "@storybook/angular";
import { UContextMenu } from "./context-menu";
import type { UMenuItem } from "@ultimate/ng-core";

/**
 * `UContextMenu` opens on a native `contextmenu` (right-click) event.
 * Default: the trigger is the `<u-context-menu>` host element itself, which
 * renders no content, so the story gives the host a visible hit area with
 * inline style; right-click inside the dashed box. Global: `global: true`
 * listens on the whole document; right-click anywhere.
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
    template: `<p style="margin: 0 0 0.5rem;">Right-click inside the dashed box.</p><u-context-menu [model]="model" style="display: block; min-height: 6rem; border: 1px dashed #999;"></u-context-menu>`,
  }),
};

export const Global: Story = {
  args: { model: items, global: true },
  render: (args) => ({
    props: args,
    template: `<div>Right-click anywhere on the page.<u-context-menu [model]="model" [global]="global"></u-context-menu></div>`,
  }),
};
