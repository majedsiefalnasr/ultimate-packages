import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UProgressSpinner } from "./index";

const meta: Meta<typeof UProgressSpinner> = {
  title: "Vue/ProgressSpinner",
  component: UProgressSpinner,
};

export default meta;
type Story = StoryObj<typeof UProgressSpinner>;

export const Default: Story = {
  render: () => ({
    components: { UProgressSpinner },
    template: `<UProgressSpinner />`,
  }),
};
