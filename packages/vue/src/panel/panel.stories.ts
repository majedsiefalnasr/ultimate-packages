import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UPanel } from "./index";

const meta: Meta<typeof UPanel> = {
  title: "Vue/Panel",
  component: UPanel,
};

export default meta;
type Story = StoryObj<typeof UPanel>;

export const Default: Story = {
  args: { header: "Panel" },
  render: (args) => ({
    components: { UPanel },
    setup: () => ({ args }),
    template: `<UPanel v-bind="args"><p>Panel content.</p></UPanel>`,
  }),
};

export const Toggleable: Story = {
  args: { header: "Toggleable Panel", toggleable: true },
  render: (args) => ({
    components: { UPanel },
    setup: () => ({ args }),
    template: `<UPanel v-bind="args"><p>Panel content.</p></UPanel>`,
  }),
};
