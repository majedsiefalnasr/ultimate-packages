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
      [{ label: "Software", items: [{ label: "IDE", url: "/ide" }, { label: "OS", url: "/os" }] }],
      [{ label: "Hardware", items: [{ label: "Mouse", url: "/mouse" }, { label: "Keyboard", url: "/keyboard" }] }],
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
