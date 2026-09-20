import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { UButton } from "../button";
import { UButtonGroup } from "./button-group";

const meta: Meta<UButtonGroup> = {
  title: "Ng/ButtonGroup",
  component: UButtonGroup,
  decorators: [moduleMetadata({ imports: [UButton] })],
};

export default meta;
type Story = StoryObj<UButtonGroup>;

export const Default: Story = {
  render: () => ({
    template: `
      <u-button-group>
        <u-button label="One"></u-button>
        <u-button label="Two"></u-button>
        <u-button label="Three"></u-button>
      </u-button-group>
    `,
  }),
};
