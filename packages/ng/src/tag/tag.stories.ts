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
