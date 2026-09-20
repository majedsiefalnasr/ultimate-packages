import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { USkeleton } from "./index";

const meta: Meta<typeof USkeleton> = {
  title: "Vue/Skeleton",
  component: USkeleton,
};

export default meta;
type Story = StoryObj<typeof USkeleton>;

export const Default: Story = {
  render: () => ({ components: { USkeleton }, template: `<USkeleton />` }),
};

export const Circle: Story = {
  render: () => ({
    components: { USkeleton },
    template: `<USkeleton shape="circle" size="4rem" />`,
  }),
};
