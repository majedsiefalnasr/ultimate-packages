import type { Meta, StoryObj } from "@storybook/angular";
import { UToolbar } from "./toolbar";

const meta: Meta<UToolbar> = {
  title: "Ng/Toolbar",
  component: UToolbar,
};

export default meta;
type Story = StoryObj<UToolbar>;

export const Default: Story = {
  render: () => ({
    template: `<u-toolbar>
      <ng-template #start>Left</ng-template>
      <ng-template #end>Right</ng-template>
    </u-toolbar>`,
  }),
};
