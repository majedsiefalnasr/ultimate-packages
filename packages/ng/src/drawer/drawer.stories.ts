import { Component, type OnDestroy, type OnInit } from "@angular/core";
import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
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

const at = (position: "top" | "bottom" | "full", header: string): Story => ({
  args: { visible: true, header, position },
  render: (args) => ({
    props: args,
    template: `<u-drawer [visible]="visible" [header]="header" [position]="position">Drawer body content.</u-drawer>`,
  }),
});

/** GAP-064 G3-D verification stories (Spec §9.1): the remaining positions. */
export const Top: Story = at("top", "Top");
export const Bottom: Story = at("bottom", "Bottom");
export const Full: Story = at("full", "Full");

/** Sets `dir="rtl"` on <html> while mounted (the drawer is appended to body) and restores it on destroy. */
@Component({
  selector: "g3d-rtl-drawer",
  standalone: true,
  imports: [UDrawer],
  template: `<u-drawer [visible]="true" header="RTL">Drawer body content.</u-drawer>`,
})
class RtlDrawerDemo implements OnInit, OnDestroy {
  private previous = "";
  ngOnInit(): void {
    this.previous = document.documentElement.dir;
    document.documentElement.dir = "rtl";
  }
  ngOnDestroy(): void {
    document.documentElement.dir = this.previous;
  }
}

/** GAP-064 G3-D verification story (Spec §9.1, OI-D3): a left drawer under `dir="rtl"` (group 23). */
export const Rtl: Story = {
  decorators: [moduleMetadata({ imports: [RtlDrawerDemo] })],
  render: () => ({ template: `<g3d-rtl-drawer></g3d-rtl-drawer>` }),
};
