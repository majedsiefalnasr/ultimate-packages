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

/** GAP-064 G3-A verification story: all six severities. */
export const AllSeverities: Story = {
  render: () => ({
    components: { UMessage },
    template: `
      <UMessage severity="success">Success message</UMessage>
      <UMessage severity="info">Info message</UMessage>
      <UMessage severity="warn">Warn message</UMessage>
      <UMessage severity="error">Error message</UMessage>
      <UMessage severity="secondary">Secondary message</UMessage>
      <UMessage severity="contrast">Contrast message</UMessage>
    `,
  }),
};
