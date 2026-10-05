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

/** GAP-064 G3-B verification story (Spec §8 C5): full-screen mask. */
export const FullScreen: Story = {
  args: { blocked: true, fullScreen: true },
  render: (args) => ({
    props: args,
    template: `
      <u-block-ui [blocked]="blocked" [fullScreen]="fullScreen" style="display: block; height: 150px; border: 1px dashed #999;">
        <p style="padding: 1rem;">Content that can be blocked.</p>
      </u-block-ui>
    `,
  }),
};
