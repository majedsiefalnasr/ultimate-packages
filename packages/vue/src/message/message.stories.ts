import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UMessage } from "./index";

const meta: Meta<typeof UMessage> = {
  title: "Vue/Message",
  component: UMessage,
};

export default meta;
type Story = StoryObj<typeof UMessage>;

export const Default: Story = {
  args: { severity: "info" },
  render: (args) => ({
    components: { UMessage },
    setup: () => ({ args }),
    template: `<UMessage v-bind="args">This is an informational message.</UMessage>`,
  }),
};

export const Closable: Story = {
  args: { severity: "warn", closable: true },
  render: (args) => ({
    components: { UMessage },
    setup: () => ({ args }),
    template: `<UMessage v-bind="args">This message can be closed.</UMessage>`,
  }),
};
