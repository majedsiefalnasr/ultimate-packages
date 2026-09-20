import type { Meta, StoryObj } from "@storybook/angular";
import { UBlockUI } from "./block-ui";

const meta: Meta<UBlockUI> = {
  title: "Ng/BlockUI",
  component: UBlockUI,
};

export default meta;
type Story = StoryObj<UBlockUI>;

export const Default: Story = {
  args: { blocked: true },
  render: (args) => ({
    props: args,
    template: `
      <u-block-ui [blocked]="blocked" style="display: block; height: 150px; border: 1px dashed #999;">
        <p style="padding: 1rem;">Content that can be blocked.</p>
      </u-block-ui>
    `,
  }),
};

export const Unblocked: Story = {
  args: { blocked: false },
  render: (args) => ({
    props: args,
    template: `
      <u-block-ui [blocked]="blocked" style="display: block; height: 150px; border: 1px dashed #999;">
        <p style="padding: 1rem;">Content that can be blocked.</p>
      </u-block-ui>
    `,
  }),
};
