import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UToast } from "./index";

const meta: Meta<typeof UToast> = {
  title: "Vue/Toast",
  component: UToast,
};

export default meta;
type Story = StoryObj<typeof UToast>;

export const Default: Story = {
  render: () => ({ components: { UToast }, template: `<UToast />` }),
};
