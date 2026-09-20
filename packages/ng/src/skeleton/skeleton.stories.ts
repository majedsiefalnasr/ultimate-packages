import type { Meta, StoryObj } from "@storybook/angular";
import { USkeleton } from "./skeleton";

const meta: Meta<USkeleton> = {
  title: "Ng/Skeleton",
  component: USkeleton,
};

export default meta;
type Story = StoryObj<USkeleton>;

export const Default: Story = {
  render: () => ({ template: `<u-skeleton></u-skeleton>` }),
};

export const Circle: Story = {
  render: () => ({ template: `<u-skeleton shape="circle" size="4rem"></u-skeleton>` }),
};
