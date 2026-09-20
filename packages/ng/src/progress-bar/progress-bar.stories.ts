import type { Meta, StoryObj } from "@storybook/angular";
import { UProgressBar } from "./progress-bar";

const meta: Meta<UProgressBar> = {
  title: "Ng/ProgressBar",
  component: UProgressBar,
};

export default meta;
type Story = StoryObj<UProgressBar>;

export const Determinate: Story = {
  args: { value: 60 },
  render: (args) => ({
    props: args,
    template: `<u-progress-bar [value]="value"></u-progress-bar>`,
  }),
};

export const Indeterminate: Story = {
  args: { mode: "indeterminate" },
  render: (args) => ({
    props: args,
    template: `<u-progress-bar [mode]="mode"></u-progress-bar>`,
  }),
};
