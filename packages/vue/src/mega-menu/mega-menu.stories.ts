import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UMegaMenu } from "./index";

const meta: Meta<typeof UMegaMenu> = {
  title: "Vue/MegaMenu",
  component: UMegaMenu,
};

export default meta;
type Story = StoryObj<typeof UMegaMenu>;

const model = [
  {
    label: "Products",
    items: [
      [
        {
          label: "Software",
          items: [
            { label: "IDE", url: "/ide" },
            { label: "OS", url: "/os" },
          ],
        },
      ],
      [
        {
          label: "Hardware",
          items: [
            { label: "Mouse", url: "/mouse" },
            { label: "Keyboard", url: "/keyboard" },
          ],
        },
      ],
    ],
  },
  { label: "About", url: "/about" },
  { label: "Contact", url: "/contact", disabled: true },
];

/** Default state — a root item with a two-column overlay grid, plus flat leaf items. */
export const Default: Story = {
  args: {
    model,
  },
};

/** GAP-064 G3-C2 verification story (Spec §9.1): disabled items and icons (MegaMenu renders no separator). */
export const ItemStates: Story = {
  args: {
    model: [
      {
        label: "Products",
        icon: "pi pi-box",
        items: [
          [
            {
              label: "Category A",
              items: [
                { label: "Item A1", icon: "pi pi-star" },
                { label: "Item A2", disabled: true },
              ],
            },
          ],
          [{ label: "Category B", items: [{ label: "Item B1" }] }],
        ],
      },
      {
        label: "Services",
        icon: "pi pi-cog",
        disabled: true,
        items: [[{ label: "Category C", items: [{ label: "Item C1" }] }]],
      },
      { label: "Contact", url: "#contact", disabled: true },
    ],
  },
};
