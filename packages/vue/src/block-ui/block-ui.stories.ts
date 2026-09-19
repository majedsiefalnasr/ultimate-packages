import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UBlockUI } from "./index";

const meta: Meta<typeof UBlockUI> = {
  title: "Vue/BlockUI",
  component: UBlockUI,
};

export default meta;
type Story = StoryObj<typeof UBlockUI>;

export const Default: Story = {
  args: { blocked: true },
  render: (args) => ({
    components: { UBlockUI },
    setup: () => ({ args }),
    template: `
      <UBlockUI v-bind="args" style="display: block; height: 150px; border: 1px dashed #999;">
        <p style="padding: 1rem;">Content that can be blocked.</p>
      </UBlockUI>
    `,
  }),
};

export const Unblocked: Story = {
  args: { blocked: false },
  render: (args) => ({
    components: { UBlockUI },
    setup: () => ({ args }),
    template: `
      <UBlockUI v-bind="args" style="display: block; height: 150px; border: 1px dashed #999;">
        <p style="padding: 1rem;">Content that can be blocked.</p>
      </UBlockUI>
    `,
  }),
};
