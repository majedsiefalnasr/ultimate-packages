import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UTerminal } from "./index";

const meta: Meta<typeof UTerminal> = {
  title: "Vue/Terminal",
  component: UTerminal,
};

export default meta;
type Story = StoryObj<typeof UTerminal>;

export const Default: Story = {
  args: { welcomeMessage: "Welcome to Ultimate Terminal", prompt: "ultimate$" },
  render: (args) => ({
    components: { UTerminal },
    setup: () => ({ args }),
    template: `<UTerminal v-bind="args" />`,
  }),
};
