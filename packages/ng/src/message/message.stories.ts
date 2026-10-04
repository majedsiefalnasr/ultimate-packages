import type { Meta, StoryObj } from "@storybook/angular";
import { UMessage } from "./message";

const meta: Meta<UMessage> = {
  title: "Ng/Message",
  component: UMessage,
};

export default meta;
type Story = StoryObj<UMessage>;

export const Default: Story = {
  args: { severity: "info" },
  render: (args) => ({
    props: args,
    template: `<u-message [severity]="severity">This is an informational message.</u-message>`,
  }),
};

export const Closable: Story = {
  args: { severity: "warn", closable: true },
  render: (args) => ({
    props: args,
    template: `<u-message [severity]="severity" [closable]="closable">This message can be closed.</u-message>`,
  }),
};

/** GAP-064 G3-A verification story: all six severities. */
export const AllSeverities: Story = {
  render: () => ({
    template: `
      <u-message severity="success">Success message</u-message>
      <u-message severity="info">Info message</u-message>
      <u-message severity="warn">Warn message</u-message>
      <u-message severity="error">Error message</u-message>
      <u-message severity="secondary">Secondary message</u-message>
      <u-message severity="contrast">Contrast message</u-message>
    `,
  }),
};
