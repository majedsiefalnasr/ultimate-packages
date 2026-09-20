import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UTag } from "./index";

const meta: Meta<typeof UTag> = {
  title: "Vue/Tag",
  component: UTag,
};

export default meta;
type Story = StoryObj<typeof UTag>;

export const Default: Story = {
  render: () => ({ components: { UTag }, template: `<UTag>New</UTag>` }),
};

export const Severity: Story = {
  render: () => ({ components: { UTag }, template: `<UTag severity="success">Success</UTag>` }),
};
