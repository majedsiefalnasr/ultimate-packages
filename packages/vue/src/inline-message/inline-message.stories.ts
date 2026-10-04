import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UInlineMessage } from "./index";

const meta: Meta<typeof UInlineMessage> = {
  title: "Vue/InlineMessage",
  component: UInlineMessage,
};

export default meta;
type Story = StoryObj<typeof UInlineMessage>;

export const Default: Story = {
  args: { severity: "error" },
  render: (args) => ({
    components: { UInlineMessage },
    setup: () => ({ args }),
    template: `<UInlineMessage v-bind="args">Something went wrong.</UInlineMessage>`,
  }),
};

export const Success: Story = {
  args: { severity: "success" },
  render: (args) => ({
    components: { UInlineMessage },
    setup: () => ({ args }),
    template: `<UInlineMessage v-bind="args">Saved successfully.</UInlineMessage>`,
  }),
};

/** GAP-064 G3-A verification story: all six severities. */
export const AllSeverities: Story = {
  render: () => ({
    components: { UInlineMessage },
    template: `
      <UInlineMessage severity="success">Success</UInlineMessage>
      <UInlineMessage severity="info">Info</UInlineMessage>
      <UInlineMessage severity="warn">Warn</UInlineMessage>
      <UInlineMessage severity="error">Error</UInlineMessage>
      <UInlineMessage severity="secondary">Secondary</UInlineMessage>
      <UInlineMessage severity="contrast">Contrast</UInlineMessage>
    `,
  }),
};
