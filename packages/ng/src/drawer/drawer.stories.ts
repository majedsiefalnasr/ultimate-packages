import type { Meta, StoryObj } from "@storybook/angular";
import { UDrawer } from "./drawer";

const meta: Meta<UDrawer> = {
  title: "Ng/Drawer",
  component: UDrawer,
};

export default meta;
type Story = StoryObj<UDrawer>;

/** Default state — closed (visible=false is UDrawer's own input default). */
export const Default: Story = {
  args: {
    header: "Menu",
  },
};

export const Open: Story = {
  args: {
    visible: true,
    header: "Menu",
  },
  render: (args) => ({
    props: args,
    template: `<u-drawer [visible]="visible" [header]="header">Drawer body content.</u-drawer>`,
  }),
};

export const RightPosition: Story = {
  args: {
    visible: true,
    header: "Settings",
    position: "right",
  },
  render: (args) => ({
    props: args,
    template: `<u-drawer [visible]="visible" [header]="header" [position]="position">Right-positioned drawer.</u-drawer>`,
  }),
};
