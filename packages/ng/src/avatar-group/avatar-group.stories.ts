import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { UAvatar } from "../avatar";
import { UAvatarGroup } from "./avatar-group";

const meta: Meta<UAvatarGroup> = {
  title: "Ng/AvatarGroup",
  component: UAvatarGroup,
  decorators: [moduleMetadata({ imports: [UAvatar] })],
};

export default meta;
type Story = StoryObj<UAvatarGroup>;

export const Default: Story = {
  render: () => ({
    template: `
      <u-avatar-group>
        <u-avatar label="A" shape="circle"></u-avatar>
        <u-avatar label="B" shape="circle"></u-avatar>
        <u-avatar label="C" shape="circle"></u-avatar>
        <u-avatar label="+3" shape="circle"></u-avatar>
      </u-avatar-group>
    `,
  }),
};
