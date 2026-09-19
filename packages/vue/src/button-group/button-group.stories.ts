import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UButton } from "../button";
import { UButtonGroup } from "./index";

const meta: Meta<typeof UButtonGroup> = {
  title: "Vue/ButtonGroup",
  component: UButtonGroup,
};

export default meta;
type Story = StoryObj<typeof UButtonGroup>;

export const Default: Story = {
  render: () => ({
    components: { UButtonGroup, UButton },
    template: `
      <UButtonGroup>
        <UButton label="One" />
        <UButton label="Two" />
        <UButton label="Three" />
      </UButtonGroup>
    `,
  }),
};
