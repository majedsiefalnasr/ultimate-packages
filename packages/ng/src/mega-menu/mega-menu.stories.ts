import { provideRouter } from "@angular/router";
import type { Meta, StoryObj } from "@storybook/angular";
import { applicationConfig } from "@storybook/angular";
import { UMegaMenu } from "./mega-menu";
import type { UMegaMenuItem } from "./mega-menu-item";

const meta: Meta<UMegaMenu> = {
  title: "Ng/MegaMenu",
  component: UMegaMenu,
  decorators: [applicationConfig({ providers: [provideRouter([])] })],
};

export default meta;
type Story = StoryObj<UMegaMenu>;

const defaultItems: UMegaMenuItem[] = [
  {
    label: "Products",
    items: [
      [{ label: "Category A", items: [{ label: "Item A1" }, { label: "Item A2" }] }],
      [{ label: "Category B", items: [{ label: "Item B1" }] }],
    ],
  },
  { label: "About", url: "/about" },
];

export const Default: Story = {
  args: { model: defaultItems },
};
