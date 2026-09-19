import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UTieredMenu } from "./index";

const meta: Meta<typeof UTieredMenu> = {
  title: "Vue/TieredMenu",
  component: UTieredMenu,
};

export default meta;
type Story = StoryObj<typeof UTieredMenu>;

const model = [
  { label: "File", items: [{ label: "New" }, { label: "Open", items: [{ label: "Recent" }] }] },
  { label: "Edit" },
];

/** Default state — inline mode (popup=false, UTieredMenu's own default). */
export const Default: Story = {
  args: {
    model,
  },
};
