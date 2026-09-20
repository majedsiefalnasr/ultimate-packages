import type { Meta, StoryObj } from "@storybook/react-vite";
import { UMegaMenu } from "./mega-menu";
import type { UMegaMenuItem } from "./mega-menu-item";

const meta: Meta<typeof UMegaMenu> = {
  title: "React/MegaMenu",
  component: UMegaMenu,
};

export default meta;
type Story = StoryObj<typeof UMegaMenu>;

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
