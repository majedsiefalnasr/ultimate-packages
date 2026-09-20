import type { Meta, StoryObj } from "@storybook/angular";
import { UToast } from "./toast";

const meta: Meta<UToast> = {
  title: "Ng/Toast",
  component: UToast,
};

export default meta;
type Story = StoryObj<UToast>;

export const Default: Story = {
  render: () => ({ template: `<u-toast></u-toast>` }),
};
