import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UProgressBar } from "./index";

const meta: Meta<typeof UProgressBar> = {
  title: "Vue/ProgressBar",
  component: UProgressBar,
};

export default meta;
type Story = StoryObj<typeof UProgressBar>;

export const Determinate: Story = {
  args: { value: 60 },
  render: (args) => ({
    components: { UProgressBar },
    setup: () => ({ args }),
    template: `<UProgressBar v-bind="args" />`,
  }),
};

export const Indeterminate: Story = {
  args: { mode: "indeterminate" },
  render: (args) => ({
    components: { UProgressBar },
    setup: () => ({ args }),
    template: `<UProgressBar v-bind="args" />`,
  }),
};
