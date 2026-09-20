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
