import type { Meta, StoryObj } from "@storybook/angular";
import { UTag } from "./tag";

const meta: Meta<UTag> = {
  title: "Ng/Tag",
  component: UTag,
};

export default meta;
type Story = StoryObj<UTag>;

export const Default: Story = {
  render: () => ({ template: `<u-tag>New</u-tag>` }),
};

export const Severity: Story = {
  render: () => ({ template: `<u-tag severity="success">Success</u-tag>` }),
};

/** GAP-064 G3-A verification story: all six severities. */
export const AllSeverities: Story = {
  render: () => ({
    template: `
      <u-tag severity="success" value="Success"></u-tag>
      <u-tag severity="info" value="Info"></u-tag>
      <u-tag severity="warn" value="Warn"></u-tag>
      <u-tag severity="danger" value="Danger"></u-tag>
      <u-tag severity="secondary" value="Secondary"></u-tag>
      <u-tag severity="contrast" value="Contrast"></u-tag>
    `,
  }),
};
