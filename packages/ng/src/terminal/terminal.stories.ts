import type { Meta, StoryObj } from "@storybook/angular";
import { UTerminal } from "./terminal";

const meta: Meta<UTerminal> = {
  title: "Ng/Terminal",
  component: UTerminal,
};

export default meta;
type Story = StoryObj<UTerminal>;

export const Default: Story = {
  render: () => ({
    template: `<u-terminal welcomeMessage="Welcome to Ultimate Terminal" prompt="ultimate$"></u-terminal>`,
  }),
};
