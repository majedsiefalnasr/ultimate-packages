import type { Meta, StoryObj } from "@storybook/angular";
import { UProgressSpinner } from "./progress-spinner";

const meta: Meta<UProgressSpinner> = {
  title: "Ng/ProgressSpinner",
  component: UProgressSpinner,
};

export default meta;
type Story = StoryObj<UProgressSpinner>;

export const Default: Story = {
  render: () => ({
    template: `<u-progress-spinner></u-progress-spinner>`,
  }),
};
