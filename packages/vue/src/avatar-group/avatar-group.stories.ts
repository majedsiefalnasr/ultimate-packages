import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UAvatar } from "../avatar";
import { UAvatarGroup } from "./index";

const meta: Meta<typeof UAvatarGroup> = {
  title: "Vue/AvatarGroup",
  component: UAvatarGroup,
};

export default meta;
type Story = StoryObj<typeof UAvatarGroup>;

export const Default: Story = {
  render: () => ({
    components: { UAvatarGroup, UAvatar },
    template: `
      <UAvatarGroup>
        <UAvatar label="A" shape="circle" />
        <UAvatar label="B" shape="circle" />
        <UAvatar label="C" shape="circle" />
        <UAvatar label="+3" shape="circle" />
      </UAvatarGroup>
    `,
  }),
};
